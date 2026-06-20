"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  getPublicComplaintStats,
  getPublicComplaints,
} from "@/services/public-complaint.service";
import type {
  PublicComplaint,
  PublicComplaintStatsResponse,
} from "@/types/public-complaint.types";

export default function PublicComplaintsPage() {
  const [complaints, setComplaints] = useState<PublicComplaint[]>([]);
  const [stats, setStats] = useState<PublicComplaintStatsResponse["data"] | null>(
    null
  );
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadComplaints(customFilters = filters) {
    try {
      setLoading(true);
      setMessage(null);

      const [complaintResponse, statsResponse] = await Promise.all([
        getPublicComplaints(customFilters),
        getPublicComplaintStats(),
      ]);

      setComplaints(complaintResponse.data.complaints);
      setStats(statsResponse.data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load public complaints."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadComplaints(filters);
  }

  async function resetFilters() {
    const emptyFilters = {
      search: "",
      status: "",
      priority: "",
    };

    setFilters(emptyFilters);
    await loadComplaints(emptyFilters);
  }

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading public complaints...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
            Public Portal
          </span>

          <h1 className="mt-5 text-4xl font-extrabold text-secondary">
            Public Complaints
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            View publicly visible CivicFix AI complaints, track their progress,
            and see how city departments are responding.
          </p>
        </div>

        {stats && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Submitted" value={stats.submitted} />
            <StatCard label="Assigned" value={stats.assigned} />
            <StatCard label="In Progress" value={stats.in_progress} />
            <StatCard label="Resolved" value={stats.resolved} />
          </div>
        )}

        <form
          onSubmit={handleSearch}
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto_auto]">
            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  search: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Search by complaint no, title, address..."
            />

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  priority: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              Search
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {complaints.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                No public complaints found
              </h2>
              <p className="mt-3 text-slate-600">
                Try changing your search or filter options.
              </p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <PublicComplaintCard key={complaint.id} complaint={complaint} />
            ))
          )}
        </div>
      </Container>
    </section>
  );
}

function PublicComplaintCard({ complaint }: { complaint: PublicComplaint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
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

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {complaint.description}
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
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
              Submitted:{" "}
              <span className="font-semibold text-secondary">
                {complaint.submitted_at
                  ? new Date(complaint.submitted_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </p>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Address: {complaint.address}
          </p>

          <Link
            href={`${ROUTES.publicComplaints}/${complaint.complaint_no}`}
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Track Complaint
          </Link>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-semibold text-secondary">
            Images: {complaint.media.length}
          </p>
          <p className="mt-1">
            Citizen: {complaint.citizen?.name || "Anonymous"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-secondary">{value}</p>
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