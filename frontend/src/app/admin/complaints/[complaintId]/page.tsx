"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getAdminOfficers } from "@/services/admin-officer.service";
import {
  getAdminComplaint,
  updateAdminComplaint,
} from "@/services/admin-complaint.service";
import type { AdminOfficer } from "@/types/admin-officer.types";
import type {
  AdminComplaint,
  AdminComplaintPriority,
  AdminComplaintStatus,
} from "@/types/admin-complaint.types";

export default function AdminComplaintDetailPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminComplaintDetailContent />
    </AuthGuard>
  );
}

function AdminComplaintDetailContent() {
  const params = useParams<{ complaintId: string }>();

  const [complaint, setComplaint] = useState<AdminComplaint | null>(null);
  const [officers, setOfficers] = useState<AdminOfficer[]>([]);
  const [form, setForm] = useState({
    status: "",
    priority: "",
    assigned_officer_id: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setMessage(null);

      const complaintId = Number(params.complaintId);

      if (!complaintId) {
        throw new Error("Invalid complaint ID.");
      }

      const complaintResponse = await getAdminComplaint(complaintId);
      const loadedComplaint = complaintResponse.data.complaint;

      const officerResponse = await getAdminOfficers({
        department_id: loadedComplaint.department?.id
          ? String(loadedComplaint.department.id)
          : "",
      });

      setComplaint(loadedComplaint);
      setOfficers(officerResponse.data.officers);

      setForm({
        status: loadedComplaint.status,
        priority: loadedComplaint.priority,
        assigned_officer_id: loadedComplaint.assigned_officer?.id
          ? String(loadedComplaint.assigned_officer.id)
          : "",
        note: "",
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load complaint details."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.complaintId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.complaintId]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!complaint) return;

    try {
      setSaving(true);
      setMessage(null);

      const response = await updateAdminComplaint(complaint.id, {
        status: form.status as AdminComplaintStatus,
        priority: form.priority as AdminComplaintPriority,
        assigned_officer_id: form.assigned_officer_id
          ? Number(form.assigned_officer_id)
          : null,
        note: form.note || undefined,
      });

      const updatedComplaint = response.data.complaint;

      setComplaint(updatedComplaint);
      setForm({
        status: updatedComplaint.status,
        priority: updatedComplaint.priority,
        assigned_officer_id: updatedComplaint.assigned_officer?.id
          ? String(updatedComplaint.assigned_officer.id)
          : "",
        note: "",
      });

      setMessage("Complaint updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update complaint."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading admin complaint details..." />;
  }

  if (!complaint) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Unable to load</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {message || "Complaint not found."}
          </p>
          <Link
            href={ROUTES.adminComplaints}
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Back to Complaints
          </Link>
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
              Admin Complaint Control
            </span>

            <h1 className="mt-5 text-4xl font-extrabold text-secondary">
              {complaint.title}
            </h1>

            <p className="mt-3 text-slate-600">
              Complaint No:{" "}
              <span className="font-bold text-secondary">
                {complaint.complaint_no}
              </span>
            </p>
          </div>

          <Link
            href={ROUTES.adminComplaints}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
          >
            Back to Complaints
          </Link>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <main className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-secondary">
                Description
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {complaint.description}
              </p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-bold text-secondary">Address</p>
                <p className="mt-2 text-sm text-slate-600">
                  {complaint.address}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Uploaded Media
              </h2>

              {complaint.media.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                  No media uploaded.
                </p>
              ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {complaint.media.map((media) => (
                    <div
                      key={media.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      {media.file_url ? (
                        <a href={media.file_url} target="_blank" rel="noreferrer">
                          <img
                            src={media.file_url}
                            alt={media.original_name || "Complaint media"}
                            className="h-64 w-full object-cover"
                          />
                        </a>
                      ) : (
                        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                          Media URL not available
                        </div>
                      )}

                      <div className="p-4">
                        <p className="truncate text-sm font-semibold text-secondary">
                          {media.original_name || "Uploaded media"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Status Timeline
              </h2>

              {complaint.status_histories.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                  No timeline found.
                </p>
              ) : (
                <div className="mt-6 space-y-5">
                  {complaint.status_histories.map((history, index) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                          {index + 1}
                        </div>

                        {index !== complaint.status_histories.length - 1 && (
                          <div className="mt-2 h-full min-h-10 w-px bg-slate-200" />
                        )}
                      </div>

                      <div className="flex-1 rounded-2xl bg-slate-50 p-5">
                        <p className="font-bold capitalize text-secondary">
                          {history.old_status || "new"} →{" "}
                          {history.new_status.replace("_", " ")}
                        </p>

                        <p className="mt-2 text-sm text-slate-600">
                          {history.note || "Status updated."}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                          By {history.changed_by?.name || "System"} •{" "}
                          {history.created_at
                            ? new Date(history.created_at).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          <aside className="space-y-6">
            <form
              onSubmit={handleUpdate}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-secondary">
                Admin Update
              </h2>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-secondary">
                  Status
                </span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-secondary">
                  Priority
                </span>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      priority: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-secondary">
                  Assigned Officer
                </span>

                <select
                  value={form.assigned_officer_id}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      assigned_officer_id: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">Unassigned</option>
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} — Active:{" "}
                      {officer.workload.active_assigned}, Overdue:{" "}
                      {officer.workload.overdue}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  Only active officers from the same department are shown.
                </p>
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-semibold text-secondary">
                  Update Note
                </span>
                <textarea
                  rows={4}
                  value={form.note}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, note: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  placeholder="Write admin update note..."
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-5 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save Update"}
              </button>
            </form>

            <InfoCard title="Citizen">
              <InfoRow label="Name" value={complaint.citizen?.name || "N/A"} />
              <InfoRow label="Email" value={complaint.citizen?.email || "N/A"} />
              <InfoRow label="Phone" value={complaint.citizen?.phone || "N/A"} />
            </InfoCard>

            <InfoCard title="Complaint Info">
              <InfoRow label="Department" value={complaint.department?.name || "N/A"} />
              <InfoRow label="Category" value={complaint.category?.name || "N/A"} />
              <InfoRow label="Zone" value={complaint.zone?.name || "N/A"} />
              <InfoRow label="Officer" value={complaint.assigned_officer?.name || "Not assigned"} />
              <InfoRow label="Submitted" value={formatDateTime(complaint.submitted_at)} />
              <InfoRow label="SLA Due" value={formatDateTime(complaint.sla_due_at)} />
            </InfoCard>

            <InfoCard title="Location">
              <InfoRow label="Address" value={complaint.address} />
              <InfoRow label="Latitude" value={complaint.latitude || "N/A"} />
              <InfoRow label="Longitude" value={complaint.longitude || "N/A"} />
            </InfoCard>
          </aside>
        </div>
      </Container>
    </section>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-secondary">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <p className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminComplaint["status"] }) {
  const styles: Record<AdminComplaint["status"], string> = {
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

function PriorityBadge({ priority }: { priority: AdminComplaint["priority"] }) {
  const styles: Record<AdminComplaint["priority"], string> = {
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

function formatDateTime(value?: string | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
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