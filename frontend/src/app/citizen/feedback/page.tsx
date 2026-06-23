"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { getCitizenFeedbackItems } from "@/services/feedback.service";
import type { CitizenFeedbackItem } from "@/types/feedback.types";

export default function CitizenFeedbackPage() {
  return (
    <AuthGuard allowedRoles={["citizen"]}>
      <CitizenFeedbackContent />
    </AuthGuard>
  );
}

function CitizenFeedbackContent() {
  const [items, setItems] = useState<CitizenFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadItems() {
      try {
        const response = await getCitizenFeedbackItems();
        setItems(response.data.items);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load feedback items."
        );
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  if (loading) {
    return <LoadingState message="Loading feedback items..." />;
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
                Citizen Feedback
              </span>

              <h1 className="mt-5 text-4xl font-extrabold text-secondary">
                Complaint Feedback
              </h1>

              <p className="mt-3 text-slate-600">
                Give feedback for resolved complaints and view your previous
                ratings.
              </p>
            </div>

            <Link
              href={ROUTES.citizenDashboard}
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

        <div className="mt-8 grid gap-5">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-secondary">
                No resolved complaints yet
              </h2>
              <p className="mt-3 text-slate-600">
                Feedback can be submitted only after a complaint is resolved.
              </p>
            </div>
          ) : (
            items.map((item) => <FeedbackItemCard key={item.id} item={item} />)
          )}
        </div>
      </Container>
    </section>
  );
}

function FeedbackItemCard({ item }: { item: CitizenFeedbackItem }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {item.complaint_no}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold capitalize text-green-700">
              {item.status}
            </span>

            {item.feedback ? (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                Feedback Submitted
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Feedback Pending
              </span>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-bold text-secondary">
            {item.title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {item.description}
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Department: {item.department?.name || "N/A"} • Category:{" "}
            {item.category?.name || "N/A"}
          </p>

          {item.feedback && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
              <p className="font-bold text-secondary">
                Your Rating: {renderStars(item.feedback.rating)}{" "}
                <span className="text-sm text-slate-500">
                  ({item.feedback.rating}/5)
                </span>
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Quality: {item.feedback.response_quality || "N/A"}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Issue Resolved: {item.feedback.issue_resolved ? "Yes" : "No"}
              </p>

              {item.feedback.comment && (
                <p className="mt-2 text-sm text-slate-600">
                  Comment: {item.feedback.comment}
                </p>
              )}
            </div>
          )}

          {!item.feedback && (
            <Link
              href={`${ROUTES.citizenComplaints}/${item.complaint_no}/feedback`}
              className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              Give Feedback
            </Link>
          )}
        </div>
      </div>
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