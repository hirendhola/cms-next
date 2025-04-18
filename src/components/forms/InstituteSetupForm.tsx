/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useState } from "react";
import { useRouter } from "next/navigation"; // Use App Router's navigation

const setupFormSchema = z.object({
  name: z
    .string()
    .min(5, { message: "Institute name must be at least 5 characters." }),
  code: z
    .string()
    .min(3, { message: "Code must be at least 3 characters." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Code must be lowercase letters, numbers, and hyphens only (e.g., 'my-college').",
    }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  website: z
    .string()
    .url({ message: "Please enter a valid URL (e.g., https://example.com)." })
    .optional()
    .or(z.literal("")),
});

interface InstituteSetupFormProps {
  token: string;
  initialName?: string; // Pre-fill name from request
  requesterEmail?: string; // Pass the email for context
}

export function InstituteSetupForm({
  token,
  initialName,
  requesterEmail,
}: InstituteSetupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof setupFormSchema>>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      name: initialName || "",
      code: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      website: "",
    },
  });

  async function onSubmit(values: z.infer<typeof setupFormSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch("/v1/onboarding/complete-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, token }),
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "";

        if (contentType && contentType.includes("application/json")) {
          // If it's JSON, parse the error
          const result = await response.json();
          errorMessage = result.error || `Failed to set up institute.`;

          // Provide specific feedback if code is taken
          if (response.status === 409 && result.error.includes("code")) {
            form.setError("code", { type: "manual", message: result.error });
            throw new Error(result.error); // Throw to prevent redirection
          }
        } else {
          // If it's not JSON, use the status text
          errorMessage = `Request failed with status ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
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

      toast.success("Institute Created!", {
        description: "Next step: Create your admin account or log in.",
        duration: 5000,
      });

      // Redirect to Clerk Sign Up page, passing the email if available
      // Clerk can often pre-fill the email field this way
      const signUpUrl = `/sign-up${requesterEmail ? `?email_address=${encodeURIComponent(requesterEmail)}` : ""}`;
      router.push(signUpUrl);
    } catch (error: any) {
      console.error("Setup error:", error);
      // Don't show generic toast if a specific field error was set
      if (!form.formState.errors.code) {
        toast.error("Setup Failed", {
          description:
            error.message ||
            "An unexpected error occurred. Please check the details and try again.",
        });
      }
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
          Set Up Your Institute
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Enter the details for your new institute.
        </p>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institute Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Premier Institute of Technology"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institute Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., pit-mumbai" {...field} />
              </FormControl>
              <FormDescription>
                Unique identifier (lowercase letters, numbers, hyphens). Cannot
                be changed later. Used in URLs.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Tech Park Road" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Mumbai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Maharashtra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 400001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Phone (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="e.g., +91 22 1234 5678"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://www.example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading
            ? "Creating Institute..."
            : "Create Institute & Proceed to Account Setup"}
        </Button>
      </form>
    </Form>
  );
}
