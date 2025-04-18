// app/admin/onboarding-requests/page.tsx (Server Component for data fetching)
import { prisma } from "@/lib/prisma";
import { OnboardingStatus } from "@prisma/client";
import { OnboardingRequestList } from "./OnboardingRequestList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

// TODO: Implement proper authentication/authorization for this page
async function getPendingRequests() {
  // --- !! Placeholder Auth Check !! ---
  // const user = await getCurrentAdminUser();
  // if (!user || user.role !== 'PLATFORM_OWNER') {
  //     throw new Error("Unauthorized"); // Or redirect
  // }
  // ---

  try {
    const requests = await prisma.onboardingRequest.findMany({
      where: {
        status: OnboardingStatus.PENDING,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        // Select only necessary fields
        id: true,
        adminName: true,
        adminEmail: true,
        proposedInstituteName: true,
        reason: true,
        createdAt: true,
      },
    });
    return requests;
  } catch (error) {
    console.error("Failed to fetch pending onboarding requests:", error);
    // Handle error appropriately, maybe return an empty array or throw
    return [];
  }
}

export default async function AdminOnboardingPage() {
  // Add error handling for the promise
  const pendingRequests = await getPendingRequests().catch((err) => {
    console.error("Error fetching requests in page:", err);
    return { error: err.message || "Failed to load requests." };
  });

  if (typeof pendingRequests === "object" && "error" in pendingRequests) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Requests</AlertTitle>
          <AlertDescription>{pendingRequests.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Pending Institute Onboarding Requests</CardTitle>
          <CardDescription>
            Review and approve or reject new institute requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-yellow-50 border-yellow-300 text-yellow-800">
            <ShieldCheck className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Admin Action Required</AlertTitle>
            <AlertDescription>
              Approving a request will send a magic link to the user to complete
              their institute setup. Rejecting will mark the request as closed.
            </AlertDescription>
          </Alert>

          <OnboardingRequestList initialRequests={pendingRequests} />
        </CardContent>
      </Card>
    </div>
  );
}
