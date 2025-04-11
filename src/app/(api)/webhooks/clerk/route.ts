/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyWebhook(_req: NextRequest) {
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const isVerified = await verifyWebhook(req);
    if (!isVerified) {
      return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Webhook received:', body);

    const { event, data } = body;

    if (event === 'user.updated') {
      const { clerkId, email, firstName, lastName, profileImage } = data;

      const updatedUser = await prisma.user.update({
        where: { clerkId }, // Ensure 'clerkId' is unique in your schema
        data: {
          email,
          firstName,
          lastName,
          profileImage,
        },
      });

      console.log('User updated successfully:', updatedUser);
      return NextResponse.json({ success: true, user: updatedUser });
    }

    if (event === 'user.created') {
      const { clerkId, email, firstName, lastName, profileImage } = data;

      // Create a new user entry in the database
      const newUser = await prisma.user.create({
        data: {
          clerkId,
          email,
          firstName,
          lastName,
          profileImage,
          role: 'STUDENT', // Provide a default or appropriate value for 'role'
        },
      });
      console.log('User created successfully:', newUser);
      return NextResponse.json({ success: true, user: newUser });
    }

    // If event is not supported, return a generic success response.
    return NextResponse.json({ success: true, message: 'Event not handled' });
  } catch (error: any) {
    console.error('Error processing webhook event:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
