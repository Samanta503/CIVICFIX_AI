"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  getAiComplaintItems,
  predictComplaintText,
  runAiPredictionForComplaint,
} from "@/services/ai.service";
import type { AiComplaintItem, AiPrediction } from "@/types/ai.types";

export default function AdminAiClassifierPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminAiClassifierContent />
    </AuthGuard>
  );
}

function AdminAiClassifierContent() {
  const [items, setItems] = useState<AiComplaintItem[]>([]);
  const [testPrediction, setTestPrediction] = useState<AiPrediction | null>(
    null
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [runningId, setRunningId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadItems() {
    try {
      setMessage(null);
      const response = await getAiComplaintItems();
      setItems(response.data.items);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load AI items."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const predicted = items.filter((item) => item.ai_prediction).length;
    const critical = items.filter(
      (item) => item.ai_prediction?.predicted_priority === "critical"
    ).length;
    const high = items.filter(
      (item) => item.ai_prediction?.predicted_priority === "high"
    ).length;

    return {
      total,
      predicted,
      pending: total - predicted,
      highRisk: critical + high,
    };
  }, [items]);

  async function handleTestPrediction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setTesting(true);
      setMessage(null);
      setTestPrediction(null);

      const response = await predictComplaintText({
        title: form.title,
        description: form.description,
        address: form.address,
      });

      setTestPrediction(response.data.prediction);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not generate prediction."
      );
    } finally {
      setTesting(false);
    }
  }

  async function handleRunAi(item: AiComplaintItem) {
    try {
      setRunningId(item.id);
      setMessage(null);

      const response = await runAiPredictionForComplaint(item.id);

      setItems((previous) =>
        previous.map((current) =>
          current.id === item.id ? response.data.item : current
        )
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not run AI prediction."
      );
    } finally {
      setRunningId(null);
    }
  }

  if (loading) {
    return <LoadingState message="Loading AI classifier..." />;
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
                AI Complaint Classifier
              </h1>

              <p className="mt-3 text-slate-600">
                Predict complaint category, department, priority, summary, and
                confidence score using the local AI classifier.
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

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <StatCard label="Total Complaints" value={stats.total} />
          <StatCard label="AI Predicted" value={stats.predicted} />
          <StatCard label="Pending AI" value={stats.pending} />
          <StatCard label="High Risk" value={stats.highRisk} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Test AI Prediction
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Write sample complaint text and test how AI classifies it.
              </p>

              <form onSubmit={handleTestPrediction} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-secondary">
                    Complaint Title *
                  </span>

                  <input
                    required
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Example: Road is broken badly"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-secondary">
                    Description *
                  </span>

                  <textarea
                    required
                    rows={5}
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Write complaint details..."
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-secondary">
                    Address
                  </span>

                  <input
                    value={form.address}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        address: event.target.value,
                      }))
                    }
                    placeholder="Example: Mirpur 10, Dhaka"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>

                <button
                  type="submit"
                  disabled={testing}
                  className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
                >
                  {testing ? "Analyzing..." : "Generate AI Prediction"}
                </button>
              </form>
            </div>

            {testPrediction && (
              <PredictionCard title="Test Prediction" prediction={testPrediction} />
            )}
          </aside>

          <main className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Complaint AI Predictions
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Run AI analysis on real complaints and store predictions in the
                database.
              </p>
            </div>

            {items.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h3 className="text-2xl font-bold text-secondary">
                  No complaints found
                </h3>
                <p className="mt-3 text-slate-600">
                  Submit complaints first, then run AI prediction.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <ComplaintAiCard
                  key={item.id}
                  item={item}
                  running={runningId === item.id}
                  onRunAi={() => handleRunAi(item)}
                />
              ))
            )}
          </main>
        </div>
      </Container>
    </section>
  );
}

function ComplaintAiCard({
  item,
  running,
  onRunAi,
}: {
  item: AiComplaintItem;
  running: boolean;
  onRunAi: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {item.complaint_no}
            </span>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold capitalize text-blue-700">
              Current: {item.priority}
            </span>

            {item.ai_prediction ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                AI Predicted
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Pending AI
              </span>
            )}
          </div>

          <h3 className="mt-4 text-2xl font-bold text-secondary">
            {item.title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {item.description}
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Existing Category: {item.category?.name || "N/A"} • Existing
            Department: {item.department?.name || "N/A"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Citizen: {item.citizen?.name || "N/A"} • Status: {item.status}
          </p>
        </div>

        <button
          type="button"
          onClick={onRunAi}
          disabled={running}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
        >
          {running
            ? "Running AI..."
            : item.ai_prediction
            ? "Re-run AI"
            : "Run AI"}
        </button>
      </div>

      {item.ai_prediction && (
        <div className="mt-6">
          <PredictionCard title="Saved AI Prediction" prediction={item.ai_prediction} />
        </div>
      )}
    </div>
  );
}

function PredictionCard({
  title,
  prediction,
}: {
  title: string;
  prediction: AiPrediction;
}) {
  const categoryName =
    prediction.predicted_category?.name ||
    prediction.predicted_category_name ||
    "N/A";

  const departmentName =
    prediction.predicted_department?.name ||
    prediction.predicted_department_name ||
    "N/A";

  return (
    <div className="rounded-3xl border border-teal-100 bg-teal-50 p-6">
      <h3 className="text-xl font-bold text-secondary">{title}</h3>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoBox label="Predicted Category" value={categoryName} />
        <InfoBox label="Predicted Department" value={departmentName} />
        <InfoBox
          label="Predicted Priority"
          value={prediction.predicted_priority}
        />
        <InfoBox
          label="Confidence Score"
          value={`${prediction.confidence_score}%`}
        />
      </div>

      {prediction.predicted_summary && (
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            AI Summary
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {prediction.predicted_summary}
          </p>
        </div>
      )}

      {prediction.reasoning && (
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            AI Reasoning
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {prediction.reasoning}
          </p>
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Matched Keywords
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ...(prediction.matched_keywords?.category || []),
            ...(prediction.matched_keywords?.priority || []),
          ].length === 0 ? (
            <span className="text-sm text-slate-500">No keywords matched.</span>
          ) : (
            [
              ...(prediction.matched_keywords?.category || []),
              ...(prediction.matched_keywords?.priority || []),
            ].map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
              >
                {keyword}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-extrabold capitalize text-secondary">{value}</p>
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