// lib/email.ts
import { Resend } from 'resend';

// !! Replace with your actual Resend API key from .env !!
const resend = new Resend("re_ZKv7PEqs_FdChJBuES4ZsX2Vo4nFnvaM9");
// const resend = new Resend(process.env.RESEND_API_KEY);
// !! Configure your sending domain in Resend !!
const FROM_EMAIL = 'onboarding@contact.hirenx.in'; // Replace with your verified Resend domain

export async function sendOnboardingMagicLinkEmail(
  toEmail: string,
  adminName: string,
  magicLink: string,
  expiryHours: number
): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: `MANA Onboarding <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: 'Complete Your Institute Setup on YourApp',
      html: `
        <p>Hello ${adminName},</p>
        <p>Your request to create an institute on YourApp has been approved!</p>
        <p>Please click the link below to set up your institute details. This link is valid for ${expiryHours} hours:</p>
        <p><a href="${magicLink}" target="_blank">Set Up Your Institute</a></p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Thanks,<br/>The YourApp Team</p>
      `,
      // text version can be added too
    });

    if (error) {
      console.error("Error sending onboarding email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("Onboarding email sent successfully:", data?.id);

  } catch (error) {
    console.error("Exception caught while sending email:", error);
    // Depending on your strategy, you might want to re-throw or handle differently
    throw error; // Re-throw to be caught by the calling API route
  }
}

// Optional: Function to notify platform owner
export async function sendPlatformOwnerNotification(requestId: string, adminEmail: string, instituteName: string) {
  const ownerEmail = process.env.PLATFORM_ADMIN_EMAIL;
  if (!ownerEmail) {
    console.warn("PLATFORM_ADMIN_EMAIL not set, cannot send owner notification.");
    return;
  }
  try {
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/onboarding-requests`; // Link to your admin page
    await resend.emails.send({
      from: `YourApp System <${FROM_EMAIL}>`,
      to: [ownerEmail],
      subject: 'New Institute Onboarding Request',
      html: `
                <p>A new onboarding request has been submitted:</p>
                <ul>
                    <li>Requester Email: ${adminEmail}</li>
                    <li>Proposed Institute: ${instituteName}</li>
                    <li>Request ID: ${requestId}</li>
                </ul>
                <p><a href="${adminUrl}">Review Requests Here</a></p>
            `,
    });
    console.log(`Notification sent to platform owner ${ownerEmail}`);
  } catch (error) {
    console.error("Failed to send owner notification email:", error);
  }
}