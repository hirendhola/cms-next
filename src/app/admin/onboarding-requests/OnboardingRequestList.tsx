/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, Loader2, MessageSquareText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Updated import

type Request = {
  id: string;
  adminName: string;
  adminEmail: string;
  proposedInstituteName: string;
  reason: string | null;
  createdAt: Date;
};

interface OnboardingRequestListProps {
  initialRequests: Request[];
}

export function OnboardingRequestList({
  initialRequests,
}: OnboardingRequestListProps) {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [loadingState, setLoadingState] = useState<
    Record<string, "approving" | "rejecting" | null>
  >({});
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(
    null
  );

  const handleAction = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    setLoadingState((prev) => ({
      ...prev,
      [requestId]: action === "approve" ? "approving" : "rejecting",
    }));
    setRejectionReason(""); // Clear reason for next action

    const url = `/v1/admin/onboarding/${action}/${requestId}`;
    const method = "POST";
    let body = undefined;
    if (action === "reject") {
      body = JSON.stringify({ reason: rejectionReason || undefined }); // Send reason if provided
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: action === "reject" ? body : undefined,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} request.`);
      }

      toast.success(
        result.message || `Request ${requestId} processed successfully.`
      );

      // Remove the processed request from the list
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      setRejectingRequestId(null); // Close dialog if open
    } catch (error: any) {
      console.error(`Error ${action}ing request ${requestId}:`, error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoadingState((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  const openRejectDialog = (requestId: string) => {
    setRejectingRequestId(requestId);
    setRejectionReason(""); // Reset reason when opening dialog
  };

  if (requests.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-6">
        No pending requests found.
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Requester</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Proposed Institute</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">{req.adminName}</TableCell>
              <TableCell>{req.adminEmail}</TableCell>
              <TableCell>{req.proposedInstituteName}</TableCell>
              <TableCell
                className="text-sm text-muted-foreground max-w-xs truncate"
                title={req.reason ?? ""}
              >
                {req.reason ? (
                  <span className="flex items-center gap-1">
                    <MessageSquareText className="h-3 w-3 shrink-0" />{" "}
                    {req.reason}
                  </span>
                ) : (
                  <span className="italic">No reason provided</span>
                )}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(req.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {loadingState[req.id] === "approving" ? (
                  <Button variant="ghost" size="sm" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Approving...
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={!!loadingState[req.id]}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" /> Approve
                  </Button>
                )}

                {loadingState[req.id] === "rejecting" ? (
                  <Button variant="ghost" size="sm" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openRejectDialog(req.id)}
                    disabled={!!loadingState[req.id]}
                  >
                    <XCircle className="mr-1 h-4 w-4" /> Reject
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Alert Dialog for Rejection */}
      <AlertDialog
        open={!!rejectingRequestId}
        onOpenChange={() => setRejectingRequestId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this onboarding request.
              This message will be sent to the requester.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Optional, but recommended..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRejectingRequestId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (rejectingRequestId) {
                  handleAction(rejectingRequestId, "reject");
                }
              }}
              disabled={!rejectingRequestId}
            >
              Reject Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
