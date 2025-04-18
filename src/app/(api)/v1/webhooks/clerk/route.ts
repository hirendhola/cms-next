/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyWebhook(_req: NextRequest) {
  return true;
}

// Function to get or create the TEMP institution
async function getOrCreateTempInstitution() {
  let tempInstitution = await prisma.institution.findUnique({
    where: {
      code: 'TEMP'
    }
  });

  if (!tempInstitution) {
    tempInstitution = await prisma.institution.create({
      data: {
        name: 'Temporary Institution',
        code: 'TEMP',
        country: 'Global',
      }
    });
    console.log('Created TEMP institution for initial user signup');
  }

  return tempInstitution;
}

export async function POST(req: NextRequest) {
  try {
    const isVerified = await verifyWebhook(req);
    if (!isVerified) {
      return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Webhook received:', body);

    const { type, data } = body;

    // Inside POST handler
    if (type === 'user.updated' || type === 'user.created') {
      const clerkId = data.id;
      const email: string = data.email_addresses?.[0]?.email_address || '';
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const profileImage = data.image_url || '';
      const phone = data.phone_numbers?.[0]?.phone_number || '';
      const gender = data.gender || '';
      const dateOfBirth = data.birthday ? new Date(data.birthday) : undefined;

      // Custom fields from Clerk metadata (public or private)
      const address = data.public_metadata?.address || '';
      const city = data.public_metadata?.city || '';
      const state = data.public_metadata?.state || '';
      const country = data.public_metadata?.country || '';
      const postalCode = data.public_metadata?.postalCode || '';
      const bio = data.public_metadata?.bio || '';
      const emergencyContact = data.public_metadata?.emergencyContact || '';
      const bloodGroup = data.public_metadata?.bloodGroup || '';

      if (type === 'user.updated') {
        const updatedUser = await prisma.user.update({
          where: { clerkId },
          data: {
            email,
            firstName,
            lastName,
            fullName,
            profileImage,
            phone,
            gender,
            dateOfBirth,
            address,
            city,
            state,
            country,
            postalCode,
            bio,
            emergencyContact,
            bloodGroup,
          },
        });

        console.log('User updated successfully:', updatedUser);
        return NextResponse.json({ success: true, user: updatedUser });
      }

      if (type === 'user.created') {
        let tempInstitution;
        const isadminEmail = await prisma.institution.findFirst({
          where: { email },
        });
        if (!isadminEmail) {
          tempInstitution = await getOrCreateTempInstitution();
        }
        tempInstitution = isadminEmail;
        const newUser = await prisma.user.create({
          data: {
            clerkId,
            email,
            firstName,
            lastName,
            fullName,
            profileImage,
            phone,
            gender,
            dateOfBirth,
            address,
            city,
            state,
            country,
            postalCode,
            bio,
            emergencyContact,
            bloodGroup,
            role: 'TEMP',
            institutionId: tempInstitution.id,
          },
        });

        console.log('User created successfully:', newUser);
        return NextResponse.json({ success: true, user: newUser });
      }
    }
  } catch (error: any) {
    console.error('Error processing webhook event:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}