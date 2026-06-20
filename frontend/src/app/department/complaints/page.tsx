"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  assignComplaintToOfficer,
  getDepartmentComplaints,
  getDepartmentOfficers,
} from "@/services/complaint.service";
import type { Complaint, OfficerSummary } from "@/types/complaint.types";

export default function DepartmentComplaintsPage() {
  return (
    <AuthGuard allowedRoles={["department_admin", "super_admin"]}>
      <DepartmentComplaintsContent />
    </AuthGuard>
  );
}

function DepartmentComplaintsContent() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<OfficerSummary[]>([]);
  const [selectedOfficers, setSelectedOfficers] = useState<
    Record<number, string>
  >({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setMessage(null);

      const [complaintResponse, officerResponse] = await Promise.all([
        getDepartmentComplaints(),
        getDepartmentOfficers(),
      ]);

      setComplaints(complaintResponse.data.complaints);
      setOfficers(officerResponse.data.officers);
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Could not load department complaint data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAssign(complaintId: number) {
    const officerId = selectedOfficers[complaintId];

    if (!officerId) {
      setMessage({ text: "Please select an officer first.", type: "error" });
      return;
    }

    try {
      setAssigningId(complaintId);
      setMessage(null);

      await assignComplaintToOfficer({
        complaintId,
        officerId: Number(officerId),
        note: notes[complaintId] || undefined,
      });

      await loadData();
      setMessage({ text: "Complaint assigned successfully.", type: "success" });
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : "Could not assign complaint.",
        type: "error",
      });
    } finally {
      setAssigningId(null);
    }
  }

  if (loading) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-primary/10 to-teal-200/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-tl from-secondary/10 to-indigo-200/20 blur-3xl [animation-delay:2s]" />
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
              Loading department complaints...
            </p>
            <p className="text-xs text-slate-400">Please wait a moment</p>
          </div>

          <div className="mt-8 w-64 space-y-3">
            {[80, 60, 72].map((width, i) => (
              <div
                key={i}
                className="mx-auto h-3 animate-pulse rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200"
                style={{
                  width: `${width}%`,
                  animationDelay: `${i * 150}ms`,
                }}
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

            {/* Decorative corner blobs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-bl from-primary/10 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-110" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-gradient-to-tr from-secondary/5 to-transparent blur-2xl transition-transform duration-700 group-hover:scale-110" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Department Workflow
                </div>

                <h1 className="mt-4 bg-gradient-to-r from-secondary via-secondary to-slate-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
                  Department Complaints
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                  Review submitted complaints and assign them to officers from
                  the correct department.
                </p>

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
                href={ROUTES.departmentDashboard}
                className="group/btn inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary shadow-sm transition-all duration-300 hover:border-teal-200 hover:bg-teal-50/50 hover:text-primary hover:shadow-md active:scale-[0.98]"
              >
                <svg
                  className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover/btn:-translate-x-0.5 group-hover/btn:text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Message banner */}
          {message && (
            <div
              className={`relative overflow-hidden rounded-2xl border p-4 text-sm shadow-sm transition-all duration-300 ${
                message.type === "success"
                  ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700"
                  : "border-red-200 bg-gradient-to-r from-red-50 to-rose-50 text-red-700"
              }`}
            >
              <div
                className={`absolute left-0 top-0 h-full w-1 ${
                  message.type === "success"
                    ? "bg-gradient-to-b from-green-400 to-emerald-500"
                    : "bg-gradient-to-b from-red-400 to-rose-500"
                }`}
              />
              <div className="flex items-center gap-3 pl-3">
                {message.type === "success" ? (
                  <svg
                    className="h-5 w-5 shrink-0 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 shrink-0 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <div>
                  <p className="font-semibold">
                    {message.type === "success" ? "Success" : "Error"}
                  </p>
                  <p className="mt-0.5 opacity-90">{message.text}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {complaints.length === 0 ? (
            <div className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-16 text-center shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl">
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-teal-400 to-secondary" />
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-bl from-primary/5 to-transparent blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-secondary/5 to-transparent blur-2xl" />

              <div className="relative">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-teal-50 shadow-inner transition-transform duration-300 group-hover:scale-105">
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
                      d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
                    />
                  </svg>
                </div>

                <h2 className="mt-8 bg-gradient-to-r from-secondary to-slate-600 bg-clip-text text-2xl font-bold text-transparent">
                  No complaints found
                </h2>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                  Department complaints will appear here after citizens submit
                  them.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              {complaints.map((complaint, index) => (
                <DepartmentComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  officers={officers}
                  selectedOfficer={selectedOfficers[complaint.id] || ""}
                  note={notes[complaint.id] || ""}
                  assigning={assigningId === complaint.id}
                  index={index}
                  onOfficerChange={(value) =>
                    setSelectedOfficers((previous) => ({
                      ...previous,
                      [complaint.id]: value,
                    }))
                  }
                  onNoteChange={(value) =>
                    setNotes((previous) => ({
                      ...previous,
                      [complaint.id]: value,
                    }))
                  }
                  onAssign={() => handleAssign(complaint.id)}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function DepartmentComplaintCard({
  complaint,
  officers,
  selectedOfficer,
  note,
  assigning,
  index,
  onOfficerChange,
  onNoteChange,
  onAssign,
}: {
  complaint: Complaint;
  officers: OfficerSummary[];
  selectedOfficer: string;
  note: string;
  assigning: boolean;
  index: number;
  onOfficerChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onAssign: () => void;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/60 hover:shadow-xl hover:shadow-slate-200/60"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Top shine on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-secondary/0 opacity-0 transition-all duration-500 group-hover:opacity-100" />

      {/* Corner decorative blobs */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-bl from-primary/5 to-transparent blur-2xl transition-transform duration-500 group-hover:scale-150" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-gradient-to-tr from-secondary/5 to-transparent blur-2xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative p-6 md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left — Complaint details */}
          <div>
            {/* Badges */}
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
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                }
                label="Citizen"
                value={complaint.citizen?.name || "N/A"}
              />

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

              <MetaItem
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                }
                label="Assigned Officer"
                value={complaint.assigned_officer?.name || "Not assigned"}
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

          {/* Right — Assign Officer Panel */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-teal-50/30 p-5 transition-all duration-300 group-hover:border-teal-100">
            {/* Panel accent */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-teal-400 to-secondary opacity-60" />

            <div className="pl-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-teal-50">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.7}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-secondary">Assign Officer</h3>
              </div>

              {/* Officer select */}
              <div className="mt-4 group/input">
                <label className="mb-2 block text-sm font-semibold text-secondary">
                  Officer
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-4 w-4 text-slate-400 transition-colors duration-200 group-focus-within/input:text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.7}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-1.053M18 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.75 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </div>
                  <select
                    value={selectedOfficer}
                    onChange={(event) => onOfficerChange(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-secondary outline-none transition-all duration-300 focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5 focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Select officer</option>
                    {officers.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.name} —{" "}
                        {officer.department?.name || "N/A"}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Note textarea */}
              <div className="mt-4 group/input">
                <label className="mb-2 block text-sm font-semibold text-secondary">
                  Note
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-0 top-3 flex items-start pl-3">
                    <svg
                      className="h-4 w-4 text-slate-400 transition-colors duration-200 group-focus-within/input:text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.7}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                      />
                    </svg>
                  </div>
                  <textarea
                    value={note}
                    onChange={(event) => onNoteChange(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-secondary outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-primary focus:shadow-lg focus:shadow-primary/5 focus:ring-2 focus:ring-primary/10"
                    placeholder="Optional assignment note..."
                  />
                </div>
              </div>

              {/* Assign Button */}
              <button
                type="button"
                disabled={assigning}
                onClick={onAssign}
                className="group/btn relative mt-4 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:brightness-100"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                <span className="relative flex items-center justify-center gap-2">
                  {assigning ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                      Assign Complaint
                    </>
                  )}
                </span>
              </button>
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