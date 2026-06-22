"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/common/Container";
import { PublicComplaintTimeline } from "@/components/complaints/PublicComplaintTimeline";
import { ROUTES } from "@/lib/routes";
import { getPublicComplaintDetails } from "@/services/public-tracking.service";
import type { PublicTrackedComplaint } from "@/types/public-tracking.types";

export default function PublicComplaintDetailsPage() {
  const params = useParams<{ complaintNo: string }>();

  const [complaint, setComplaint] = useState<PublicTrackedComplaint | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadComplaint() {
      try {
        setLoading(true);
        setMessage(null);

        const complaintNo = decodeURIComponent(params.complaintNo);

        const response = await getPublicComplaintDetails(complaintNo);

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

    if (params.complaintNo) {
      loadComplaint();
    }
  }, [params.complaintNo]);

  if (loading) {
    return <LoadingState message="Loading complaint tracking..." />;
  }

  if (!complaint) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Complaint Not Found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {message || "Please check the complaint number and try again."}
          </p>

          <Link
            href={ROUTES.trackComplaint}
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Track Another Complaint
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                Public Tracking Result
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
              href={ROUTES.trackComplaint}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Track Another
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <main className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap gap-3">
                <StatusBadge status={complaint.status} />

                <PriorityBadge priority={complaint.priority} />

                {complaint.is_overdue && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    SLA Overdue
                  </span>
                )}
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

            <PublicComplaintTimeline
              timeline={complaint.timeline}
              currentStatus={complaint.status}
            />
          </main>

          <aside className="space-y-6">
            <InfoCard title="Complaint Information">
              <InfoRow label="Status" value={formatLabel(complaint.status)} />
              <InfoRow label="Priority" value={formatLabel(complaint.priority)} />
              <InfoRow
                label="Department"
                value={complaint.department?.name || "N/A"}
              />
              <InfoRow label="Category" value={complaint.category?.name || "N/A"} />
              <InfoRow label="Zone" value={complaint.zone?.name || "N/A"} />
              <InfoRow
                label="Officer"
                value={complaint.assigned_officer?.name || "Not assigned"}
              />
            </InfoCard>

            <InfoCard title="SLA Tracking">
              <InfoRow label="Submitted" value={formatDateTime(complaint.submitted_at)} />
              <InfoRow label="SLA Due" value={formatDateTime(complaint.sla_due_at)} />
              <InfoRow label="Resolved" value={formatDateTime(complaint.resolved_at)} />
              <InfoRow
                label="SLA Status"
                value={complaint.is_overdue ? "Overdue" : "Within deadline"}
              />
            </InfoCard>

            <InfoCard title="Privacy Notice">
              <p className="text-sm leading-6 text-slate-600">
                For privacy, citizen phone, email, and uploaded media are hidden
                from public tracking.
              </p>
            </InfoCard>
          </aside>
        </div>
      </Container>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold capitalize text-blue-700">
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const className =
    priority === "critical"
      ? "bg-red-100 text-red-700"
      : priority === "high"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${className}`}>
      {priority}
    </span>
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

function formatDateTime(value?: string | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

function formatLabel(value: string): string {
  return value.replace("_", " ");
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