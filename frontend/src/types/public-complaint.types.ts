export type PublicComplaintPriority = "low" | "medium" | "high" | "critical";

export type PublicComplaintStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "closed";

export type PublicComplaintUser = {
  id: number;
  name: string;
};

export type PublicComplaintCategory = {
  id: number;
  name: string;
  slug: string;
  default_priority: PublicComplaintPriority;
  default_sla_hours: number;
};

export type PublicComplaintDepartment = {
  id: number;
  name: string;
  slug: string;
};

export type PublicComplaintZone = {
  id: number;
  name: string;
  city: string;
  ward_number: string | null;
};

export type PublicComplaintMedia = {
  id: number;
  media_type: "image" | "video" | "document";
  file_url: string | null;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string | null;
};

export type PublicComplaintTimeline = {
  id: number;
  old_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string | null;
};

export type PublicComplaint = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  priority: PublicComplaintPriority;
  status: PublicComplaintStatus;
  source: string;

  submitted_at: string | null;
  sla_due_at: string | null;
  resolved_at: string | null;
  assigned_at: string | null;

  citizen: PublicComplaintUser | null;
  category: PublicComplaintCategory | null;
  department: PublicComplaintDepartment | null;
  zone: PublicComplaintZone | null;
  assigned_officer: PublicComplaintUser | null;

  media: PublicComplaintMedia[];
  status_histories: PublicComplaintTimeline[];
};

export type PublicComplaintListResponse = {
  success: boolean;
  message: string;
  data: {
    complaints: PublicComplaint[];
  };
};

export type PublicComplaintSingleResponse = {
  success: boolean;
  message: string;
  data: {
    complaint: PublicComplaint;
  };
};

export type PublicComplaintStatsResponse = {
  success: boolean;
  message: string;
  data: {
    total: number;
    submitted: number;
    assigned: number;
    in_progress: number;
    resolved: number;
    by_department: {
      department_id: number | null;
      department_name: string;
      total: number;
    }[];
  };
};