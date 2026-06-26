"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Container } from "@/components/common/Container";
import { ROUTES } from "@/lib/routes";
import {
  analyzeComplaintImages,
  analyzeMedia,
  getImageAnalysisMedia,
  runBulkImageAnalysis,
  updateImageAnalysisStatus,
} from "@/services/image-analysis.service";
import type {
  ComplaintMediaAiAnalysis,
  ImageAnalysisMediaItem,
  ImageAnalysisStats,
  ImageAnalysisStatus,
  VisualSeverity,
} from "@/types/image-analysis.types";

export default function AdminImageAnalysisPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      <AdminImageAnalysisContent />
    </AuthGuard>
  );
}

function AdminImageAnalysisContent() {
  const [mediaItems, setMediaItems] = useState<ImageAnalysisMediaItem[]>([]);
  const [stats, setStats] = useState<ImageAnalysisStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);
  const [analyzingMediaId, setAnalyzingMediaId] = useState<number | null>(null);
  const [analyzingComplaintId, setAnalyzingComplaintId] = useState<number | null>(
    null
  );
  const [updatingAnalysisId, setUpdatingAnalysisId] = useState<number | null>(
    null
  );
  const [message, setMessage] = useState<string | null>(null);

  async function loadPage() {
    try {
      setMessage(null);

      const response = await getImageAnalysisMedia();

      setMediaItems(response.data.items);
      setStats(response.data.stats);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load image analysis page."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  const analyzedCount = useMemo(() => {
    return mediaItems.filter((item) => item.analysis).length;
  }, [mediaItems]);

  async function handleAnalyzeMedia(item: ImageAnalysisMediaItem) {
    try {
      setAnalyzingMediaId(item.id);
      setMessage(null);

      const response = await analyzeMedia(item.id);

      setMediaItems((previous) =>
        previous.map((media) =>
          media.id === item.id ? { ...media, analysis: response.data.analysis } : media
        )
      );

      setMessage(`Image analysis completed for media #${item.id}.`);
      await loadPage();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image analysis failed.");
    } finally {
      setAnalyzingMediaId(null);
    }
  }

  async function handleAnalyzeComplaint(item: ImageAnalysisMediaItem) {
    if (!item.complaint) {
      return;
    }

    try {
      setAnalyzingComplaintId(item.complaint.id);
      setMessage(null);

      const response = await analyzeComplaintImages(item.complaint.id);

      setMessage(
        `Analyzed ${response.data.total_media_analyzed} image(s) for complaint ${response.data.complaint_no}.`
      );

      await loadPage();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Complaint image analysis failed."
      );
    } finally {
      setAnalyzingComplaintId(null);
    }
  }

  async function handleBulkAnalysis() {
    try {
      setBulkAnalyzing(true);
      setMessage(null);

      const response = await runBulkImageAnalysis();

      setMessage(
        `Bulk image analysis completed. Checked ${response.data.media_checked} media file(s) and saved ${response.data.analyses_saved} analysis result(s).`
      );

      await loadPage();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not run bulk image analysis."
      );
    } finally {
      setBulkAnalyzing(false);
    }
  }

  async function handleUpdateStatus(
    analysis: ComplaintMediaAiAnalysis,
    status: ImageAnalysisStatus
  ) {
    try {
      setUpdatingAnalysisId(analysis.id);
      setMessage(null);

      const note =
        status === "reviewed"
          ? "Admin reviewed this AI image analysis result."
          : status === "ignored"
          ? "Admin ignored this AI image analysis result."
          : "Marked as pending for future review.";

      const response = await updateImageAnalysisStatus(analysis.id, {
        status,
        review_note: note,
      });

      setMediaItems((previous) =>
        previous.map((item) =>
          item.analysis?.id === analysis.id
            ? { ...item, analysis: response.data.analysis }
            : item
        )
      );

      await loadPage();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update image analysis status."
      );
    } finally {
      setUpdatingAnalysisId(null);
    }
  }

  if (loading) {
    return <LoadingState message="Loading AI image analysis..." />;
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
                AI Image Analysis
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Analyze uploaded complaint images using local AI-ready metadata,
                image quality, complaint context, and issue-type detection.
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
                href={ROUTES.adminDuplicateDetection}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
              >
                Duplicate Detection
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

        <div className="mt-8 grid gap-5 md:grid-cols-3 lg:grid-cols-7">
          <StatCard label="Total Media" value={stats?.total_media || 0} />
          <StatCard label="Analyzed" value={stats?.analyzed_media || 0} />
          <StatCard label="Pending" value={stats?.pending_review || 0} />
          <StatCard label="Reviewed" value={stats?.reviewed || 0} />
          <StatCard label="Ignored" value={stats?.ignored || 0} />
          <StatCard label="High Confidence" value={stats?.high_confidence || 0} />
          <StatCard label="Critical" value={stats?.critical_visual || 0} />
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-secondary">
                Complaint Media Files
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {mediaItems.length} media file(s) loaded. {analyzedCount} already
                analyzed.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBulkAnalysis}
              disabled={bulkAnalyzing}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
            >
              {bulkAnalyzing ? "Running Bulk Analysis..." : "Run Bulk Image Analysis"}
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {mediaItems.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-secondary">
                No complaint media found
              </h3>
              <p className="mt-3 text-slate-600">
                Submit complaints with images first, then run image analysis.
              </p>
            </div>
          ) : (
            mediaItems.map((item) => (
              <ImageMediaCard
                key={item.id}
                item={item}
                analyzingMedia={analyzingMediaId === item.id}
                analyzingComplaint={
                  Boolean(item.complaint) &&
                  analyzingComplaintId === item.complaint?.id
                }
                updatingAnalysis={updatingAnalysisId === item.analysis?.id}
                onAnalyzeMedia={() => handleAnalyzeMedia(item)}
                onAnalyzeComplaint={() => handleAnalyzeComplaint(item)}
                onUpdateStatus={(status) =>
                  item.analysis && handleUpdateStatus(item.analysis, status)
                }
              />
            ))
          )}
        </div>
      </Container>
    </section>
  );
}

function ImageMediaCard({
  item,
  analyzingMedia,
  analyzingComplaint,
  updatingAnalysis,
  onAnalyzeMedia,
  onAnalyzeComplaint,
  onUpdateStatus,
}: {
  item: ImageAnalysisMediaItem;
  analyzingMedia: boolean;
  analyzingComplaint: boolean;
  updatingAnalysis: boolean;
  onAnalyzeMedia: () => void;
  onAnalyzeComplaint: () => void;
  onUpdateStatus: (status: ImageAnalysisStatus) => void;
}) {
  const analysis = item.analysis;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.file_name || "Complaint media"}
              className="h-64 w-full object-cover"
            />
          ) : (
            <div className="flex h-64 items-center justify-center p-6 text-center text-sm text-slate-500">
              No image preview available
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold text-primary">
                {item.complaint?.complaint_no || `Media #${item.id}`}
              </p>

              <h3 className="mt-2 text-2xl font-extrabold text-secondary">
                {item.complaint?.title || item.file_name || "Complaint Media"}
              </h3>

              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {item.complaint?.description || "No complaint description found."}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge label={item.complaint?.category?.name || "No Category"} />
                <Badge label={item.complaint?.department?.name || "No Department"} />
                <Badge label={item.complaint?.zone?.name || "No Zone"} />
                <Badge label={item.mime_type || "Unknown MIME"} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onAnalyzeMedia}
                disabled={analyzingMedia}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-70"
              >
                {analyzingMedia
                  ? "Analyzing..."
                  : analysis
                  ? "Re-analyze Image"
                  : "Analyze Image"}
              </button>

              <button
                type="button"
                onClick={onAnalyzeComplaint}
                disabled={analyzingComplaint || !item.complaint}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100 disabled:opacity-70"
              >
                {analyzingComplaint ? "Analyzing..." : "Analyze Full Complaint"}
              </button>
            </div>
          </div>

          {analysis ? (
            <AnalysisResultBox
              analysis={analysis}
              updating={updatingAnalysis}
              onUpdateStatus={onUpdateStatus}
            />
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              No AI image analysis result yet. Click{" "}
              <span className="font-bold text-secondary">Analyze Image</span> to
              generate one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalysisResultBox({
  analysis,
  updating,
  onUpdateStatus,
}: {
  analysis: ComplaintMediaAiAnalysis;
  updating: boolean;
  onUpdateStatus: (status: ImageAnalysisStatus) => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${severityClass(
            analysis.visual_severity
          )}`}
        >
          Severity: {analysis.visual_severity}
        </span>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
          Confidence: {analysis.confidence_score}%
        </span>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
          Quality: {analysis.quality_score}%
        </span>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-slate-700">
          {analysis.status}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <ScoreBox label="Detected Issue" value={formatIssueType(analysis.detected_issue_type)} />
        <ScoreBox
          label="Resolution"
          value={
            analysis.image_width && analysis.image_height
              ? `${analysis.image_width}x${analysis.image_height}`
              : "N/A"
          }
        />
        <ScoreBox label="Model" value={analysis.model_name} />
      </div>

      {analysis.analysis_summary && (
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Analysis Summary
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {analysis.analysis_summary}
          </p>
        </div>
      )}

      {analysis.safety_observations && (
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Safety Observations
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {analysis.safety_observations}
          </p>
        </div>
      )}

      {analysis.matched_visual_clues &&
        analysis.matched_visual_clues.length > 0 && (
          <div className="mt-5 rounded-2xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Matched Visual Clues
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.matched_visual_clues.map((clue) => (
                <span
                  key={clue}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                >
                  {clue}
                </span>
              ))}
            </div>
          </div>
        )}

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            AI Recommendations
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            {analysis.recommendations.map((recommendation) => (
              <li key={recommendation}>• {recommendation}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.review_note && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Review Note
          </p>
          <p className="mt-2 text-sm text-slate-700">{analysis.review_note}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdateStatus("reviewed")}
          className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-70"
        >
          Mark Reviewed
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() => onUpdateStatus("ignored")}
          className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-70"
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-secondary">{value}</p>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      {label}
    </span>
  );
}

function ScoreBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-extrabold text-secondary">{value}</p>
    </div>
  );
}

function severityClass(severity: VisualSeverity): string {
  if (severity === "critical") {
    return "bg-red-100 text-red-700";
  }

  if (severity === "high") {
    return "bg-amber-100 text-amber-700";
  }

  if (severity === "medium") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

function formatIssueType(value: string | null): string {
  if (!value) {
    return "N/A";
  }

  return value
    .split("_")
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