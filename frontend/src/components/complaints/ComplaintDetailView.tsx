import Link from "next/link";
import type { Complaint } from "@/types/complaint.types";

export function ComplaintDetailView({
  complaint,
  backHref,
  backLabel,
  panelLabel,
}: {
  complaint: Complaint;
  backHref: string;
  backLabel: string;
  panelLabel: string;
}) {
  return (
    <section className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-primary">
              {panelLabel}
            </span>

            <h1 className="mt-5 text-4xl font-extrabold text-secondary">
              Complaint Details
            </h1>

            <p className="mt-3 text-slate-600">
              Full complaint information, timeline, assignment, and uploaded
              media.
            </p>
          </div>

          <Link
            href={backHref}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-secondary hover:bg-slate-100"
          >
            {backLabel}
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <HeaderCard complaint={complaint} />
            <DescriptionCard complaint={complaint} />
            <MediaGallery complaint={complaint} />
            <Timeline complaint={complaint} />
          </div>

          <aside className="space-y-6">
            <InfoCard title="Complaint Info">
              <InfoRow label="Complaint No" value={complaint.complaint_no} />
              <InfoRow label="Status" value={formatStatus(complaint.status)} />
              <InfoRow label="Priority" value={complaint.priority} />
              <InfoRow label="Source" value={complaint.source} />
              <InfoRow
                label="Submitted"
                value={formatDateTime(complaint.submitted_at)}
              />
              <InfoRow
                label="SLA Due"
                value={formatDateTime(complaint.sla_due_at)}
              />
              <InfoRow
                label="Resolved"
                value={formatDateTime(complaint.resolved_at)}
              />
            </InfoCard>

            <InfoCard title="Citizen">
              <InfoRow label="Name" value={complaint.citizen?.name || "N/A"} />
              <InfoRow label="Email" value={complaint.citizen?.email || "N/A"} />
              <InfoRow label="Phone" value={complaint.citizen?.phone || "N/A"} />
            </InfoCard>

            <InfoCard title="Category and Department">
              <InfoRow
                label="Category"
                value={complaint.category?.name || "N/A"}
              />
              <InfoRow
                label="Department"
                value={complaint.department?.name || "N/A"}
              />
              <InfoRow label="Zone" value={complaint.zone?.name || "N/A"} />
              <InfoRow label="City" value={complaint.zone?.city || "N/A"} />
              <InfoRow
                label="Ward"
                value={complaint.zone?.ward_number || "N/A"}
              />
            </InfoCard>

            <InfoCard title="Assignment">
              <InfoRow
                label="Assigned Officer"
                value={complaint.assigned_officer?.name || "Not assigned"}
              />
              <InfoRow
                label="Officer Email"
                value={complaint.assigned_officer?.email || "N/A"}
              />
              <InfoRow
                label="Assigned By"
                value={complaint.assigned_by?.name || "N/A"}
              />
              <InfoRow
                label="Assigned At"
                value={formatDateTime(complaint.assigned_at || null)}
              />
            </InfoCard>

            <InfoCard title="Location">
              <InfoRow label="Address" value={complaint.address} />
              <InfoRow label="Latitude" value={complaint.latitude || "N/A"} />
              <InfoRow label="Longitude" value={complaint.longitude || "N/A"} />
            </InfoCard>
          </aside>
        </div>
      </div>
    </section>
  );
}

function HeaderCard({ complaint }: { complaint: Complaint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {complaint.complaint_no}
        </span>

        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
      </div>

      <h2 className="mt-5 text-3xl font-extrabold text-secondary">
        {complaint.title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Category:{" "}
        <span className="font-semibold text-secondary">
          {complaint.category?.name || "N/A"}
        </span>{" "}
        • Department:{" "}
        <span className="font-semibold text-secondary">
          {complaint.department?.name || "N/A"}
        </span>
      </p>
    </div>
  );
}

function DescriptionCard({ complaint }: { complaint: Complaint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-secondary">Description</h3>

      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
        {complaint.description}
      </p>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-semibold text-secondary">Address</p>
        <p className="mt-2 text-sm text-slate-600">{complaint.address}</p>
      </div>
    </div>
  );
}

function MediaGallery({ complaint }: { complaint: Complaint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-secondary">Uploaded Media</h3>

      {complaint.media.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No media uploaded for this complaint.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {complaint.media.map((media) => (
            <div
              key={media.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
            >
              {media.file_url ? (
                <a href={media.file_url} target="_blank" rel="noreferrer">
                  <img
                    src={media.file_url}
                    alt={media.original_name || "Complaint media"}
                    className="h-64 w-full object-cover"
                  />
                </a>
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                  Media URL not available
                </div>
              )}

              <div className="p-4">
                <p className="truncate text-sm font-semibold text-secondary">
                  {media.original_name || "Uploaded image"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {media.size_bytes
                    ? `${(media.size_bytes / 1024).toFixed(2)} KB`
                    : "Size N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Timeline({ complaint }: { complaint: Complaint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-secondary">Status Timeline</h3>

      {complaint.status_histories.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No timeline history found.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {complaint.status_histories.map((history, index) => (
            <div key={history.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </div>

                {index !== complaint.status_histories.length - 1 && (
                  <div className="mt-2 h-full min-h-10 w-px bg-slate-200" />
                )}
              </div>

              <div className="flex-1 rounded-2xl bg-slate-50 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="font-bold text-secondary">
                    {formatStatus(history.old_status)} →{" "}
                    {formatStatus(history.new_status)}
                  </p>

                  <p className="text-xs font-medium text-slate-500">
                    {formatDateTime(history.created_at)}
                  </p>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {history.note || "No note added."}
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  Changed by: {history.changed_by?.name || "System"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-secondary">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <p className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Complaint["status"] }) {
  const styles: Record<Complaint["status"], string> = {
    submitted: "bg-blue-100 text-blue-700",
    under_review: "bg-purple-100 text-purple-700",
    assigned: "bg-indigo-100 text-indigo-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    closed: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Complaint["priority"] }) {
  const styles: Record<Complaint["priority"], string> = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function formatStatus(status?: string | null): string {
  if (!status) return "N/A";

  return status.replaceAll("_", " ");
}

function formatDateTime(value?: string | null): string {
  if (!value) return "N/A";

  return new Date(value).toLocaleString();
}