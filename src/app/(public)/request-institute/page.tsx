// app/(public)/request-institute/page.tsx
import { RequestInstituteForm } from "@/components/forms/RequestInstituteForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function RequestInstitutePage() {
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <RequestInstituteForm />
      <Card className="mt-8 bg-secondary/30">
        <CardHeader>
          <CardTitle className="text-lg">How it Works</CardTitle>
          <CardDescription>The institute onboarding process:</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>1. Submit this request form with your details.</p>
          <p>
            2. Our team will review your request (usually within 24-48 hours).
          </p>
          <p>
            3. If approved, you&apos;ll receive an email with a secure link.
          </p>
          <p>
            4. Click the link to provide basic details about your institute.
          </p>
          <p>
            5. Create your administrator account (or log in if you already have
            one).
          </p>
          <p>6. Access your new institute dashboard!</p>
        </CardContent>
      </Card>
    </div>
  );
}
