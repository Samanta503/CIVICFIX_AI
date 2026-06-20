"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getPublicComplaint } from "@/services/public-complaint.service";
import type { PublicComplaint } from "@/types/public-complaint.types";

export default function PublicComplaintDetailPage() {
  const params = useParams<{ complaintNo: string }>();

  const [complaint, setComplaint] = useState<PublicComplaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadComplaint() {
      try {
        const response = await getPublicComplaint(params.complaintNo);
        setComplaint(response.data.complaint);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load public complaint."
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.complaintNo) {
      loadComplaint();
    }
  }, [params.complaintNo]);

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading complaint tracking...
          </p>
        </div>
      </section>
    );
  }

  if (message || !complaint) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Unable to load</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {message || "Complaint not found."}
          </p>

          <Link
            href={ROUTES.publicComplaints}
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Back to Public Complaints
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
              Public Complaint Tracking
            </span>

            <h1 className="mt-5 text-4xl font-extrabold text-secondary">
              {complaint.title}
            </h1>

            <p className="mt-3 max-w-3xl text-slate-600">
              Complaint No:{" "}
              <span className="font-bold text-secondary">
                {complaint.complaint_no}
              </span>
            </p>
          </div>

          <Link
            href={ROUTES.publicComplaints}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
          >
            Back to Public Complaints
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
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
                Public Timeline
              </h2>

              {complaint.status_histories.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                  No timeline available yet.
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

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Public Media
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
          </main>

          <aside className="space-y-6">
            <InfoCard title="Complaint Info">
              <InfoRow label="Status" value={formatStatus(complaint.status)} />
              <InfoRow label="Priority" value={complaint.priority} />
              <InfoRow
                label="Submitted"
                value={formatDateTime(complaint.submitted_at)}
              />
              <InfoRow
                label="SLA Due"
                value={formatDateTime(complaint.sla_due_at)}
              />
              <InfoRow
                label="Resolved"
                value={formatDateTime(complaint.resolved_at)}
              />
            </InfoCard>

            <InfoCard title="Department Info">
              <InfoRow
                label="Category"
                value={complaint.category?.name || "N/A"}
              />
              <InfoRow
                label="Department"
                value={complaint.department?.name || "N/A"}
              />
              <InfoRow label="Zone" value={complaint.zone?.name || "N/A"} />
              <InfoRow label="City" value={complaint.zone?.city || "N/A"} />
            </InfoCard>

            <InfoCard title="Public Citizen Info">
              <InfoRow
                label="Citizen"
                value={complaint.citizen?.name || "Anonymous"}
              />
            </InfoCard>

            <InfoCard title="Assigned Officer">
              <InfoRow
                label="Officer"
                value={complaint.assigned_officer?.name || "Not assigned"}
              />
              <InfoRow
                label="Assigned At"
                value={formatDateTime(complaint.assigned_at)}
              />
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

function StatusBadge({ status }: { status: PublicComplaint["status"] }) {
  const styles: Record<PublicComplaint["status"], string> = {
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

function PriorityBadge({
  priority,
}: {
  priority: PublicComplaint["priority"];
}) {
  const styles: Record<PublicComplaint["priority"], string> = {
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

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

function formatDateTime(value?: string | null): string {
  if (!value) return "N/A";

  return new Date(value).toLocaleString();
}