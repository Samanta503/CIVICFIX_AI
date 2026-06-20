"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getCitizenComplaints } from "@/services/complaint.service";
import type { Complaint } from "@/types/complaint.types";

export default function CitizenComplaintsPage() {
  return (
    <AuthGuard allowedRoles={["citizen"]}>
      <CitizenComplaintsContent />
    </AuthGuard>
  );
}

function CitizenComplaintsContent() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await getCitizenComplaints();
        setComplaints(response.data.complaints);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load complaints."
        );
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, []);

  if (loading) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-primary/10 to-teal-200/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-tl from-secondary/10 to-indigo-200/20 blur-3xl [animation-delay:2s]" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-primary/5 to-secondary/5 blur-3xl [animation-delay:1s]" />
        </div>

        <div className="relative text-center">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
            <div className="absolute inset-2 animate-ping rounded-full bg-primary/10 [animation-delay:300ms]" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-teal-50 shadow-lg shadow-primary/10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <p className="text-sm font-semibold text-secondary">
              Loading your complaints...
            </p>
            <p className="text-xs text-slate-400">Please wait a moment</p>
          </div>

          {/* Loading skeleton shimmer bars */}
          <div className="mt-8 w-64 space-y-3">
            {[80, 60, 72].map((width, i) => (
              <div
                key={i}
                className="mx-auto h-3 animate-pulse rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200"
                style={{ width: `${width}%`, animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50 py-16">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-primary/10 to-teal-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-tl from-secondary/10 to-indigo-200/20 blur-3xl [animation-delay:2s]" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 animate-pulse rounded-full bg-gradient-to-r from-primary/5 to-secondary/5 blur-3xl [animation-delay:4s]" />
      </div>

      <Container>
        <div className="relative space-y-6">
          {/* Page Header */}
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/60">
            {/* Top accent bar */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-teal-400 to-secondary" />

            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-bl from-primary/10 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-110" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-gradient-to-tr from-secondary/5 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-110" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Citizen Panel
                </div>

                <h1 className="mt-4 bg-gradient-to-r from-secondary via-secondary to-slate-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
                  My Complaints
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                  View all complaints you have submitted to CivicFix AI.
                </p>

                {/* Complaint count pill */}
                {complaints.length > 0 && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <svg
                      className="h-3.5 w-3.5 text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v11.75A2.75 2.75 0 0 0 16.75 18h-12A2.75 2.75 0 0 1 2 15.25V3.5Zm3.75 7a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Zm0 3a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5ZM5.75 8a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {complaints.length}{" "}
                    {complaints.length === 1
                      ? "complaint found"
                      : "complaints found"}
                  </div>
                )}
              </div>

              <Link
                href={ROUTES.createComplaint}
                className="group/btn relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98]"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                <svg
                  className="relative h-5 w-5 transition-transform duration-300 group-hover/btn:rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="relative">Submit New Complaint</span>
              </Link>
            </div>
          </div>

          {/* Error message */}
          {message && (
            <div className="relative overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 text-sm text-red-700 shadow-sm">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-400 to-rose-500" />
              <div className="flex items-start gap-3 pl-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="font-semibold">Error loading complaints</p>
                  <p className="mt-0.5 text-red-600">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {complaints.length === 0 ? (
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-16 text-center shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl">
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-teal-400 to-secondary" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-bl from-primary/8 to-transparent blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-secondary/5 to-transparent blur-2xl" />

              <div className="relative">
                {/* Icon with rings */}
                <div className="relative mx-auto h-24 w-24">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/5 [animation-duration:3s]" />
                  <div className="absolute inset-3 animate-ping rounded-full bg-primary/5 [animation-delay:500ms] [animation-duration:3s]" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-teal-50 shadow-inner transition-transform duration-300 group-hover:scale-105">
                    <svg
                      className="h-12 w-12 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.4}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="mt-8 bg-gradient-to-r from-secondary to-slate-600 bg-clip-text text-2xl font-bold text-transparent">
                  No complaints submitted yet
                </h2>

                <p className="mt-3 max-w-xs mx-auto text-sm leading-6 text-slate-500">
                  Start by submitting your first city complaint.
                </p>

                <Link
                  href={ROUTES.createComplaint}
                  className="group/btn relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-teal-700 px-7 py-3.5 font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98]"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  <svg
                    className="relative h-5 w-5 transition-transform duration-300 group-hover/btn:rotate-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <span className="relative">Submit Complaint</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {complaints.map((complaint, index) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function ComplaintCard({
  complaint,
  index,
}: {
  complaint: Complaint;
  index: number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/60 hover:shadow-xl hover:shadow-slate-200/60"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Top shine on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-secondary/0 opacity-0 transition-all duration-500 group-hover:opacity-100" />

      {/* Corner decorative blob */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-bl from-primary/5 to-transparent blur-2xl transition-transform duration-500 group-hover:scale-150" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-gradient-to-tr from-secondary/5 to-transparent blur-2xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative p-6 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/60 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                <svg
                  className="h-3 w-3 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
                  />
                </svg>
                {complaint.complaint_no}
              </span>

              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>

            {/* Title */}
            <h2 className="mt-4 bg-gradient-to-r from-secondary to-slate-700 bg-clip-text text-xl font-bold text-transparent transition-all duration-500 group-hover:from-primary group-hover:to-teal-700">
              {complaint.title}
            </h2>

            {/* Description */}
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
              {complaint.description}
            </p>

            {/* Meta grid */}
            <div className="mt-5 grid gap-2.5 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-teal-50/20 p-4 text-sm transition-all duration-300 group-hover:border-teal-100/80 md:grid-cols-2">
              <MetaItem
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z"
                  />
                }
                label="Category"
                value={complaint.category?.name || "N/A"}
              />
              <MetaItem
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 21h16.5M4.5 3h15a.75.75 0 0 1 .75.75V21H3.75V3.75A.75.75 0 0 1 4.5 3Zm3 4.5h1.5m-1.5 3h1.5m-1.5 3h1.5m4.5-6h1.5m-1.5 3h1.5m-1.5 3h1.5"
                  />
                }
                label="Department"
                value={complaint.department?.name || "N/A"}
              />
              <MetaItem
                icon={
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </>
                }
                label="Zone"
                value={complaint.zone?.name || "N/A"}
              />
              <MetaItem
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                }
                label="SLA Due"
                value={
                  complaint.sla_due_at
                    ? new Date(complaint.sla_due_at).toLocaleString()
                    : "N/A"
                }
              />
            </div>

            {/* Address */}
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-500 transition-colors duration-300 group-hover:border-teal-100/60">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-primary/60"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <span className="leading-5">{complaint.address}</span>
            </div>
          </div>

          {/* Side info card */}
          <div className="flex shrink-0 flex-row gap-3 md:min-w-[160px] md:flex-col">
            <div className="flex flex-1 items-center gap-2 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-teal-50/40 p-4 transition-all duration-300 group-hover:border-teal-100 group-hover:shadow-md md:flex-col md:text-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-teal-50 md:mx-auto">
                <svg
                  className="h-5 w-5 text-primary/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400">Images</p>
                <p className="text-lg font-bold text-secondary leading-tight">
                  {complaint.media.length}
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-2 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-teal-50/40 p-4 transition-all duration-300 group-hover:border-teal-100 group-hover:shadow-md md:flex-col md:text-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-teal-50 md:mx-auto">
                <svg
                  className="h-5 w-5 text-primary/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.7}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-400">Submitted</p>
                <p className="text-sm font-bold text-secondary leading-tight">
                  {complaint.submitted_at
                    ? new Date(complaint.submitted_at).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      <svg
        className="h-4 w-4 shrink-0 text-primary/60"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.7}
        stroke="currentColor"
      >
        {icon}
      </svg>
      <span className="shrink-0">{label}:</span>
      <span className="truncate font-semibold text-secondary">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: Complaint["status"] }) {
  const styles: Record<
    Complaint["status"],
    { classes: string; dot: string; icon: React.ReactNode }
  > = {
    submitted: {
      classes:
        "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/60 text-blue-700",
      dot: "bg-blue-400",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z" />
        </svg>
      ),
    },
    under_review: {
      classes:
        "border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100/60 text-purple-700",
      dot: "bg-purple-400",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
          <path
            fillRule="evenodd"
            d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    assigned: {
      classes:
        "border-indigo-200 bg-gradient-to-r from-indigo-50 to-indigo-100/60 text-indigo-700",
      dot: "bg-indigo-400",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
        </svg>
      ),
    },
    in_progress: {
      classes:
        "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/60 text-amber-700",
      dot: "bg-amber-400 animate-pulse",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    resolved: {
      classes:
        "border-green-200 bg-gradient-to-r from-green-50 to-emerald-100/60 text-green-700",
      dot: "bg-green-400",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    rejected: {
      classes:
        "border-red-200 bg-gradient-to-r from-red-50 to-rose-100/60 text-red-700",
      dot: "bg-red-400",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    closed: {
      classes:
        "border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/60 text-slate-600",
      dot: "bg-slate-400",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const config = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize shadow-sm ${config.classes}`}
    >
      {config.icon}
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Complaint["priority"] }) {
  const styles: Record<
    Complaint["priority"],
    { classes: string; icon: React.ReactNode }
  > = {
    low: {
      classes:
        "border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/60 text-slate-600",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 1.5 0V8.66l1.95 2.1a.75.75 0 1 0 1.1-1.02l-3.25-3.5a.75.75 0 0 0-1.1 0L6.2 9.74a.75.75 0 1 0 1.1 1.02l1.95-2.1v4.59Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    medium: {
      classes:
        "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/60 text-blue-700",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    high: {
      classes:
        "border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/60 text-amber-700",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v4.59L7.3 9.24a.75.75 0 1 0-1.1 1.02l3.25 3.5a.75.75 0 0 0 1.1 0l3.25-3.5a.75.75 0 1 0-1.1-1.02l-1.95 2.1V6.75Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    critical: {
      classes:
        "border-red-200 bg-gradient-to-r from-red-50 to-rose-100/60 text-red-700",
      icon: (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const config = styles[priority];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize shadow-sm ${config.classes}`}
    >
      {config.icon}
      {priority}
    </span>
  );
}