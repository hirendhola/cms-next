/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// // app/api/onboarding/complete-setup/route.ts
// import { NextResponse } from 'next/server';
// import { OnboardingStatus } from '@prisma/client';
// import { z } from 'zod';
// import { prisma } from '@/lib/prisma';

// const setupSchemaBackend = z.object({
//   token: z.string(),
//   name: z.string().min(5),
//   code: z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
//   address: z.string().optional().default(''),
//   city: z.string().optional().default(''),
//   state: z.string().optional().default(''),
//   postalCode: z.string().optional().default(''),
//   phone: z.string().optional().default(''),
//   website: z.string().url().optional().or(z.literal('')).default(''),
//   country: z.string().optional().default('India'),
// });

// export async function POST(req: Request) {
//   let requestToken: string | null = null; // For error logging if validation fails early

//   try {
//     const body = await req.json();
//     requestToken = body?.token; // Get token early for potential error logging
//     const validation = setupSchemaBackend.safeParse(body);

//     if (!validation.success) {
//       return NextResponse.json({ success: false, error: "Invalid input data.", details: validation.error.flatten().fieldErrors }, { status: 400 });
//     }

//     const { token, code, ...instituteData } = validation.data;
//     const lowerCaseCode = code.toLowerCase();

//     // 1. Verify Token and Request Status again (critical check)
//     const request = await prisma.onboardingRequest.findUnique({
//       where: { onboardingToken: token },
//     });

//     // Combine checks for cleaner logic
//     if (!request || request.status !== OnboardingStatus.INITIATED || !request.tokenExpiresAt || request.tokenExpiresAt < new Date()) {
//       let errorMsg = 'Invalid or expired setup link.';
//       if (request) { // If request exists, provide more specific status
//         if (request.status !== OnboardingStatus.INITIATED) {
//           errorMsg = `Setup cannot proceed. Current status: ${request.status}.`;
//         } else if (request.tokenExpiresAt && request.tokenExpiresAt < new Date()) {
//           errorMsg = 'This setup link has expired.';
//           // Update status to EXPIRED
//           await prisma.onboardingRequest.update({ where: { id: request.id }, data: { status: OnboardingStatus.EXPIRED, onboardingToken: null } }).catch(console.error);
//         }
//       }
//       return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
//     }

//     // 2. Check Institute Code Uniqueness (CRITICAL)
//     const existingInstitute = await prisma.institution.findUnique({
//       where: { code: lowerCaseCode },
//       select: { id: true } // Only need to know if it exists
//     });
//     if (existingInstitute) {
//       return NextResponse.json({ success: false, error: `Institute code '${lowerCaseCode}' is already taken. Please choose a different one.` }, { status: 409 });
//     }

//     // --- Transaction ---
//     const result = await prisma.$transaction(async (tx) => {
//       // 3. Create the Institution
//       const newInstitution = await tx.institution.create({
//         data: {
//           ...instituteData, // Spread validated and potentially defaulted data
//           code: lowerCaseCode,
//           email: request.adminEmail, // Use requester's email as initial contact
//           country: 'India', // Set default or get from form data
//         },
//       });

//       // 4. Update the Onboarding Request Status
//       await tx.onboardingRequest.update({
//         where: { id: request.id },
//         data: {
//           status: OnboardingStatus.AWAITING_CLERK, // Next step
//           onboardingToken: null, // Invalidate the token
//           tokenExpiresAt: null,
//           createdInstitutionId: newInstitution.id,
//         },
//       });

//       return newInstitution;
//     });
//     // --- End Transaction ---

//     console.log(`Institution ${result.name} (${result.id}) created successfully via onboarding request ${request.id}`);
//     return NextResponse.json({ success: true, instituteId: result.id }, { status: 201 });

//   } catch (error: any) {
//     console.error("Error completing institute setup:", error);
//     // Check for unique constraint violation specifically on 'code'
//     if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
//       return NextResponse.json({ success: false, error: "This institute code is already taken. Please choose a different one." }, { status: 409 });
//     }
//     // Attempt to mark the request as errored if token was available
//     if (requestToken) {
//       await prisma.onboardingRequest.updateMany({
//         where: { onboardingToken: requestToken, status: OnboardingStatus.INITIATED }, // Only update if still initiated
//         data: { status: OnboardingStatus.ERROR, errorMessage: 'Failed during institute creation step.' }
//       }).catch(console.error); // Best effort
//     }
//     return NextResponse.json({ success: false, error: 'Internal Server Error during setup completion.' }, { status: 500 });
//   }
// }

// app/api/onboarding/complete-setup/route.ts
import { NextResponse } from 'next/server';
import { OnboardingStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Updated schema with required fields matching frontend form
const setupSchemaBackend = z.object({
  token: z.string(),
  name: z.string().min(5),
  code: z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  phone: z.string().min(1),
  website: z.string().url(),
  email: z.string().email(),
  principalName: z.string().min(3),
  foundedYear: z.string().regex(/^\d{4}$/),
  accreditationInfo: z.string().min(1),
  role: z.string().default('PRINCIPAL'),
  country: z.string().default('India'),
});

export async function POST(req: Request) {
  let requestToken: string | null = null; // For error logging if validation fails early

  try {
    const body = await req.json();
    requestToken = body?.token; // Get token early for potential error logging
    const validation = setupSchemaBackend.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: "Invalid input data.",
        details: validation.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { token, code, principalName, role, ...instituteData } = validation.data;
    const lowerCaseCode = code.toLowerCase();

    // 1. Verify Token and Request Status again (critical check)
    const request = await prisma.onboardingRequest.findUnique({
      where: { onboardingToken: token },
    });

    // Combine checks for cleaner logic
    if (!request || request.status !== OnboardingStatus.INITIATED || !request.tokenExpiresAt || request.tokenExpiresAt < new Date()) {
      let errorMsg = 'Invalid or expired setup link.';
      if (request) { // If request exists, provide more specific status
        if (request.status !== OnboardingStatus.INITIATED) {
          errorMsg = `Setup cannot proceed. Current status: ${request.status}.`;
        } else if (request.tokenExpiresAt && request.tokenExpiresAt < new Date()) {
          errorMsg = 'This setup link has expired.';
          // Update status to EXPIRED
          await prisma.onboardingRequest.update({
            where: { id: request.id },
            data: { status: OnboardingStatus.EXPIRED, onboardingToken: null }
          }).catch(console.error);
        }
      }
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    // 2. Check Institute Code Uniqueness (CRITICAL)
    const existingInstitute = await prisma.institution.findUnique({
      where: { code: lowerCaseCode },
      select: { id: true } // Only need to know if it exists
    });

    if (existingInstitute) {
      return NextResponse.json({
        success: false,
        error: `Institute code '${lowerCaseCode}' is already taken. Please choose a different one.`
      }, { status: 409 });
    }

    // --- Transaction ---
    const result = await prisma.$transaction(async (tx) => {
      // 3. Create the Institution
      const newInstitution = await tx.institution.create({
        data: {
          ...instituteData, // Spread validated and potentially defaulted data
          code: lowerCaseCode,
          foundedYear: parseInt(instituteData.foundedYear),
          country: 'India', // Set default or get from form data
        },
      });

      // Store principal name and role info for future user creation
      await tx.onboardingAdditionalInfo.create({
        data: {
          requestId: request.id,
          principalName: principalName,
          role: role as Role,
          additionalInfo: JSON.stringify({
            initialRole: role,
            userFullName: principalName
          })
        }
      });

      // 4. Update the Onboarding Request Status
      await tx.onboardingRequest.update({
        where: { id: request.id },
        data: {
          status: OnboardingStatus.AWAITING_CLERK, // Next step
          onboardingToken: null, // Invalidate the token
          tokenExpiresAt: null,
          createdInstitutionId: newInstitution.id,
        },
      });

      return newInstitution;
    });
    // --- End Transaction ---

    console.log(`Institution ${result.name} (${result.id}) created successfully via onboarding request ${request.id}`);
    return NextResponse.json({ success: true, instituteId: result.id }, { status: 201 });

  } catch (error: any) {
    console.error("Error completing institute setup:", error);
    // Check for unique constraint violation specifically on 'code'
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return NextResponse.json({
        success: false,
        error: "This institute code is already taken. Please choose a different one."
      }, { status: 409 });
    }
    // Attempt to mark the request as errored if token was available
    if (requestToken) {
      await prisma.onboardingRequest.updateMany({
        where: {
          onboardingToken: requestToken,
          status: OnboardingStatus.INITIATED
        }, // Only update if still initiated
        data: {
          status: OnboardingStatus.ERROR,
          errorMessage: 'Failed during institute creation step.'
        }
      }).catch(console.error); // Best effort
    }
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error during setup completion.'
    }, { status: 500 });
  }
}