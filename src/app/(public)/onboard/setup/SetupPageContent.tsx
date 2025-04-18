/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/onboard/setup/SetupPageContent.tsx // Client Component
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { InstituteSetupForm } from "@/components/forms/InstituteSetupForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type VerificationStatus = "loading" | "valid" | "invalid" | "error";
interface VerificationResult {
  status: VerificationStatus;
  message?: string;
  initialName?: string;
  requesterEmail?: string;
}

export function SetupPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [verification, setVerification] = useState<VerificationResult>({
    status: "loading",
  });

  useEffect(() => {
    if (!token) {
      setVerification({
        status: "invalid",
        message: "Setup token is missing from the URL.",
      });
      return;
    }

    const verify = async () => {
      try {
        setVerification({ status: "loading" }); // Reset on retry or initial load
        const response = await fetch(
          `/v1/onboarding/verify-token?token=${token}`
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to verify token.");
        }

        setVerification({
          status: "valid",
          initialName: result.initialName,
          requesterEmail: result.requesterEmail,
        });
      } catch (error: any) {
        console.error("Token verification error:", error);
        setVerification({
          status: "invalid",
          message: error.message || "An error occurred during verification.",
        });
      }
    };

    verify();
  }, [token]); // Re-run if token changes (though unlikely)

  if (verification.status === "loading") {
    // Optional: Show a more specific loading indicator here if needed
    // Skeleton is handled by Suspense in the parent page
    return (
      <p className="text-center text-muted-foreground">
        Verifying setup link...
      </p>
    );
  }

  if (verification.status !== "valid") {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Setup Link Invalid or Expired</AlertTitle>
        <AlertDescription>
          {verification.message ||
            "This link is no longer valid. Please request a new institute if needed."}
          <div className="mt-4">
            <Button variant="secondary" asChild>
              <Link href="/request-institute">Request Access</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Token is valid, render the setup form
  return (
    <InstituteSetupForm
      token={token!} // Assert token exists as we checked above
      initialName={verification.initialName}
      requesterEmail={verification.requesterEmail}
    />
  );
}
