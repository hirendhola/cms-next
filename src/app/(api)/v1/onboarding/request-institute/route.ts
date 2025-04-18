/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/onboarding/request-institute/route.ts
import { NextResponse } from 'next/server';
import { OnboardingStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const requestSchema = z.object({
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPhone: z.string().optional(),
  proposedInstituteName: z.string().min(5),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: "Invalid input", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { adminName, adminEmail, adminPhone, proposedInstituteName, reason } = validation.data;

    // Check if an *active* request already exists (not REJECTED, COMPLETED, EXPIRED, or ERROR)
    const existingRequest = await prisma.onboardingRequest.findFirst({
      where: {
        adminEmail: adminEmail,
        status: { notIn: [OnboardingStatus.REJECTED, OnboardingStatus.COMPLETED, OnboardingStatus.EXPIRED, OnboardingStatus.ERROR] }
      }
    });

    if (existingRequest) {
      return NextResponse.json({ success: false, error: `An active onboarding request (Status: ${existingRequest.status}) already exists for this email address.` }, { status: 409 }); // Conflict
    }

    const newRequest = await prisma.onboardingRequest.create({
      data: {
        adminName,
        adminEmail,
        adminPhone,
        proposedInstituteName,
        reason,
        status: OnboardingStatus.PENDING, // Explicitly set status
      },
    });

    // Optional: Trigger notification to platform owner (fire-and-forget)
    // Consider moving this to a background job for robustness
    // await sendPlatformOwnerNotification(newRequest.id, adminEmail, proposedInstituteName); // Already called from frontend form for immediate feedback idea

    return NextResponse.json({ success: true, requestId: newRequest.id }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating onboarding request:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('adminEmail')) {
      // This case should be caught by the check above, but added as a safeguard
      return NextResponse.json({ success: false, error: "An onboarding request with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Internal Server Error creating request." }, { status: 500 });
  }
}