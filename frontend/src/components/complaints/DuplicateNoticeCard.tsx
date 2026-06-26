"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCitizenComplaintDuplicateNotice } from "@/services/duplicate-notice.service";
import type { CitizenDuplicateNotice } from "@/types/duplicate-notice.types";

type DuplicateNoticeCardProps = {
  complaintNo?: string;
  notice?: CitizenDuplicateNotice | null;
  compact?: boolean;
};

export function DuplicateNoticeCard({
  complaintNo,
  notice: initialNotice = null,
  compact = false,
}: DuplicateNoticeCardProps) {
  const [notice, setNotice] = useState<CitizenDuplicateNotice | null>(
    initialNotice
  );
  const [loading, setLoading] = useState(Boolean(complaintNo && !initialNotice));

  useEffect(() => {
    async function loadNotice() {
      if (!complaintNo || initialNotice) {
        return;
      }

      try {
        const response = await getCitizenComplaintDuplicateNotice(complaintNo);
        setNotice(response.data.notice);
      } catch {
        setNotice(null);
      } finally {
        setLoading(false);
      }
    }

    loadNotice();
  }, [complaintNo, initialNotice]);

  if (loading || !notice) {
    return null;
  }

  const matchedComplaint = notice.matched_complaint;

  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-amber-50 ${
        compact ? "mt-4 p-4" : "p-6"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
            Duplicate Complaint Confirmed
          </span>

          <h3
            className={`mt-3 font-extrabold text-amber-900 ${
              compact ? "text-lg" : "text-2xl"
            }`}
          >
            This complaint is already being tracked
          </h3>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Your complaint has been confirmed as a duplicate
            {matchedComplaint ? (
              <>
                {" "}
                of{" "}
                <span className="font-extrabold">
                  {matchedComplaint.complaint_no}
                </span>
                .
              </>
            ) : (
              "."
            )}{" "}
            The original issue will continue to be handled by the authority.
          </p>

          {notice.review_note && (
            <p className="mt-3 text-sm leading-6 text-amber-800">
              <span className="font-bold">Admin Note:</span>{" "}
              {notice.review_note}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-800">
              Similarity: {notice.similarity_score}%
            </span>

            {notice.distance_meters !== null && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-800">
                Distance: {Math.round(notice.distance_meters)}m
              </span>
            )}

            {notice.reviewed_at && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-800">
                Confirmed: {new Date(notice.reviewed_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {notice.matched_reasons && notice.matched_reasons.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {notice.matched_reasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-700"
                >
                  {reason}
                </span>
              ))}
            </div>
          )}
        </div>

        {matchedComplaint && (
          <div className="rounded-2xl bg-white p-4 md:w-72">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Matched Complaint
            </p>

            <p className="mt-2 text-sm font-extrabold text-secondary">
              {matchedComplaint.complaint_no}
            </p>

            <p className="mt-1 text-sm font-bold text-secondary">
              {matchedComplaint.title}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Status: {matchedComplaint.status} • Priority:{" "}
              {matchedComplaint.priority}
            </p>

            <Link
              href={`/track-complaint/${matchedComplaint.complaint_no}`}
              className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
            >
              Track Matched Complaint
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}