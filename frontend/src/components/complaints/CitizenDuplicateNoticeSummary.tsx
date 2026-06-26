"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCitizenDuplicateNotices } from "@/services/duplicate-notice.service";
import type { CitizenDuplicateNotice } from "@/types/duplicate-notice.types";

export function CitizenDuplicateNoticeSummary() {
  const [notices, setNotices] = useState<CitizenDuplicateNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotices() {
      try {
        const response = await getCitizenDuplicateNotices();
        setNotices(response.data.notices);
      } catch {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    }

    loadNotices();
  }, []);

  if (loading || notices.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-700">
            Duplicate Notice
          </span>

          <h2 className="mt-3 text-2xl font-extrabold text-amber-900">
            {notices.length} complaint
            {notices.length === 1 ? "" : "s"} marked as duplicate
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Some of your complaints are already being tracked under existing
            complaints.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {notices.slice(0, 3).map((notice) => (
          <div
            key={notice.id}
            className="rounded-2xl border border-amber-200 bg-white p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold text-primary">
                  {notice.source_complaint?.complaint_no}
                </p>

                <h3 className="mt-1 font-bold text-secondary">
                  {notice.source_complaint?.title || "Complaint"}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Duplicate of{" "}
                  <span className="font-bold">
                    {notice.matched_complaint?.complaint_no || "matched complaint"}
                  </span>{" "}
                  • {notice.similarity_score}% similar
                </p>
              </div>

              {notice.source_complaint && (
                <Link
                  href={`/citizen/complaints/${notice.source_complaint.complaint_no}`}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-teal-800"
                >
                  View Notice
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}