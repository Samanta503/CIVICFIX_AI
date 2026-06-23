"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  getCitizenFeedbackContext,
  submitCitizenFeedback,
} from "@/services/feedback.service";
import type { CitizenFeedbackItem } from "@/types/feedback.types";

export default function CitizenFeedbackFormPage() {
  return (
    <AuthGuard allowedRoles={["citizen"]}>
      <CitizenFeedbackFormContent />
    </AuthGuard>
  );
}

function CitizenFeedbackFormContent() {
  const params = useParams<{ complaintNo: string }>();
  const router = useRouter();

  const [item, setItem] = useState<CitizenFeedbackItem | null>(null);
  const [form, setForm] = useState({
    rating: 5,
    response_quality: "excellent",
    issue_resolved: true,
    comment: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const complaintNo = decodeURIComponent(params.complaintNo || "");

  useEffect(() => {
    async function loadContext() {
      try {
        setLoading(true);
        setMessage(null);

        const response = await getCitizenFeedbackContext(complaintNo);

        setItem(response.data.item);

        if (response.data.item.feedback) {
          setMessage("You have already submitted feedback for this complaint.");
        }
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load feedback form."
        );
      } finally {
        setLoading(false);
      }
    }

    if (complaintNo) {
      loadContext();
    }
  }, [complaintNo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage(null);

      await submitCitizenFeedback(complaintNo, {
        rating: Number(form.rating),
        response_quality: form.response_quality as
          | "poor"
          | "fair"
          | "good"
          | "excellent",
        issue_resolved: form.issue_resolved,
        comment: form.comment || undefined,
      });

      router.push(ROUTES.citizenFeedback);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not submit feedback."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading feedback form..." />;
  }

  if (!item) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">Unable to load</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {message || "Complaint not found."}
          </p>

          <Link
            href={ROUTES.citizenFeedback}
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
          >
            Back to Feedback
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
            Complaint Feedback
          </span>

          <h1 className="mt-5 text-4xl font-extrabold text-secondary">
            Rate Your Complaint Experience
          </h1>

          <p className="mt-3 text-slate-600">
            Complaint No:{" "}
            <span className="font-bold text-secondary">
              {item.complaint_no}
            </span>
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <h2 className="text-xl font-bold text-secondary">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              {message}
            </div>
          )}

          {item.feedback ? (
            <Link
              href={ROUTES.citizenFeedback}
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"
            >
              Back to Feedback
            </Link>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-secondary">
                  Rating *
                </span>

                <select
                  value={form.rating}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      rating: Number(event.target.value),
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Poor</option>
                  <option value={1}>1 - Very Poor</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-secondary">
                  Response Quality
                </span>

                <select
                  value={form.response_quality}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      response_quality: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-secondary">
                  Was your issue resolved? *
                </span>

                <select
                  value={form.issue_resolved ? "yes" : "no"}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      issue_resolved: event.target.value === "yes",
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="yes">Yes, issue was resolved</option>
                  <option value="no">No, issue was not resolved</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-secondary">
                  Comment
                </span>

                <textarea
                  rows={5}
                  value={form.comment}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      comment: event.target.value,
                    }))
                  }
                  placeholder="Write your experience..."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
                >
                  {saving ? "Submitting..." : "Submit Feedback"}
                </button>

                <Link
                  href={ROUTES.citizenFeedback}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
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