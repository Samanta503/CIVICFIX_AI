export type AdminComplaintPriority = "low" | "medium" | "high" | "critical";

export type AdminComplaintStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "closed";

export type AdminComplaintUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

export type AdminComplaintDepartment = {
  id: number;
  name: string;
  slug: string;
};

export type AdminComplaintZone = {
  id: number;
  name: string;
  city: string;
  ward_number: string | null;
};

export type AdminComplaintCategory = {
  id: number;
  name: string;
  slug: string;
  default_priority: AdminComplaintPriority;
  default_sla_hours: number;
};

export type AdminComplaintMedia = {
  id: number;
  media_type: "image" | "video" | "document";
  file_url: string | null;
  original_name: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  created_at?: string | null;
};

export type AdminComplaintHistory = {
  id: number;
  old_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string | null;
  changed_by?: AdminComplaintUser | null;
};

export type AdminComplaint = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  priority: AdminComplaintPriority;
  status: AdminComplaintStatus;
  source: string;

  submitted_at: string | null;
  sla_due_at: string | null;
  resolved_at: string | null;
  assigned_at?: string | null;

  citizen?: AdminComplaintUser | null;
  category: AdminComplaintCategory | null;
  department: AdminComplaintDepartment | null;
  zone: AdminComplaintZone | null;
  assigned_officer?: AdminComplaintUser | null;
  assigned_by?: AdminComplaintUser | null;

  media: AdminComplaintMedia[];
  status_histories: AdminComplaintHistory[];
};

export type AdminComplaintStats = {
  total: number;
  submitted: number;
  under_review: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  closed: number;
};

export type AdminComplaintListResponse = {
  success: boolean;
  message: string;
  data: {
    stats: AdminComplaintStats;
    complaints: AdminComplaint[];
  };
};

export type AdminComplaintSingleResponse = {
  success: boolean;
  message: string;
  data: {
    complaint: AdminComplaint;
  };
};

export type AdminComplaintFilters = {
  search?: string;
  status?: string;
  priority?: string;
  department_id?: string;
  category_id?: string;
  zone_id?: string;
  assigned_officer_id?: string;
  date_from?: string;
  date_to?: string;
};

export type AdminComplaintUpdatePayload = {
  status?: AdminComplaintStatus;
  priority?: AdminComplaintPriority;
  assigned_officer_id?: number | null;
  note?: string;
};