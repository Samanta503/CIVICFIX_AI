"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ComplaintDetailView } from "@/components/complaints/ComplaintDetailView";
import { ROUTES } from "@/lib/routes";
import { getDepartmentComplaint } from "@/services/complaint.service";
import type { Complaint } from "@/types/complaint.types";

export default function DepartmentComplaintDetailPage() {
  return (
    <AuthGuard allowedRoles={["department_admin", "super_admin"]}>
      <DepartmentComplaintDetailContent />
    </AuthGuard>
  );
}

function DepartmentComplaintDetailContent() {
  const params = useParams<{ complaintId: string }>();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadComplaint() {
      try {
        const complaintId = Number(params.complaintId);

        if (!complaintId) {
          throw new Error("Invalid complaint ID.");
        }

        const response = await getDepartmentComplaint(complaintId);
        setComplaint(response.data.complaint);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load complaint details."
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.complaintId) {
      loadComplaint();
    }
  }, [params.complaintId]);

  if (loading) {
    return <LoadingState message="Loading department complaint details..." />;
  }

  if (message || !complaint) {
    return <ErrorState message={message || "Complaint not found."} />;
  }

  return (
    <ComplaintDetailView
      complaint={complaint}
      backHref={ROUTES.departmentComplaints}
      backLabel="Back to Department Complaints"
      panelLabel="Department Complaint Details"
    />
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
        <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
      </div>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-red-600">Unable to load</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </section>
  );
}