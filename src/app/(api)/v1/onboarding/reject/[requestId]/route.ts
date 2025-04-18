/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/onboarding/reject/[requestId]/route.ts
import { NextResponse } from 'next/server';
import { OnboardingStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
// TODO: Implement proper admin authentication/authorization

const rejectionSchema = z.object({
  reason: z.string().min(5, { message: "Please provide a brief reason for rejection." }).optional(), // Optional reason
});

export async function POST(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  const requestId = params.requestId;

  // --- !! Placeholder: Implement Real Admin Auth !! ---
  console.log(`Admin attempting rejection for request ID: ${requestId}`);
  // --- End Placeholder ---

  if (!requestId) {
    return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validation = rejectionSchema.safeParse(body);
    let rejectionReason: string | undefined;

    if (validation.success) {
      rejectionReason = validation.data.reason;
    }
    // If validation fails but reason wasn't mandatory, proceed without it.
    // If reason was mandatory and failed, you'd return 400 here.

    const request = await prisma.onboardingRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Allow rejection of PENDING or even potentially INITIATED if needed?
    if (request.status !== OnboardingStatus.PENDING) {
      return NextResponse.json({ success: false, error: `Request cannot be rejected. Current status: ${request.status}` }, { status: 400 });
    }

    const updatedRequest = await prisma.onboardingRequest.update({
      where: { id: requestId },
      data: {
        status: OnboardingStatus.REJECTED,
        rejectionReason: rejectionReason || "Rejected by admin.", // Default reason if none provided
        onboardingToken: null, // Clear any potential token
        tokenExpiresAt: null,
      },
    });

    // Optional: Send rejection email to the user
    // await sendRejectionEmail(updatedRequest.adminEmail, updatedRequest.adminName, rejectionReason);

    return NextResponse.json({ success: true, message: `Request from ${updatedRequest.adminEmail} rejected successfully.` });

  } catch (error: any) {
    console.error(`Error rejecting onboarding request ${requestId}:`, error);
    await prisma.onboardingRequest.update({
      where: { id: requestId },
      data: { status: OnboardingStatus.ERROR, errorMessage: 'Failed during rejection API processing.' }
    }).catch(console.error); // Best effort
    return NextResponse.json({ success: false, error: 'Internal Server Error during rejection' }, { status: 500 });
  }
}