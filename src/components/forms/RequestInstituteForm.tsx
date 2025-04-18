/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { sendPlatformOwnerNotification } from "@/lib/email"; // Import the notification function

const formSchema = z.object({
  adminName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  adminEmail: z
    .string()
    .email({ message: "Please enter a valid email address." }),
  adminPhone: z.string().optional(),
  proposedInstituteName: z
    .string()
    .min(5, { message: "Institute name must be at least 5 characters." }),
  reason: z.string().optional(),
});

export function RequestInstituteForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminName: "",
      adminEmail: "",
      adminPhone: "",
      proposedInstituteName: "",
      reason: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("/v1/onboarding/request-institute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          // If it's JSON, parse the error
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Request failed with status ${response.status}`
          );
        } else {
          // If it's not JSON, use the status text
          throw new Error(
            `Request failed with status ${response.status}: ${response.statusText}`
          );
        }
      }

      // Only try to parse JSON if the response was successful
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        // If we can't parse JSON but the request was successful, we can still proceed
        result = { success: true };
      }

      toast.success("Request Submitted!", {
        description:
          "Thank you! We'll review your request and get back to you soon.",
      });

      // Optional: Notify platform owner (fire and forget)
      // Only do this if we have a requestId from the result
      if (result && result.requestId) {
        sendPlatformOwnerNotification(
          result.requestId,
          values.adminEmail,
          values.proposedInstituteName
        ).catch((err) =>
          console.error(
            "Failed to send owner notification (non-critical):",
            err
          )
        );
      } else {
        console.log("Request submitted, but no requestId was returned");
      }

      form.reset();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error("Submission Failed", {
        description:
          error.message ||
          "An unexpected error occurred. Please check your details or try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-lg mx-auto p-6 border rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Request New Institute Access
        </h2>
        <FormField
          control={form.control}
          name="adminName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adminEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="e.g., jane.doe@example.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We&apos;ll use this for communication and onboarding.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adminPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="e.g., +91 12345 67890"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="proposedInstituteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposed Institute Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Example College of Engineering"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Request (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us briefly why you need an institute instance..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Submitting..." : "Request Institute Access"}
        </Button>
      </form>
    </Form>
  );
}
