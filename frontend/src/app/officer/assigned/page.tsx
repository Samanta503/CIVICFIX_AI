"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  getOfficerAssignedComplaints,
  updateOfficerComplaintStatus,
} from "@/services/complaint.service";
import type { Complaint } from "@/types/complaint.types";

export default function OfficerAssignedPage() {
  return (
    <AuthGuard allowedRoles={["officer"]}>
      <OfficerAssignedContent />
    </AuthGuard>
  );
}

function OfficerAssignedContent() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadComplaints() {
    try {
      setLoading(true);
      setMessage(null);

      const response = await getOfficerAssignedComplaints();

      setComplaints(response.data.complaints);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load assigned complaints."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  async function handleUpdateStatus(
    complaintId: number,
    status: "in_progress" | "resolved"
  ) {
    try {
      setUpdatingId(complaintId);
      setMessage(null);

      await updateOfficerComplaintStatus({
        complaintId,
        status,
        note: notes[complaintId] || undefined,
      });

      await loadComplaints();
      setMessage("Complaint status updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update complaint status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading assigned complaints...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
              Officer Workflow
            </span>

            <h1 className="mt-5 text-4xl font-extrabold text-secondary">
              Assigned Complaints
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              View complaints assigned to you and update field progress.
            </p>
          </div>

          <Link
            href={ROUTES.officerDashboard}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
          >
            Back to Dashboard
          </Link>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        {complaints.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-secondary">
              No assigned complaints
            </h2>

            <p className="mt-3 text-slate-600">
              Assigned complaints will appear here after department admin
              assigns them to you.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {complaints.map((complaint) => (
              <OfficerComplaintCard
                key={complaint.id}
                complaint={complaint}
                note={notes[complaint.id] || ""}
                updating={updatingId === complaint.id}
                onNoteChange={(value) =>
                  setNotes((previous) => ({
                    ...previous,
                    [complaint.id]: value,
                  }))
                }
                onUpdateStatus={(status) =>
                  handleUpdateStatus(complaint.id, status)
                }
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function OfficerComplaintCard({
  complaint,
  note,
  updating,
  onNoteChange,
  onUpdateStatus,
}: {
  complaint: Complaint;
  note: string;
  updating: boolean;
  onNoteChange: (value: string) => void;
  onUpdateStatus: (status: "in_progress" | "resolved") => void;
}) {
  const isResolved = complaint.status === "resolved";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {complaint.complaint_no}
            </span>

            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>

          <h2 className="mt-4 text-2xl font-bold text-secondary">
            {complaint.title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {complaint.description}
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <p>
              Citizen:{" "}
              <span className="font-semibold text-secondary">
                {complaint.citizen?.name || "N/A"}
              </span>
            </p>

            <p>
              Category:{" "}
              <span className="font-semibold text-secondary">
                {complaint.category?.name || "N/A"}
              </span>
            </p>

            <p>
              Department:{" "}
              <span className="font-semibold text-secondary">
                {complaint.department?.name || "N/A"}
              </span>
            </p>

            <p>
              Zone:{" "}
              <span className="font-semibold text-secondary">
                {complaint.zone?.name || "N/A"}
              </span>
            </p>

            <p>
              Assigned At:{" "}
              <span className="font-semibold text-secondary">
                {complaint.assigned_at
                  ? new Date(complaint.assigned_at).toLocaleString()
                  : "N/A"}
              </span>
            </p>

            <p>
              SLA Due:{" "}
              <span className="font-semibold text-secondary">
                {complaint.sla_due_at
                  ? new Date(complaint.sla_due_at).toLocaleString()
                  : "N/A"}
              </span>
            </p>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Address: {complaint.address}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <h3 className="font-bold text-secondary">Update Progress</h3>

          <div className="mt-4">
            <label className="text-sm font-semibold text-secondary">
              Work Note
            </label>

            <textarea
              value={note}
              disabled={isResolved}
              onChange={(event) => onNoteChange(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary disabled:bg-slate-100"
              placeholder="Write update note..."
            />
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              disabled={updating || isResolved}
              onClick={() => onUpdateStatus("in_progress")}
              className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {updating ? "Updating..." : "Mark In Progress"}
            </button>

            <button
              type="button"
              disabled={updating || isResolved}
              onClick={() => onUpdateStatus("resolved")}
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {updating ? "Updating..." : "Mark Resolved"}
            </button>
          </div>

          {isResolved && (
            <p className="mt-4 rounded-xl bg-green-100 p-3 text-sm font-semibold text-green-700">
              This complaint has already been resolved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Complaint["status"] }) {
  const styles: Record<Complaint["status"], string> = {
    submitted: "bg-blue-100 text-blue-700",
    under_review: "bg-purple-100 text-purple-700",
    assigned: "bg-indigo-100 text-indigo-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    closed: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Complaint["priority"] }) {
  const styles: Record<Complaint["priority"], string> = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}