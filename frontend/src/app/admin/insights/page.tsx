"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getAiAdminInsights } from "@/services/ai-insights.service";
import type {
  AiAdminInsightsData,
  HotspotItem,
  InsightAlert,
  LocationPoint,
  RiskLevel,
} from "@/types/ai-insights.types";

export default function AdminInsightsPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminInsightsContent />
    </AuthGuard>
  );
}

function AdminInsightsContent() {
  const [data, setData] = useState<AiAdminInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadInsights() {
    try {
      setLoading(true);
      setMessage(null);

      const response = await getAiAdminInsights();
      setData(response.data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load AI admin insights."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInsights();
  }, []);

  if (loading) {
    return <LoadingState message="Loading AI insights dashboard..." />;
  }

  if (message || !data) {
    return <ErrorState message={message || "No insights data found."} />;
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
                AI Admin Insights & Hotspot Map
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Monitor complaint hotspots, SLA risk, AI results, citizen
                feedback, and department workload using local AI-ready analytics.
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Model: {data.model_name} • Generated:{" "}
                {new Date(data.generated_at).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadInsights}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
              >
                Refresh Insights
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

        <OverviewGrid data={data} />

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <HotspotMap points={data.location_points} hotspots={data.hotspots} />
          <AlertsPanel alerts={data.recent_alerts} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
          <HotspotTable hotspots={data.hotspots} />
          <RecommendationsPanel recommendations={data.recommendations} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-3">
          <SummaryPanel
            title="Status Summary"
            items={data.status_summary.map((item) => ({
              label: formatLabel(item.status),
              value: item.total,
            }))}
          />

          <SummaryPanel
            title="Priority Summary"
            items={data.priority_summary.map((item) => ({
              label: formatLabel(item.priority),
              value: item.total,
            }))}
          />

          <AiRiskPanel data={data} />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-3">
          <CategoryPanel data={data.category_summary} />
          <DepartmentPanel data={data.department_summary} />
          <FeedbackSlaPanel data={data} />
        </div>
      </Container>
    </section>
  );
}

function OverviewGrid({ data }: { data: AiAdminInsightsData }) {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Total Complaints"
        value={data.overview.total_complaints}
      />
      <StatCard label="Open" value={data.overview.open_complaints} />
      <StatCard
        label="High Risk Open"
        value={data.overview.high_risk_open_complaints}
        tone="danger"
      />
      <StatCard
        label="Overdue"
        value={data.overview.overdue_complaints}
        tone="danger"
      />
      <StatCard
        label="Resolution Rate"
        value={`${data.overview.resolution_rate}%`}
        tone="success"
      />
    </div>
  );
}

function HotspotMap({
  points,
  hotspots,
}: {
  points: LocationPoint[];
  hotspots: HotspotItem[];
}) {
  const bounds = useMemo(() => {
    const validPoints = points.filter(
      (point) => point.latitude !== null && point.longitude !== null
    );

    if (validPoints.length === 0) {
      return null;
    }

    const latitudes = validPoints.map((point) => Number(point.latitude));
    const longitudes = validPoints.map((point) => Number(point.longitude));

    return {
      minLat: Math.min(...latitudes),
      maxLat: Math.max(...latitudes),
      minLng: Math.min(...longitudes),
      maxLng: Math.max(...longitudes),
    };
  }, [points]);

  function position(point: LocationPoint) {
    if (
      !bounds ||
      point.latitude === null ||
      point.longitude === null ||
      bounds.maxLat === bounds.minLat ||
      bounds.maxLng === bounds.minLng
    ) {
      return {
        left: 50,
        top: 50,
      };
    }

    const left =
      ((Number(point.longitude) - bounds.minLng) /
        (bounds.maxLng - bounds.minLng)) *
        86 +
      7;

    const top =
      (1 -
        (Number(point.latitude) - bounds.minLat) /
          (bounds.maxLat - bounds.minLat)) *
        78 +
      11;

    return {
      left,
      top,
    };
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary">
            Complaint Hotspot Map
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Map-style visualization based on complaint latitude and longitude.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {points.length} location point(s)
        </span>
      </div>

      <div className="relative mt-6 h-[440px] overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-teal-50 to-blue-50">
        <div className="absolute inset-0 opacity-50">
          <div className="h-full w-full bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
        </div>

        {points.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <div>
              <h3 className="text-xl font-bold text-secondary">
                No location coordinates found
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Add latitude and longitude when submitting complaints to improve
                hotspot map accuracy.
              </p>
            </div>
          </div>
        ) : (
          points.map((point) => {
            const pos = position(point);

            return (
              <div
                key={point.id}
                className={`group absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg ${pointClass(
                  point
                )}`}
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  width: point.priority === "critical" ? 22 : 16,
                  height: point.priority === "critical" ? 22 : 16,
                }}
                title={`${point.complaint_no}: ${point.title}`}
              >
                <div className="absolute left-1/2 top-full z-50 mt-2 hidden w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xl group-hover:block">
                  <p className="text-xs font-bold text-primary">
                    {point.complaint_no}
                  </p>

                  <h4 className="mt-1 font-bold text-secondary">
                    {point.title}
                  </h4>

                  <p className="mt-2 text-xs text-slate-500">
                    {formatLabel(point.priority)} • {formatLabel(point.status)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {point.zone?.name || "No Zone"} •{" "}
                    {point.category?.name || "No Category"}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
            Legend
          </p>

          <div className="mt-2 grid gap-1.5 text-[10px] font-semibold text-slate-600">
            <LegendDot className="bg-red-500" label="Critical / Overdue" />
            <LegendDot className="bg-amber-500" label="High" />
            <LegendDot className="bg-blue-500" label="Medium" />
            <LegendDot className="bg-slate-400" label="Low" />
          </div>
        </div>
      </div>

      {hotspots.length > 0 && (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-secondary">
            Top hotspot: {hotspots[0].name}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {hotspots[0].main_reason}
          </p>
        </div>
      )}
    </div>
  );
}

function AlertsPanel({ alerts }: { alerts: InsightAlert[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">AI Alerts</h2>
      <p className="mt-2 text-sm text-slate-600">
        Important operational risks detected by the insights engine.
      </p>

      <div className="mt-6 space-y-4">
        {alerts.length === 0 ? (
          <div className="rounded-2xl bg-green-50 p-5 text-sm text-green-700">
            No critical alert found.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={`${alert.type}-${alert.title}`}
              className={`rounded-2xl border p-5 ${alertClass(alert.severity)}`}
            >
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold capitalize">
                {alert.severity}
              </span>

              <h3 className="mt-3 font-extrabold">{alert.title}</h3>
              <p className="mt-2 text-sm leading-6">{alert.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HotspotTable({ hotspots }: { hotspots: HotspotItem[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">Zone Hotspots</h2>
      <p className="mt-2 text-sm text-slate-600">
        Zone-wise score calculated from total, open, high-risk, and overdue
        complaints.
      </p>

      <div className="mt-6 space-y-4">
        {hotspots.length === 0 ? (
          <p className="text-sm text-slate-500">No hotspot found.</p>
        ) : (
          hotspots.map((hotspot) => (
            <div
              key={`${hotspot.id}-${hotspot.name}`}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${riskPillClass(
                        hotspot.risk_level
                      )}`}
                    >
                      {hotspot.risk_level}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                      Score: {hotspot.hotspot_score}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-extrabold text-secondary">
                    {hotspot.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {hotspot.main_reason}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <MiniMetric label="Total" value={hotspot.total} />
                  <MiniMetric label="Open" value={hotspot.open_total} />
                  <MiniMetric label="Risk" value={hotspot.high_risk_total} />
                  <MiniMetric label="Late" value={hotspot.overdue_total} />
                </div>
              </div>
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
  recommendations: AiAdminInsightsData["recommendations"];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">
        AI Recommendations
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Suggested admin actions based on current system condition.
      </p>

      <div className="mt-6 space-y-4">
        {recommendations.map((recommendation) => (
          <div
            key={`${recommendation.title}-${recommendation.action}`}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
          >
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${riskPillClass(
                recommendation.priority
              )}`}
            >
              {recommendation.priority}
            </span>

            <h3 className="mt-3 font-extrabold text-secondary">
              {recommendation.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {recommendation.description}
            </p>

            <p className="mt-3 text-sm font-bold text-primary">
              Action: {recommendation.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryPanel({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number }[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-secondary">{title}</h2>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No data found.</p>
        ) : (
          items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-600">
                  {item.label}
                </span>
                <span className="font-bold text-secondary">{item.value}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AiRiskPanel({ data }: { data: AiAdminInsightsData }) {
  const items = [
    {
      label: "AI Predictions",
      value: data.ai_summary.ai_predictions_total,
    },
    {
      label: "Pending Duplicates",
      value: data.ai_summary.pending_duplicate_suggestions,
    },
    {
      label: "Confirmed Duplicates",
      value: data.ai_summary.confirmed_duplicates,
    },
    {
      label: "Image Analyses",
      value: data.ai_summary.image_analyses_total,
    },
    {
      label: "Critical Images",
      value: data.ai_summary.critical_image_findings,
    },
  ];

  return <SummaryPanel title="AI System Summary" items={items} />;
}

function CategoryPanel({
  data,
}: {
  data: AiAdminInsightsData["category_summary"];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-secondary">Top Categories</h2>

      <div className="mt-5 space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">No category data found.</p>
        ) : (
          data.map((item) => (
            <div
              key={`${item.id}-${item.name}`}
              className="rounded-2xl bg-slate-50 p-4"
            >
              <h3 className="font-bold text-secondary">{item.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                Total: {item.total} • Open: {item.open_total} • High Risk:{" "}
                {item.high_risk_total}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DepartmentPanel({
  data,
}: {
  data: AiAdminInsightsData["department_summary"];
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-secondary">Departments</h2>

      <div className="mt-5 space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">No department data found.</p>
        ) : (
          data.map((item) => (
            <div
              key={`${item.id}-${item.name}`}
              className="rounded-2xl bg-slate-50 p-4"
            >
              <h3 className="font-bold text-secondary">{item.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                Total: {item.total} • Open: {item.open_total} • Overdue:{" "}
                {item.overdue_total}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FeedbackSlaPanel({ data }: { data: AiAdminInsightsData }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-secondary">SLA & Feedback</h2>

      <div className="mt-5 grid gap-4">
        <MiniInfoCard
          label="Overdue Complaints"
          value={data.sla_summary.overdue_complaints}
        />
        <MiniInfoCard
          label="Due Soon 24h"
          value={data.sla_summary.due_soon_24h}
        />
        <MiniInfoCard
          label="Average Rating"
          value={data.feedback_summary.average_rating}
        />
        <MiniInfoCard
          label="Low Rating Feedback"
          value={data.feedback_summary.low_rating_total}
        />
        <MiniInfoCard
          label="Unresolved Feedback"
          value={data.feedback_summary.unresolved_feedback_total}
        />
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
  value: number | string;
  tone?: "default" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-100 bg-red-50 text-red-700"
      : tone === "success"
      ? "border-green-100 bg-green-50 text-green-700"
      : "border-slate-200 bg-white text-secondary";

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-extrabold text-secondary">{value}</p>
    </div>
  );
}

function MiniInfoCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="font-extrabold text-secondary">{value}</span>
    </div>
  );
}

function LegendDot({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      <span>{label}</span>
    </div>
  );
}

function pointClass(point: LocationPoint): string {
  if (point.is_overdue || point.priority === "critical") {
    return "bg-red-500";
  }

  if (point.priority === "high") {
    return "bg-amber-500";
  }

  if (point.priority === "medium") {
    return "bg-blue-500";
  }

  return "bg-slate-400";
}

function riskPillClass(level: RiskLevel): string {
  if (level === "critical") {
    return "bg-red-100 text-red-700";
  }

  if (level === "high") {
    return "bg-amber-100 text-amber-700";
  }

  if (level === "medium") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

function alertClass(level: RiskLevel): string {
  if (level === "critical") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (level === "high") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (level === "medium") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
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