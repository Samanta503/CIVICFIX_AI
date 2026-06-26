"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getAiMonitoring } from "@/services/ai-monitoring.service";
import type {
  AiActivityLog,
  AiFeatureHealth,
  AiModelSummary,
  AiMonitoringData,
  AiMonitoringRecommendation,
  AiMonitoringRiskLevel,
} from "@/types/ai-monitoring.types";

export default function AdminAiMonitoringPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminAiMonitoringContent />
    </AuthGuard>
  );
}

function AdminAiMonitoringContent() {
  const [data, setData] = useState<AiMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [featureFilter, setFeatureFilter] = useState<string>("all");

  async function loadMonitoring() {
    try {
      setLoading(true);
      setMessage(null);

      const response = await getAiMonitoring();
      setData(response.data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load AI monitoring dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMonitoring();
  }, []);

  const filteredLogs = useMemo(() => {
    if (!data) {
      return [];
    }

    if (featureFilter === "all") {
      return data.activity_logs;
    }

    return data.activity_logs.filter((log) => log.feature === featureFilter);
  }, [data, featureFilter]);

  if (loading) {
    return <LoadingState message="Loading AI monitoring dashboard..." />;
  }

  if (message || !data) {
    return <ErrorState message={message || "No AI monitoring data found."} />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                CivicFix AI
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                AI Logs & Confidence Monitoring
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Monitor AI classifier, duplicate detection, and image analysis
                confidence scores, review queues, and activity logs.
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Model: {data.model_name} • Generated:{" "}
                {new Date(data.generated_at).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadMonitoring}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
              >
                Refresh Monitoring
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

        <StatsGrid data={data} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
          <FeatureHealthPanel items={data.feature_health} />
          <ConfidenceBandsPanel data={data} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
          <LowConfidencePanel items={data.low_confidence_items} />
          <ReviewQueuePanel data={data} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
          <ModelSummaryPanel data={data} />
          <RecommendationsPanel recommendations={data.recommendations} />
        </div>

        <ActivityLogsPanel
          logs={filteredLogs}
          featureFilter={featureFilter}
          onFeatureFilterChange={setFeatureFilter}
        />
      </Container>
    </section>
  );
}

function StatsGrid({ data }: { data: AiMonitoringData }) {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-3 xl:grid-cols-5">
      <StatCard label="Total AI Logs" value={data.stats.total_ai_logs} />

      <StatCard
        label="Average Confidence"
        value={`${data.stats.average_confidence}%`}
      />

      <StatCard
        label="Low Confidence"
        value={data.stats.low_confidence_total}
        tone="danger"
      />

      <StatCard
        label="Pending Reviews"
        value={
          data.stats.pending_duplicate_reviews + data.stats.pending_image_reviews
        }
        tone="warning"
      />

      <StatCard
        label="High Confidence"
        value={data.stats.high_confidence_total}
        tone="success"
      />
    </div>
  );
}

function FeatureHealthPanel({ items }: { items: AiFeatureHealth[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">AI Feature Health</h2>

      <p className="mt-2 text-sm text-slate-600">
        Health check of each AI module based on logs, confidence, and review
        status.
      </p>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div
            key={item.feature}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${healthClass(
                    item.health_status
                  )}`}
                >
                  {formatLabel(item.health_status)}
                </span>

                <h3 className="mt-3 font-extrabold text-secondary">
                  {item.label}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                <p className="mt-2 text-sm font-semibold text-primary">
                  {item.message}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <MiniMetric label="Logs" value={item.total_logs} />

                <MiniMetric
                  label="Avg"
                  value={`${item.average_confidence}%`}
                />

                <MiniMetric label="Low" value={item.low_confidence_total} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfidenceBandsPanel({ data }: { data: AiMonitoringData }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">Confidence Bands</h2>

      <p className="mt-2 text-sm text-slate-600">
        Low means below 50%, medium means 50–74%, and high means 75% or above.
      </p>

      <div className="mt-6 space-y-5">
        {data.confidence_bands.map((item) => {
          const total = Math.max(item.low + item.medium + item.high, 1);

          return (
            <div key={item.feature}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-secondary">{item.label}</h3>

                  <p className="text-xs text-slate-500">
                    Average confidence: {item.average_confidence}%
                  </p>
                </div>
              </div>

              <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-red-500"
                  style={{ width: `${(item.low / total) * 100}%` }}
                />

                <div
                  className="bg-amber-500"
                  style={{ width: `${(item.medium / total) * 100}%` }}
                />

                <div
                  className="bg-green-500"
                  style={{ width: `${(item.high / total) * 100}%` }}
                />
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
                  Low: {item.low}
                </span>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                  Medium: {item.medium}
                </span>

                <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                  High: {item.high}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LowConfidencePanel({ items }: { items: AiActivityLog[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">
        Low-Confidence AI Items
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        These AI outputs should be manually reviewed first.
      </p>

      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-green-50 p-5 text-sm font-semibold text-green-700">
            No low-confidence AI output found.
          </div>
        ) : (
          items.map((item) => <LogMiniCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

function ReviewQueuePanel({ data }: { data: AiMonitoringData }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">AI Review Queue</h2>

      <p className="mt-2 text-sm text-slate-600">
        Pending duplicate and image analysis results waiting for admin review.
      </p>

      <div className="mt-6 space-y-4">
        {data.review_queue.length === 0 ? (
          <div className="rounded-2xl bg-green-50 p-5 text-sm font-semibold text-green-700">
            No pending AI review item found.
          </div>
        ) : (
          data.review_queue.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
            >
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {formatLabel(item.feature)}
              </span>

              <h3 className="mt-3 font-extrabold text-secondary">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                {item.complaint_no || "No complaint no"} •{" "}
                {item.complaint_title || "No title"}
              </p>

              <p className="mt-2 text-sm font-bold text-primary">
                Score: {item.score}%
                {item.severity ? ` • Severity: ${item.severity}` : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ModelSummaryPanel({ data }: { data: AiMonitoringData }) {
  const modelSummary: AiModelSummary[] = Array.isArray(data.model_summary)
    ? data.model_summary
    : Object.values(data.model_summary || {});

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">Model Summary</h2>

      <p className="mt-2 text-sm text-slate-600">
        Summary grouped by local AI model name.
      </p>

      <div className="mt-6 space-y-4">
        {modelSummary.length === 0 ? (
          <p className="text-sm text-slate-500">No model summary found.</p>
        ) : (
          modelSummary.map((item) => (
            <div
              key={item.model_name}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
            >
              <h3 className="font-extrabold text-secondary">
                {item.model_name}
              </h3>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <MiniMetric label="Logs" value={item.total_logs} />

                <MiniMetric
                  label="Avg"
                  value={`${item.average_confidence}%`}
                />

                <MiniMetric label="Low" value={item.low_confidence_total} />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Latest activity:{" "}
                {item.latest_activity_at
                  ? new Date(item.latest_activity_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RecommendationsPanel({
  recommendations,
}: {
  recommendations: AiMonitoringRecommendation[];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">
        Monitoring Recommendations
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Suggested actions based on AI monitoring results.
      </p>

      <div className="mt-6 space-y-4">
        {recommendations.map((item) => (
          <div
            key={`${item.title}-${item.action}`}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
          >
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${riskPillClass(
                item.priority
              )}`}
            >
              {item.priority}
            </span>

            <h3 className="mt-3 font-extrabold text-secondary">
              {item.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>

            <p className="mt-3 text-sm font-bold text-primary">
              Action: {item.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityLogsPanel({
  logs,
  featureFilter,
  onFeatureFilterChange,
}: {
  logs: AiActivityLog[];
  featureFilter: string;
  onFeatureFilterChange: (value: string) => void;
}) {
  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary">AI Activity Logs</h2>

          <p className="mt-2 text-sm text-slate-600">
            Recent AI activity generated from classifier, duplicate, and image
            analysis records.
          </p>
        </div>

        <select
          value={featureFilter}
          onChange={(event) => onFeatureFilterChange(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-secondary outline-none focus:border-primary"
        >
          <option value="all">All AI Features</option>
          <option value="classification">Classifier</option>
          <option value="duplicate_detection">Duplicate Detection</option>
          <option value="image_analysis">Image Analysis</option>
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500">No AI logs found.</p>
        ) : (
          logs.map((log) => <ActivityLogCard key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
}

function ActivityLogCard({ log }: { log: AiActivityLog }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
              {log.feature_label}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${riskPillClass(
                log.risk_level
              )}`}
            >
              {log.confidence_score}% confidence
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-slate-600">
              {formatLabel(log.status)}
            </span>
          </div>

          <h3 className="mt-3 font-extrabold text-secondary">
            {log.result_title || "AI output"}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {log.complaint_no || "No complaint no"} •{" "}
            {log.complaint_title || "No complaint title"}
          </p>

          {log.summary && (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {log.summary}
            </p>
          )}

          <p className="mt-3 text-xs text-slate-400">
            {log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 md:w-56">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Model
          </p>

          <p className="mt-2 break-words text-sm font-bold text-secondary">
            {log.model_name}
          </p>
        </div>
      </div>
    </div>
  );
}

function LogMiniCard({ item }: { item: AiActivityLog }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-red-700">
        {item.confidence_score}% confidence
      </span>

      <h3 className="mt-3 font-extrabold text-red-700">
        {item.result_title || item.feature_label}
      </h3>

      <p className="mt-1 text-sm text-red-600">
        {item.complaint_no || "No complaint no"} •{" "}
        {item.complaint_title || "No title"}
      </p>

      <p className="mt-2 text-sm leading-6 text-red-600">{item.summary}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "danger" | "success" | "warning";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-100 bg-red-50 text-red-700"
      : tone === "success"
      ? "border-green-100 bg-green-50 text-green-700"
      : tone === "warning"
      ? "border-amber-100 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-white text-secondary";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-extrabold text-secondary">{value}</p>
    </div>
  );
}

function healthClass(status: string): string {
  if (status === "healthy") {
    return "bg-green-100 text-green-700";
  }

  if (status === "needs_review") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "warning") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function riskPillClass(level: AiMonitoringRiskLevel): string {
  if (level === "critical" || level === "high") {
    return "bg-red-100 text-red-700";
  }

  if (level === "medium") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-green-100 text-green-700";
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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