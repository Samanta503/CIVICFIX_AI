"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getAdminWorkload } from "@/services/admin-workload.service";
import type { AdminWorkloadResponse } from "@/types/admin-workload.types";

export default function AdminWorkloadPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminWorkloadContent />
    </AuthGuard>
  );
}

function AdminWorkloadContent() {
  const [data, setData] = useState<AdminWorkloadResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkload() {
      try {
        const response = await getAdminWorkload();
        setData(response.data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load workload analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorkload();
  }, []);

  if (loading) {
    return <LoadingState message="Loading workload analytics..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                Super Admin Analytics
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                Workload Analytics
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Monitor complaint load by department and officer, including
                overdue and unassigned complaints.
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

        {message && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
        )}

        {data && (
          <>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
              <StatCard label="Total" value={data.summary.total_complaints} />
              <StatCard label="Active" value={data.summary.active_complaints} />
              <StatCard label="Resolved" value={data.summary.resolved_complaints} />
              <StatCard label="Overdue" value={data.summary.overdue_complaints} />
              <StatCard label="Due Today" value={data.summary.due_today} />
              <StatCard label="Unassigned" value={data.summary.unassigned_complaints} />
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Department Workload
              </h2>

              <div className="mt-5 grid gap-4">
                {data.department_workload.map((department) => (
                  <div
                    key={department.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-secondary">
                          {department.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {department.slug}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-6">
                        <MiniStat label="Total" value={department.total_complaints} />
                        <MiniStat label="Submitted" value={department.submitted} />
                        <MiniStat label="Assigned" value={department.assigned} />
                        <MiniStat label="Progress" value={department.in_progress} />
                        <MiniStat label="Resolved" value={department.resolved} />
                        <MiniStat label="Overdue" value={department.overdue} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Officer Workload
              </h2>

              <div className="mt-5 grid gap-4">
                {data.officer_workload.map((officer) => (
                  <div
                    key={officer.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-secondary">
                          {officer.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {officer.email}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Department: {officer.department?.name || "N/A"} • Zone:{" "}
                          {officer.zone?.name || "N/A"}
                        </p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-5">
                        <MiniStat label="Total" value={officer.total_assigned} />
                        <MiniStat label="Assigned" value={officer.assigned} />
                        <MiniStat label="Progress" value={officer.in_progress} />
                        <MiniStat label="Resolved" value={officer.resolved} />
                        <MiniStat label="Overdue" value={officer.overdue} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Container>
    </section>
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-secondary">{value}</p>
    </div>
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