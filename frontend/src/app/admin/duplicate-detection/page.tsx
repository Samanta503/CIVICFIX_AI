"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getAiComplaintItems } from "@/services/ai.service";
import {
  getDuplicateSuggestions,
  runBulkDuplicateScan,
  runDuplicateScanForComplaint,
  updateDuplicateSuggestionStatus,
} from "@/services/duplicate.service";
import type { AiComplaintItem } from "@/types/ai.types";
import type {
  DuplicateStatus,
  DuplicateSuggestion,
  DuplicateStats,
} from "@/types/duplicate.types";

export default function AdminDuplicateDetectionPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminDuplicateDetectionContent />
    </AuthGuard>
  );
}

function AdminDuplicateDetectionContent() {
  const [complaints, setComplaints] = useState<AiComplaintItem[]>([]);
  const [suggestions, setSuggestions] = useState<DuplicateSuggestion[]>([]);
  const [stats, setStats] = useState<DuplicateStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<DuplicateStatus | "all">(
    "all"
  );

  const [loading, setLoading] = useState(true);
  const [bulkScanning, setBulkScanning] = useState(false);
  const [scanningId, setScanningId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadPage(status: DuplicateStatus | "all" = selectedStatus) {
    try {
      setMessage(null);

      const [complaintResponse, duplicateResponse] = await Promise.all([
        getAiComplaintItems(),
        getDuplicateSuggestions(status),
      ]);

      setComplaints(complaintResponse.data.items);
      setSuggestions(duplicateResponse.data.suggestions);
      setStats(duplicateResponse.data.stats);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load duplicate detection page."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage("all");
  }, []);

  const pendingComplaints = useMemo(() => {
    return complaints.slice(0, 20);
  }, [complaints]);

  async function handleStatusFilter(status: DuplicateStatus | "all") {
    setSelectedStatus(status);
    setLoading(true);
    await loadPage(status);
  }

  async function handleScanComplaint(complaint: AiComplaintItem) {
    try {
      setScanningId(complaint.id);
      setMessage(null);

      const response = await runDuplicateScanForComplaint(complaint.id);

      setMessage(
        `Duplicate scan completed for ${complaint.complaint_no}. Found ${response.data.suggestions.length} possible duplicate(s).`
      );

      await loadPage(selectedStatus);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not scan complaint."
      );
    } finally {
      setScanningId(null);
    }
  }

  async function handleBulkScan() {
    try {
      setBulkScanning(true);
      setMessage(null);

      const response = await runBulkDuplicateScan();

      setMessage(
        `Bulk scan completed. Checked ${response.data.complaints_checked} complaints and saved ${response.data.suggestions_saved} suggestion(s).`
      );

      await loadPage(selectedStatus);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not run bulk scan."
      );
    } finally {
      setBulkScanning(false);
    }
  }

  async function handleUpdateStatus(
    suggestion: DuplicateSuggestion,
    status: DuplicateStatus
  ) {
    try {
      setUpdatingId(suggestion.id);
      setMessage(null);

      const note =
        status === "confirmed"
          ? "Admin confirmed this as a duplicate complaint."
          : status === "rejected"
          ? "Admin rejected this duplicate suggestion."
          : status === "ignored"
          ? "Admin ignored this duplicate suggestion."
          : "Status changed to pending.";

      const response = await updateDuplicateSuggestionStatus(suggestion.id, {
        status,
        review_note: note,
      });

      setSuggestions((previous) =>
        previous.map((item) =>
          item.id === suggestion.id ? response.data.suggestion : item
        )
      );

      await loadPage(selectedStatus);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update duplicate suggestion."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <LoadingState message="Loading duplicate detection..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                CivicFix AI
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                AI Duplicate Complaint Detection
              </h1>

              <p className="mt-3 text-slate-600">
                Detect repeated complaints using text similarity, category,
                department, zone, and location distance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={ROUTES.adminAiClassifier}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
              >
                AI Classifier
              </Link>

              <Link
                href={ROUTES.adminDashboard}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-primary">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total" value={stats?.total || 0} />
          <StatCard label="Pending" value={stats?.pending || 0} />
          <StatCard label="Confirmed" value={stats?.confirmed || 0} />
          <StatCard label="Rejected" value={stats?.rejected || 0} />
          <StatCard label="Ignored" value={stats?.ignored || 0} />
          <StatCard label="High Similarity" value={stats?.high_similarity || 0} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Run Duplicate Detection
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Scan one complaint or run a bulk scan on the latest complaints.
              </p>

              <button
                type="button"
                onClick={handleBulkScan}
                disabled={bulkScanning}
                className="mt-5 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
              >
                {bulkScanning ? "Running Bulk Scan..." : "Run Bulk Duplicate Scan"}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-secondary">
                Latest Complaints
              </h2>

              <div className="mt-5 max-h-[720px] space-y-4 overflow-y-auto pr-1">
                {pendingComplaints.length === 0 ? (
                  <p className="text-sm text-slate-500">No complaints found.</p>
                ) : (
                  pendingComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-bold text-primary">
                        {complaint.complaint_no}
                      </p>

                      <h3 className="mt-2 font-bold text-secondary">
                        {complaint.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                        {complaint.description}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {complaint.category?.name || "N/A"} •{" "}
                        {complaint.zone?.name || "N/A"}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleScanComplaint(complaint)}
                        disabled={scanningId === complaint.id}
                        className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-70"
                      >
                        {scanningId === complaint.id
                          ? "Scanning..."
                          : "Scan Duplicate"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          <main className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-secondary">
                    Duplicate Suggestions
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    Review AI-detected possible duplicate complaints.
                  </p>
                </div>

                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    handleStatusFilter(event.target.value as DuplicateStatus | "all")
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-secondary outline-none focus:border-primary"
                >
                  <option value="all">All Suggestions</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                  <option value="ignored">Ignored</option>
                </select>
              </div>
            </div>

            {suggestions.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-secondary">
                  No duplicate suggestions found
                </h3>
                <p className="mt-3 text-slate-600">
                  Run a duplicate scan first to generate suggestions.
                </p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <DuplicateSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  updating={updatingId === suggestion.id}
                  onUpdateStatus={(status) =>
                    handleUpdateStatus(suggestion, status)
                  }
                />
              ))
            )}
          </main>
        </div>
      </Container>
    </section>
  );
}

function DuplicateSuggestionCard({
  suggestion,
  updating,
  onUpdateStatus,
}: {
  suggestion: DuplicateSuggestion;
  updating: boolean;
  onUpdateStatus: (status: DuplicateStatus) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${scoreClass(
                suggestion.similarity_score
              )}`}
            >
              {suggestion.similarity_score}% Similar
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
              {suggestion.status}
            </span>

            {suggestion.distance_meters !== null && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                {Math.round(suggestion.distance_meters)}m apart
              </span>
            )}
          </div>

          <h3 className="mt-4 text-xl font-extrabold text-secondary">
            Possible Duplicate Pair
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ComplaintMiniCard
              title="Source Complaint"
              complaint={suggestion.source_complaint}
            />

            <ComplaintMiniCard
              title="Matched Complaint"
              complaint={suggestion.matched_complaint}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <ScoreBox label="Text" value={suggestion.text_similarity_score} />
            <ScoreBox
              label="Category"
              value={suggestion.category_similarity_score}
            />
            <ScoreBox
              label="Location"
              value={suggestion.location_similarity_score}
            />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Matched Reasons
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {(suggestion.matched_reasons || []).map((reason) => (
                <span
                  key={reason}
                  className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>

          {suggestion.review_note && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Review Note
              </p>
              <p className="mt-2 text-sm text-slate-700">
                {suggestion.review_note}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdateStatus("confirmed")}
          className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-70"
        >
          Confirm Duplicate
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdateStatus("rejected")}
          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-70"
        >
          Reject
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdateStatus("ignored")}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100 disabled:opacity-70"
        >
          Ignore
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdateStatus("pending")}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100 disabled:opacity-70"
        >
          Mark Pending
        </button>
      </div>
    </div>
  );
}

function ComplaintMiniCard({
  title,
  complaint,
}: {
  title: string;
  complaint: DuplicateSuggestion["source_complaint"];
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      {!complaint ? (
        <p className="mt-3 text-sm text-slate-500">Complaint not found.</p>
      ) : (
        <>
          <p className="mt-3 text-xs font-bold text-primary">
            {complaint.complaint_no}
          </p>

          <h4 className="mt-2 font-extrabold text-secondary">
            {complaint.title}
          </h4>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {complaint.description}
          </p>

          <p className="mt-3 text-xs text-slate-500">
            {complaint.category?.name || "N/A"} •{" "}
            {complaint.department?.name || "N/A"} •{" "}
            {complaint.zone?.name || "N/A"}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Status: {complaint.status} • Priority: {complaint.priority}
          </p>
        </>
      )}
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-secondary">{value}%</p>
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

function scoreClass(score: number): string {
  if (score >= 75) {
    return "bg-red-100 text-red-700";
  }

  if (score >= 60) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-blue-100 text-blue-700";
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