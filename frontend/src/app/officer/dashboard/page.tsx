"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { getAuthUser } from "@/lib/auth-storage";
import { ROUTES } from "@/lib/routes";

export default function OfficerDashboardPage() {
  return (
    <AuthGuard allowedRoles={["officer"]}>
      <OfficerDashboardContent />
    </AuthGuard>
  );
}

function OfficerDashboardContent() {
  const user = getAuthUser();

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-primary">
            Welcome, {user?.name || "Officer"}
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-secondary">
            Officer Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            View complaints assigned to you, start field work, and mark resolved
            complaints.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={ROUTES.officerAssignments}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              View Assigned Complaints
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Assigned Complaints"
            description="See complaints assigned by department admins."
          />

          <FeatureCard
            title="Start Progress"
            description="Mark complaint as in progress when work starts."
          />

          <FeatureCard
            title="Resolve Complaint"
            description="Mark complaint as resolved after fixing the issue."
          />

          <FeatureCard
            title="Status Notes"
            description="Add work notes while updating complaint progress."
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