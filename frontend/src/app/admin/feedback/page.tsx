"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getAdminFeedback } from "@/services/feedback.service";
import type {
  AdminFeedbackItem,
  AdminFeedbackResponse,
} from "@/types/feedback.types";

export default function AdminFeedbackPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminFeedbackContent />
    </AuthGuard>
  );
}

function AdminFeedbackContent() {
  const [data, setData] = useState<AdminFeedbackResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeedback() {
      try {
        const response = await getAdminFeedback();
        setData(response.data);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load feedback."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFeedback();
  }, []);

  if (loading) {
    return <LoadingState message="Loading feedback analytics..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                Super Admin Feedback
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                Complaint Feedback Analytics
              </h1>

              <p className="mt-3 text-slate-600">
                Review citizen ratings, low satisfaction complaints, and
                department service quality.
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
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Feedback" value={data.stats.total_feedback} />
              <StatCard label="Average Rating" value={data.stats.average_rating} />
              <StatCard label="Low Rating" value={data.stats.low_rating} />
              <StatCard
                label="Unresolved Feedback"
                value={data.stats.unresolved_feedback}
              />
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-5">
              <StatCard label="5 Star" value={data.stats.five_star} />
              <StatCard label="4 Star" value={data.stats.four_star} />
              <StatCard label="3 Star" value={data.stats.three_star} />
              <StatCard label="2 Star" value={data.stats.two_star} />
              <StatCard label="1 Star" value={data.stats.one_star} />
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Department Rating Summary
              </h2>

              <div className="mt-5 grid gap-4">
                {data.department_summary.map((department) => (
                  <div
                    key={department.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-bold text-secondary">
                          {department.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {department.feedback_count} feedback received
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-extrabold text-primary">
                          {department.average_rating}/5
                        </p>
                        <p className="text-sm text-slate-500">
                          Average Rating
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                Feedback List
              </h2>

              <div className="mt-5 grid gap-4">
                {data.feedback.length === 0 ? (
                  <p className="text-sm text-slate-600">No feedback found.</p>
                ) : (
                  data.feedback.map((feedback) => (
                    <FeedbackCard key={feedback.id} feedback={feedback} />
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

function FeedbackCard({ feedback }: { feedback: AdminFeedbackItem }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        feedback.rating <= 2
          ? "border-red-200 bg-red-50"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
              {feedback.complaint?.complaint_no || "N/A"}
            </span>

            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-primary">
              {renderStars(feedback.rating)} ({feedback.rating}/5)
            </span>

            {!feedback.issue_resolved && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                Issue Not Resolved
              </span>
            )}
          </div>

          <h3 className="mt-4 text-xl font-bold text-secondary">
            {feedback.complaint?.title || "Complaint not found"}
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Citizen: {feedback.citizen?.name || "N/A"} • Department:{" "}
            {feedback.complaint?.department?.name || "N/A"}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Quality: {feedback.response_quality || "N/A"}
          </p>

          {feedback.comment && (
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Comment: {feedback.comment}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white px-4 py-3 text-sm">
          <p className="font-bold text-secondary">
            {feedback.submitted_at
              ? new Date(feedback.submitted_at).toLocaleDateString()
              : "N/A"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Submitted</p>
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

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
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