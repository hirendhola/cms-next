/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { OnboardingStatus } from '@prisma/client';
import crypto from 'crypto';
import { sendOnboardingMagicLinkEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
// TODO: Implement proper admin authentication/authorization
// import { getCurrentUser } from '@/lib/auth'; // Your auth function

const TOKEN_EXPIRY_HOURS = 24; // Magic link valid for 24 hours

export async function POST(
  req: Request, // No body needed for approval itself
  { params }: { params: { requestId: string } }
) {
  const requestId = params.requestId;

  // --- !! Placeholder: Implement Real Admin Auth !! ---
  // const adminUser = await getCurrentUser();
  // if (!adminUser || adminUser.email !== process.env.PLATFORM_ADMIN_EMAIL) { // Simple check
  //   console.warn("Unauthorized attempt to approve request:", requestId);
  //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  // }
  console.log(`Admin attempting approval for request ID: ${requestId}`);
  // --- End Placeholder ---

  if (!requestId) {
    return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
  }

  try {
    const request = await prisma.onboardingRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== OnboardingStatus.PENDING) {
      // Allow re-sending if it errored or expired? Maybe a separate endpoint?
      // For now, only allow PENDING -> INITIATED
      return NextResponse.json({ success: false, error: `Request cannot be approved. Current status: ${request.status}` }, { status: 400 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    // Update request in DB *before* sending email
    const updatedRequest = await prisma.onboardingRequest.update({
      where: { id: requestId },
      data: {
        status: OnboardingStatus.INITIATED, // Mark as initiated
        onboardingToken: token,
        tokenExpiresAt: expiresAt,
      },
    });

    // Construct magic link URL
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/onboard/setup?token=${token}`;

    // Send email (if this fails, the status is already INITIATED, might need manual intervention or retry logic)
    try {
      await sendOnboardingMagicLinkEmail(
        updatedRequest.adminEmail,
        updatedRequest.adminName,
        magicLink,
        TOKEN_EXPIRY_HOURS
      );
    } catch (emailError) {
      console.error(`Failed to send magic link email for request ${requestId} after DB update:`, emailError);
      // Optionally update status to ERROR here, or log for manual check
      await prisma.onboardingRequest.update({
        where: { id: requestId },
        data: { status: OnboardingStatus.ERROR, errorMessage: 'Failed to send magic link email.' }
      }).catch(console.error);
      // Inform the admin performing the action
      return NextResponse.json({ success: false, error: 'Approval recorded, but failed to send email. Please check logs.' }, { status: 500 });
    }


    return NextResponse.json({ success: true, message: `Approval successful for ${updatedRequest.adminEmail}. Magic link sent.` });

  } catch (error: any) {
    console.error(`Error approving onboarding request ${requestId}:`, error);
    // Attempt to mark as ERROR if something went wrong before email sending attempt
    await prisma.onboardingRequest.update({
      where: { id: requestId }, // Only update if it exists
      data: { status: OnboardingStatus.ERROR, errorMessage: 'Failed during approval API processing.' }
    }).catch(console.error); // Best effort

    return NextResponse.json({ success: false, error: 'Internal Server Error during approval' }, { status: 500 });
  }
}