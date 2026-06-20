export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export type ComplaintStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "closed";

export type ComplaintCategorySummary = {
  id: number;
  name: string;
  slug: string;
  default_priority: ComplaintPriority;
  default_sla_hours: number;
};

export type ComplaintDepartmentSummary = {
  id: number;
  name: string;
  slug: string;
};

export type ComplaintZoneSummary = {
  id: number;
  name: string;
  city: string;
  ward_number: string | null;
};

export type ComplaintUserSummary = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

export type ComplaintAssignedOfficer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  department?: ComplaintDepartmentSummary | null;
  zone?: ComplaintZoneSummary | null;
};

export type ComplaintMedia = {
  id: number;
  media_type: "image" | "video" | "document";
  file_url: string | null;
  original_name: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  created_at?: string | null;
};

export type ComplaintStatusHistory = {
  id: number;
  old_status: string | null;
  new_status: string;
  note: string | null;
  created_at: string | null;
  changed_by?: ComplaintUserSummary | null;
};

export type Complaint = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  source: string;

  submitted_at: string | null;
  sla_due_at: string | null;
  resolved_at: string | null;
  assigned_at?: string | null;

  citizen?: ComplaintUserSummary | null;
  category: ComplaintCategorySummary | null;
  department: ComplaintDepartmentSummary | null;
  zone: ComplaintZoneSummary | null;
  assigned_officer?: ComplaintAssignedOfficer | null;
  assigned_by?: ComplaintUserSummary | null;

  media: ComplaintMedia[];
  status_histories: ComplaintStatusHistory[];
};

export type OfficerSummary = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  department: ComplaintDepartmentSummary | null;
  zone: ComplaintZoneSummary | null;
};

export type ComplaintListResponse = {
  success: boolean;
  message: string;
  data: {
    complaints: Complaint[];
  };
};

export type ComplaintSingleResponse = {
  success: boolean;
  message: string;
  data: {
    complaint: Complaint;
  };
};

export type OfficerListResponse = {
  success: boolean;
  message: string;
  data: {
    officers: OfficerSummary[];
  };
};