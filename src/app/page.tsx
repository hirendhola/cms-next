"use client";

// import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
// import Link from "next/link";
import // SignedOut,
// SignInButton,
// SignUpButton,
// SignedIn,
// UserButton,
"@clerk/nextjs";
// import {
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   SignedIn,
//   UserButton,
// } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          College Management System
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Simplify your campus operations with our all-in-one platform.
        </p>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-300"
          onClick={() => router.push("/request-institute")}
        >
          Request a Demo
        </Button>
      </div>

      {/* Clerk Auth (Commented out for now, can be re-enabled when needed) */}
      {/* <SignedOut>
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>*/}
    </main>
  );
}
