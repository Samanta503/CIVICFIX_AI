"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  escalateDepartmentComplaint,
  getDepartmentSlaAlerts,
  resolveDepartmentEscalation,
} from "@/services/sla.service";
import type { SlaAlert, SlaAlertFilters, SlaStats } from "@/types/sla.types";

export default function DepartmentSlaAlertsPage() {
  return (
    <AuthGuard allowedRoles={["department_admin", "super_admin"]}>
      <DepartmentSlaAlertsContent />
    </AuthGuard>
  );
}

function DepartmentSlaAlertsContent() {
  const [alerts, setAlerts] = useState<SlaAlert[]>([]);
  const [stats, setStats] = useState<SlaStats | null>(null);
  const [filters, setFilters] = useState<SlaAlertFilters>({
    type: "",
    priority: "",
    status: "",
  });
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAlerts(customFilters = filters) {
    try {
      setLoading(true);
      setMessage(null);

      const response = await getDepartmentSlaAlerts(customFilters);

      setAlerts(response.data.alerts);
      setStats(response.data.stats);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load department SLA alerts."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadAlerts(filters);
  }

  async function handleEscalate(alert: SlaAlert) {
    try {
      setWorkingId(alert.id);
      setMessage(null);

      await escalateDepartmentComplaint({
        complaintId: alert.id,
        note: notes[alert.id] || "Manual escalation by Department Admin.",
      });

      await loadAlerts(filters);
      setMessage("Complaint escalated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not escalate complaint."
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function handleResolve(alert: SlaAlert) {
    if (!alert.open_escalation) return;

    try {
      setWorkingId(alert.id);
      setMessage(null);

      await resolveDepartmentEscalation({
        escalationId: alert.open_escalation.id,
        note: notes[alert.id] || "Escalation resolved by Department Admin.",
      });

      await loadAlerts(filters);
      setMessage("Escalation resolved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not resolve escalation."
      );
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) {
    return <LoadingState message="Loading department SLA alerts..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
                Department SLA
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                Department SLA Alerts
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Track overdue, due-today, and escalated complaints for your
                department.
              </p>
            </div>

            <Link
              href={ROUTES.departmentDashboard}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {stats && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Active SLA" value={stats.active_sla} />
            <StatCard label="Overdue" value={stats.overdue} />
            <StatCard label="Due Today" value={stats.due_today} />
            <StatCard label="Open Escalations" value={stats.open_escalations} />
            <StatCard label="Unassigned" value={stats.unassigned} />
          </div>
        )}

        <form
          onSubmit={handleFilter}
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <select
              value={filters.type || ""}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, type: event.target.value }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">All Alerts</option>
              <option value="overdue">Overdue</option>
              <option value="due_today">Due Today</option>
              <option value="escalated">Escalated</option>
              <option value="unassigned">Unassigned</option>
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
              value={filters.status || ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  status: event.target.value,
                }))
              }
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              Apply Filter
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {alerts.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                No SLA alerts found
              </h2>
            </div>
          ) : (
            alerts.map((alert) => (
              <DepartmentSlaAlertCard
                key={alert.id}
                alert={alert}
                note={notes[alert.id] || ""}
                working={workingId === alert.id}
                onNoteChange={(value) =>
                  setNotes((prev) => ({ ...prev, [alert.id]: value }))
                }
                onEscalate={() => handleEscalate(alert)}
                onResolve={() => handleResolve(alert)}
              />
            ))
          )}
        </div>
      </Container>
    </section>
  );
}

function DepartmentSlaAlertCard({
  alert,
  note,
  working,
  onNoteChange,
  onEscalate,
  onResolve,
}: {
  alert: SlaAlert;
  note: string;
  working: boolean;
  onNoteChange: (value: string) => void;
  onEscalate: () => void;
  onResolve: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {alert.complaint_no}
            </span>

            {alert.is_overdue && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                Overdue
              </span>
            )}

            {alert.open_escalation && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                Escalated L{alert.open_escalation.level}
              </span>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-bold text-secondary">
            {alert.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {alert.description}
          </p>

          <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <p>
              Officer:{" "}
              <span className="font-semibold text-secondary">
                {alert.assigned_officer?.name || "Not assigned"}
              </span>
            </p>

            <p>
              SLA Due:{" "}
              <span className="font-semibold text-secondary">
                {alert.sla_due_at
                  ? new Date(alert.sla_due_at).toLocaleString()
                  : "N/A"}
              </span>
            </p>

            <p>
              Status:{" "}
              <span className="font-semibold capitalize text-secondary">
                {alert.status.replace("_", " ")}
              </span>
            </p>

            <p>
              Priority:{" "}
              <span className="font-semibold capitalize text-secondary">
                {alert.priority}
              </span>
            </p>
          </div>

          <Link
            href={`${ROUTES.departmentComplaints}/${alert.id}`}
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Open Complaint
          </Link>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <h3 className="font-bold text-secondary">Department SLA Action</h3>

          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={4}
            className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="Write escalation/resolution note..."
          />

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              disabled={working}
              onClick={onEscalate}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-70"
            >
              {working ? "Working..." : "Escalate"}
            </button>

            <button
              type="button"
              disabled={working || !alert.open_escalation}
              onClick={onResolve}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100 disabled:opacity-70"
            >
              Resolve Escalation
            </button>
          </div>
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