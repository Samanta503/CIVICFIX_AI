export type SlaAlertStatus =
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "closed";

export type SlaAlertPriority = "low" | "medium" | "high" | "critical";

export type SlaAlertUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

export type SlaAlertDepartment = {
  id: number;
  name: string;
  slug: string;
};

export type SlaAlertCategory = {
  id: number;
  name: string;
  slug: string;
};

export type SlaAlertZone = {
  id: number;
  name: string;
  city: string;
  ward_number: string | null;
};

export type SlaEscalationSummary = {
  id: number;
  level: number;
  reason: string;
  note: string | null;
  status: "open" | "resolved";
  escalated_at: string | null;
  resolved_at?: string | null;
  escalated_by?: SlaAlertUser | null;
};

export type SlaAlert = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  status: SlaAlertStatus;
  priority: SlaAlertPriority;
  address: string;
  submitted_at: string | null;
  sla_due_at: string | null;
  is_overdue: boolean;
  is_due_today: boolean;
  hours_overdue: number;

  citizen: SlaAlertUser | null;
  department: SlaAlertDepartment | null;
  category: SlaAlertCategory | null;
  zone: SlaAlertZone | null;
  assigned_officer: SlaAlertUser | null;

  open_escalation: SlaEscalationSummary | null;
  latest_escalation: SlaEscalationSummary | null;
};

export type SlaStats = {
  active_sla: number;
  overdue: number;
  due_today: number;
  open_escalations: number;
  unassigned: number;
};

export type SlaAlertListResponse = {
  success: boolean;
  message: string;
  data: {
    stats: SlaStats;
    alerts: SlaAlert[];
  };
};

export type SlaRunCheckResponse = {
  success: boolean;
  message: string;
  data: {
    created_escalations: number;
  };
};

export type SlaEscalationResponse = {
  success: boolean;
  message: string;
  data: {
    escalation: SlaEscalationSummary;
    alert?: SlaAlert;
  };
};

export type SlaAlertFilters = {
  type?: string;
  department_id?: string;
  priority?: string;
  status?: string;
};