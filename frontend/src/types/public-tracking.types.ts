export type PublicComplaintStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "closed";

export type PublicComplaintPriority = "low" | "medium" | "high" | "critical";

export type PublicComplaintTimelineItem = {
  id: number;
  old_status: string | null;
  new_status: PublicComplaintStatus | string;
  note: string | null;
  created_at: string | null;
  changed_by: {
    id: number;
    name: string;
  } | null;
};

export type PublicTrackedComplaint = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  address: string;
  priority: PublicComplaintPriority;
  status: PublicComplaintStatus;
  source: string;
  submitted_at: string | null;
  sla_due_at: string | null;
  resolved_at: string | null;
  is_overdue: boolean;

  category: {
    id: number;
    name: string;
    slug: string;
  } | null;

  department: {
    id: number;
    name: string;
    slug: string;
  } | null;

  zone: {
    id: number;
    name: string;
    city: string;
    ward_number: string | null;
  } | null;

  assigned_officer: {
    id: number;
    name: string;
  } | null;

  timeline: PublicComplaintTimelineItem[];
};

export type PublicComplaintTrackingResponse = {
  success: boolean;
  message: string;
  data: {
    complaint: PublicTrackedComplaint;
  };
};