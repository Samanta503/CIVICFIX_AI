"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { getAuthUser } from "@/lib/auth-storage";
import { ROUTES } from "@/lib/routes";
import { getAdminDashboard } from "@/services/admin.service";
import type { AdminDashboardResponse } from "@/types/admin.types";

export default function AdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminDashboardContent />
    </AuthGuard>
  );
}

function AdminDashboardContent() {
  const user = getAuthUser();

  const [data, setData] = useState<AdminDashboardResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await getAdminDashboard();
        setData(response.data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Loading admin dashboard..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-primary">
            Welcome, {user?.name || "Super Admin"}
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-secondary">
            Super Admin Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Manage users, departments, categories, complaints, officer workload,
            SLA alerts, and full CivicFix AI operations.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={ROUTES.adminComplaints}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              Monitor Complaints
            </Link>

            <Link
              href={ROUTES.adminSlaAlerts}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100"
            >
              SLA Alerts
            </Link>

            <Link
              href={ROUTES.adminWorkload}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Workload Analytics
            </Link>

            <Link
              href={ROUTES.adminUsers}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Manage Users
            </Link>

            <Link
              href={ROUTES.adminDepartments}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Manage Departments
            </Link>

            <Link
              href={ROUTES.adminCategories}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Manage Categories
            </Link>

            <Link
              href={ROUTES.adminNotifications}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Notifications
            </Link>

            <Link
              href={ROUTES.adminAiClassifier}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              AI Complaint Classifier
            </Link>

           <Link
              href={ROUTES.adminFeedback}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
           >
              Feedback Analytics
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
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Users" value={data.stats.users} />
              <StatCard label="Departments" value={data.stats.departments} />
              <StatCard label="Categories" value={data.stats.categories} />
              <StatCard label="Complaints" value={data.stats.complaints} />
              <StatCard label="Resolved" value={data.stats.resolved} />
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Submitted" value={data.stats.submitted} />
              <StatCard label="Assigned" value={data.stats.assigned} />
              <StatCard label="In Progress" value={data.stats.in_progress} />
              <StatCard label="Officers" value={data.stats.officers} />
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-secondary">
                  Recent Complaints
                </h2>

                <Link
                  href={ROUTES.adminComplaints}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
                >
                  View All Complaints
                </Link>
              </div>

              <div className="mt-5 grid gap-4">
                {data.recent_complaints.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No recent complaints found.
                  </p>
                ) : (
                  data.recent_complaints.map((complaint) => (
                    <Link
                      key={complaint.id}
                      href={`${ROUTES.adminComplaints}/${complaint.id}`}
                      className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-slate-100"
                    >
                      <p className="text-xs font-bold text-primary">
                        {complaint.complaint_no}
                      </p>

                      <h3 className="mt-1 font-bold text-secondary">
                        {complaint.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">
                        {complaint.department || "N/A"} • {complaint.status}
                      </p>
                    </Link>
                  ))
                )}
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-secondary">{value}</p>
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