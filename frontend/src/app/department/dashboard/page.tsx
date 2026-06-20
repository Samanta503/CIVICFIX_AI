"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { getAuthUser } from "@/lib/auth-storage";
import { ROUTES } from "@/lib/routes";

export default function DepartmentDashboardPage() {
  return (
    <AuthGuard allowedRoles={["department_admin", "super_admin"]}>
      <DepartmentDashboardContent />
    </AuthGuard>
  );
}

function DepartmentDashboardContent() {
  const user = getAuthUser();

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-primary">
            Welcome, {user?.name || "Department Admin"}
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-secondary">
            Department Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Review submitted complaints, assign them to officers, and monitor
            workflow progress.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={ROUTES.departmentComplaints}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              Manage Department Complaints
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Review Complaints"
            description="See complaints submitted under your department."
          />

          <FeatureCard
            title="Assign Officers"
            description="Assign complaints to the correct officer."
          />

          <FeatureCard
            title="Track SLA"
            description="Monitor due time and priority-based deadline."
          />

          <FeatureCard
            title="Workflow History"
            description="Every status update is stored in complaint history."
          />
        </div>
      </Container>
    </section>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-bold text-secondary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}