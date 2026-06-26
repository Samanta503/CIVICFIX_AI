"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getDeploymentReadiness } from "@/services/deployment-readiness.service";
import type {
  DeploymentCheck,
  DeploymentCheckStatus,
  DeploymentReadinessData,
} from "@/types/deployment-readiness.types";

export default function AdminDeploymentReadinessPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminDeploymentReadinessContent />
    </AuthGuard>
  );
}

function AdminDeploymentReadinessContent() {
  const [data, setData] = useState<DeploymentReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DeploymentCheckStatus | "all">(
    "all"
  );

  async function loadReadiness() {
    try {
      setLoading(true);
      setMessage(null);

      const response = await getDeploymentReadiness();
      setData(response.data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load deployment readiness report."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReadiness();
  }, []);

  const filteredChecks = useMemo(() => {
    if (!data) {
      return [];
    }

    if (statusFilter === "all") {
      return data.checks;
    }

    return data.checks.filter((check) => check.status === statusFilter);
  }, [data, statusFilter]);

  if (loading) {
    return <LoadingState message="Checking deployment readiness..." />;
  }

  if (message || !data) {
    return <ErrorState message={message || "Readiness report not found."} />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                Chunk 22
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                Deployment Readiness
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Final backend, database, storage, AI table, and environment
                checks before deploying CivicFix AI.
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Generated: {new Date(data.generated_at).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadReadiness}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
              >
                Run Check Again
              </button>

              <Link
                href={ROUTES.adminDashboard}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <SummaryGrid data={data} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <EnvironmentPanel data={data} />
          <NextStepsPanel data={data} />
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-secondary">
                Readiness Checks
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Review failed and warning checks before deployment.
              </p>
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as DeploymentCheckStatus | "all")
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-secondary outline-none focus:border-primary"
            >
              <option value="all">All Checks</option>
              <option value="pass">Passed</option>
              <option value="warning">Warnings</option>
              <option value="fail">Failed</option>
            </select>
          </div>

          <div className="mt-6 grid gap-4">
            {filteredChecks.map((check) => (
              <CheckCard key={check.key} check={check} />
            ))}
          </div>
        </div>

        <DeploymentCommandsPanel commands={data.deployment_commands} />
      </Container>
    </section>
  );
}

function SummaryGrid({ data }: { data: DeploymentReadinessData }) {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-5">
      <StatCard label="Score" value={`${data.summary.score}%`} />
      <StatCard label="Total Checks" value={data.summary.total_checks} />
      <StatCard label="Passed" value={data.summary.passed} tone="success" />
      <StatCard label="Warnings" value={data.summary.warnings} tone="warning" />
      <StatCard label="Failed" value={data.summary.failed} tone="danger" />
    </div>
  );
}

function EnvironmentPanel({ data }: { data: DeploymentReadinessData }) {
  const environment = data.environment;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">Environment</h2>

      <div className="mt-6 grid gap-3">
        <InfoRow label="App Name" value={environment.app_name || "N/A"} />
        <InfoRow label="Environment" value={environment.app_env || "N/A"} />
        <InfoRow
          label="Debug"
          value={environment.app_debug ? "true" : "false"}
        />
        <InfoRow label="Backend URL" value={environment.app_url || "N/A"} />
        <InfoRow
          label="Frontend URL"
          value={environment.frontend_url || "N/A"}
        />
        <InfoRow label="PHP Version" value={environment.php_version} />
        <InfoRow label="Laravel Version" value={environment.laravel_version} />
        <InfoRow label="Timezone" value={environment.timezone || "N/A"} />
      </div>
    </div>
  );
}

function NextStepsPanel({ data }: { data: DeploymentReadinessData }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">
        Recommended Next Steps
      </h2>

      <div className="mt-6 space-y-3">
        {data.recommended_next_steps.map((step) => (
          <div
            key={step}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckCard({ check }: { check: DeploymentCheck }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
              check.status
            )}`}
          >
            {check.status.toUpperCase()}
          </span>

          <h3 className="mt-3 text-lg font-extrabold text-secondary">
            {check.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {check.message}
          </p>

          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Severity: {check.severity}
          </p>
        </div>
      </div>
    </div>
  );
}

function DeploymentCommandsPanel({ commands }: { commands: string[] }) {
  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">
        Production Backend Commands
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Run these on your production backend server after setting the production
        environment.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl bg-slate-950 p-5">
        <pre className="overflow-x-auto text-sm leading-7 text-slate-100">
          {commands.join("\n")}
        </pre>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const className =
    tone === "success"
      ? "border-green-100 bg-green-50 text-green-700"
      : tone === "warning"
      ? "border-amber-100 bg-amber-50 text-amber-700"
      : tone === "danger"
      ? "border-red-100 bg-red-50 text-red-700"
      : "border-slate-200 bg-white text-secondary";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${className}`}>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="break-all text-sm font-extrabold text-secondary">
        {value}
      </span>
    </div>
  );
}

function statusClass(status: DeploymentCheckStatus): string {
  if (status === "pass") {
    return "bg-green-100 text-green-700";
  }

  if (status === "warning") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
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

function ErrorState({ message }: { message: string }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-red-600">Unable to load</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </section>
  );
}