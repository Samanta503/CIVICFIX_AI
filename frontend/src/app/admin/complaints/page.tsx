"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getAdminMeta } from "@/services/admin.service";
import { getAdminComplaints } from "@/services/admin-complaint.service";
import type { AdminMetaResponse } from "@/types/admin.types";
import type {
  AdminComplaint,
  AdminComplaintFilters,
  AdminComplaintStats,
} from "@/types/admin-complaint.types";

export default function AdminComplaintsPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminComplaintsContent />
    </AuthGuard>
  );
}

function AdminComplaintsContent() {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [stats, setStats] = useState<AdminComplaintStats | null>(null);
  const [meta, setMeta] = useState<AdminMetaResponse["data"] | null>(null);
  const [filters, setFilters] = useState<AdminComplaintFilters>({
    search: "",
    status: "",
    priority: "",
    department_id: "",
    zone_id: "",
    date_from: "",
    date_to: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData(customFilters = filters) {
    try {
      setLoading(true);
      setMessage(null);

      const [complaintResponse, metaResponse] = await Promise.all([
        getAdminComplaints(customFilters),
        getAdminMeta(),
      ]);

      setComplaints(complaintResponse.data.complaints);
      setStats(complaintResponse.data.stats);
      setMeta(metaResponse.data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load admin complaints."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadData(filters);
  }

  async function resetFilters() {
    const emptyFilters = {
      search: "",
      status: "",
      priority: "",
      department_id: "",
      zone_id: "",
      date_from: "",
      date_to: "",
    };

    setFilters(emptyFilters);
    await loadData(emptyFilters);
  }

  if (loading) {
    return <LoadingState message="Loading admin complaints..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                Super Admin Monitoring
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                Complaint Monitoring
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                View all complaints, filter by department/status/priority, and
                monitor city-wide workflow.
              </p>
            </div>

            <Link
              href={ROUTES.adminDashboard}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {stats && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Submitted" value={stats.submitted} />
            <StatCard label="Assigned" value={stats.assigned} />
            <StatCard label="In Progress" value={stats.in_progress} />
            <StatCard label="Resolved" value={stats.resolved} />
            <StatCard label="Rejected" value={stats.rejected} />
            <StatCard label="Closed" value={stats.closed} />
            <StatCard label="Under Review" value={stats.under_review} />
          </div>
        )}

        <form
          onSubmit={handleFilter}
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-secondary">
            Advanced Filters
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={filters.search || ""}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Search complaint/citizen/address"
            />

            <select
              value={filters.status || ""}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.priority || ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
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

            <select
              value={filters.department_id || ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  department_id: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">All Departments</option>
              {meta?.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            <select
              value={filters.zone_id || ""}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, zone_id: event.target.value }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">All Zones</option>
              {meta?.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} — Ward {zone.ward_number || "N/A"}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.date_from || ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  date_from: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />

            <input
              type="date"
              value={filters.date_to || ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  date_to: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
              >
                Reset
              </button>
            </div>
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
                No complaints found
              </h2>
              <p className="mt-3 text-slate-600">
                Try changing your search or filter options.
              </p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <AdminComplaintCard key={complaint.id} complaint={complaint} />
            ))
          )}
        </div>
      </Container>
    </section>
  );
}

function AdminComplaintCard({ complaint }: { complaint: AdminComplaint }) {
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
              Citizen:{" "}
              <span className="font-semibold text-secondary">
                {complaint.citizen?.name || "N/A"}
              </span>
            </p>

            <p>
              Department:{" "}
              <span className="font-semibold text-secondary">
                {complaint.department?.name || "N/A"}
              </span>
            </p>

            <p>
              Category:{" "}
              <span className="font-semibold text-secondary">
                {complaint.category?.name || "N/A"}
              </span>
            </p>

            <p>
              Assigned Officer:{" "}
              <span className="font-semibold text-secondary">
                {complaint.assigned_officer?.name || "Not assigned"}
              </span>
            </p>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Address: {complaint.address}
          </p>

          <Link
            href={`${ROUTES.adminComplaints}/${complaint.id}`}
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Open Details
          </Link>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-semibold text-secondary">
            Images: {complaint.media.length}
          </p>
          <p className="mt-1">
            Submitted:{" "}
            {complaint.submitted_at
              ? new Date(complaint.submitted_at).toLocaleDateString()
              : "N/A"}
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