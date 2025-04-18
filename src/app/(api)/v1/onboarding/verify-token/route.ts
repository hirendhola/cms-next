/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/onboarding/verify-token/route.ts
import { NextResponse } from 'next/server';
import { OnboardingStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Verification token is missing.' }, { status: 400 });
  }

  try {
    const request = await prisma.onboardingRequest.findUnique({
      where: { onboardingToken: token },
      select: { // Only select needed fields
        id: true,
        status: true,
        tokenExpiresAt: true,
        proposedInstituteName: true,
        adminEmail: true,
      }
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Invalid verification link.' }, { status: 404 });
    }

    if (request.status !== OnboardingStatus.INITIATED) {
      let message = `This link has already been used or the process is in state: ${request.status}.`;
      if (request.status === OnboardingStatus.EXPIRED) {
        message = 'This verification link has expired.';
      }
      return NextResponse.json({ success: false, error: message }, { status: 410 }); // Gone or Bad Request
    }

    if (!request.tokenExpiresAt || request.tokenExpiresAt < new Date()) {
      // Update status to EXPIRED for clarity
      await prisma.onboardingRequest.update({
        where: { id: request.id },
        data: { status: OnboardingStatus.EXPIRED, onboardingToken: null } // Clear token
      }).catch(console.error); // Best effort update
      return NextResponse.json({ success: false, error: 'This verification link has expired.' }, { status: 410 }); // Gone
    }

    // Token is valid and request is in the correct state
    return NextResponse.json({
      success: true,
      message: 'Token verified.',
      initialName: request.proposedInstituteName,
      requesterEmail: request.adminEmail,
    });

  } catch (error: any) {
    console.error("Error verifying onboarding token:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error during verification.' }, { status: 500 });
  }
}