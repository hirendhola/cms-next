// (auth)/signup/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function SignUpPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SignUp path="/signup" routing="path" signInUrl="/sign-in" />
    </div>
  );
}
