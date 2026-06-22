import type {
  PublicComplaintStatus,
  PublicComplaintTimelineItem,
} from "@/types/public-tracking.types";

export function PublicComplaintTimeline({
  timeline,
  currentStatus,
}: {
  timeline: PublicComplaintTimelineItem[];
  currentStatus: PublicComplaintStatus;
}) {
  const steps = [
    "submitted",
    "under_review",
    "assigned",
    "in_progress",
    "resolved",
  ];

  const currentIndex = Math.max(0, steps.indexOf(currentStatus));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-secondary">Complaint Timeline</h2>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const active = index <= currentIndex;

          return (
            <div
              key={step}
              className={`rounded-2xl border p-4 text-center ${
                active
                  ? "border-teal-200 bg-teal-50 text-primary"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              <div
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                  active ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {index + 1}
              </div>

              <p className="mt-3 text-xs font-extrabold capitalize">
                {step.replace("_", " ")}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-5">
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-600">No status history found.</p>
        ) : (
          timeline.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </div>

                {index !== timeline.length - 1 && (
                  <div className="mt-2 h-full min-h-10 w-px bg-slate-200" />
                )}
              </div>

              <div className="flex-1 rounded-2xl bg-slate-50 p-5">
                <p className="font-bold capitalize text-secondary">
                  {item.old_status || "new"} →{" "}
                  {item.new_status.replace("_", " ")}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.note || "Complaint status updated."}
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  {item.changed_by?.name || "System"} •{" "}
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}