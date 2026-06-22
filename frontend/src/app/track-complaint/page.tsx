"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import { trackComplaintByNumber } from "@/services/public-tracking.service";

export default function TrackComplaintPage() {
  const router = useRouter();

  const [complaintNo, setComplaintNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage(null);

      const cleanedComplaintNo = complaintNo.trim();

      if (!cleanedComplaintNo) {
        throw new Error("Please enter your complaint number.");
      }

      await trackComplaintByNumber(cleanedComplaintNo);

      router.push(`${ROUTES.trackComplaint}/${encodeURIComponent(cleanedComplaintNo)}`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not track complaint. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
            Public Complaint Tracking
          </span>

          <h1 className="mt-5 text-4xl font-extrabold text-secondary">
            Track Your Complaint
          </h1>

          <p className="mt-3 text-slate-600">
            Enter your complaint number to check current status, SLA deadline,
            department, officer assignment, and timeline.
          </p>

          {message && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {message}
            </div>
          )}

          <form onSubmit={handleTrack} className="mt-8">
            <label className="block">
              <span className="text-sm font-semibold text-secondary">
                Complaint Number *
              </span>

              <input
                required
                value={complaintNo}
                onChange={(event) => setComplaintNo(event.target.value)}
                placeholder="Example: CFX-20260621-ITORZT"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
              >
                {loading ? "Tracking..." : "Track Complaint"}
              </button>

              <Link
                href={ROUTES.home}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
              >
                Back Home
              </Link>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}