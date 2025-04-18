// app/(public)/onboard/setup/page.tsx
import { Suspense } from "react";
import { SetupPageContent } from "./SetupPageContent"; // Client component below
import { Skeleton } from "@/components/ui/skeleton";

// Use Suspense to handle loading of search params on the client
export default function SetupInstitutePage() {
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Suspense fallback={<SetupPageSkeleton />}>
        <SetupPageContent />
      </Suspense>
    </div>
  );
}

function SetupPageSkeleton() {
  return (
    <div className="space-y-6 max-w-lg mx-auto p-6 border rounded-lg shadow-md">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full mx-auto" />
      <div className="space-y-4 pt-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full mt-6" />
      </div>
    </div>
  );
}
