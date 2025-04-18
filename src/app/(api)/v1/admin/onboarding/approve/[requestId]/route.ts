/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/onboarding/approve/[requestId]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
// Import your email sending function (e.g., using Resend, Nodemailer)
import { sendOnboardingMagicLinkEmail } from '@/lib/email'; // You need to create this

const prisma = new PrismaClient();
const TOKEN_EXPIRY_HOURS = 24; // Token valid for 24 hours

// TODO: Add authentication/authorization to ensure only the platform owner can call this
export async function POST(
    req: Request,
    { params }: { params: { requestId: string } }
) {
    const requestId = params.requestId;

    // --- Authentication/Authorization Check ---
    // const platformOwner = await getCurrentPlatformOwner(); // Implement this
    // if (!platformOwner) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }
    // ---

    try {
        const request = await prisma.onboardingRequest.findUnique({
            where: { id: requestId },
        });

        if (!request) {
            return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
        }

        if (request.status !== 'PENDING') {
            return NextResponse.json({ success: false, error: `Request is already ${request.status}` }, { status: 400 });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

        // Update request in DB
        const updatedRequest = await prisma.onboardingRequest.update({
            where: { id: requestId },
            data: {
                status: 'INITIATED', // Mark as initiated
                onboardingToken: token,
                tokenExpiresAt: expiresAt,
                // approvedById: platformOwner.id // Optional: track who approved
            },
        });

        // Construct magic link URL
        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/onboard/setup?token=${token}`; // Your setup page URL

        // Send email
        await sendOnboardingMagicLinkEmail(
            updatedRequest.adminEmail,
            updatedRequest.adminName,
            magicLink,
            TOKEN_EXPIRY_HOURS
        );

        return NextResponse.json({ success: true, message: 'Approval successful, magic link sent.' });

    } catch (error: any) {
        console.error("Error approving onboarding request:", error);
        // TODO: Handle email sending errors specifically?
        // Revert status if email fails? Or allow manual resend?
        await prisma.onboardingRequest.update({
            where: { id: requestId },
            data: { status: 'ERROR', errorMessage: 'Failed during approval process.' } // Mark as error
        }).catch(console.error); // Best effort to mark as error

        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}