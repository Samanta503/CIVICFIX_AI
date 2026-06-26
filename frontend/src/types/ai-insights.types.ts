export type RiskLevel = "low" | "medium" | "high" | "critical";

export type AiInsightsOverview = {
  total_complaints: number;
  open_complaints: number;
  resolved_complaints: number;
  rejected_complaints: number;
  high_risk_open_complaints: number;
  overdue_complaints: number;
  submitted_today: number;
  submitted_this_week: number;
  resolution_rate: number;
};

export type StatusSummaryItem = {
  status: string;
  total: number;
};

export type PrioritySummaryItem = {
  priority: string;
  total: number;
};

export type CategorySummaryItem = {
  id: number | null;
  name: string;
  slug: string | null;
  total: number;
  open_total: number;
  high_risk_total: number;
};

export type DepartmentSummaryItem = {
  id: number | null;
  name: string;
  slug: string | null;
  total: number;
  open_total: number;
  overdue_total: number;
};

export type ZoneSummaryItem = {
  id: number | null;
  name: string;
  city: string | null;
  ward_number: string | null;
  total: number;
  open_total: number;
  high_risk_total: number;
  overdue_total: number;
  avg_latitude: number | null;
  avg_longitude: number | null;
};

export type HotspotItem = ZoneSummaryItem & {
  hotspot_score: number;
  risk_level: RiskLevel;
  main_reason: string;
};

export type LocationPoint = {
  id: number;
  complaint_no: string;
  title: string;
  status: string;
  priority: string;
  latitude: number | null;
  longitude: number | null;
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
    city: string | null;
    ward_number: string | null;
  } | null;
};

export type AiSummary = {
  ai_predictions_total: number;
  high_confidence_predictions: number;
  duplicate_suggestions_total: number;
  pending_duplicate_suggestions: number;
  confirmed_duplicates: number;
  image_analyses_total: number;
  critical_image_findings: number;
  pending_image_reviews: number;
};

export type SlaSummary = {
  overdue_complaints: number;
  due_soon_24h: number;
  open_without_deadline: number;
  total_escalations: number;
  open_escalations: number;
};

export type FeedbackSummary = {
  total_feedback: number;
  average_rating: number;
  low_rating_total: number;
  unresolved_feedback_total: number;
};

export type InsightAlert = {
  type: string;
  severity: RiskLevel;
  title: string;
  message: string;
};

export type AiRecommendation = {
  priority: RiskLevel;
  title: string;
  description: string;
  action: string;
};

export type AiAdminInsightsData = {
  generated_at: string;
  model_name: string;
  overview: AiInsightsOverview;
  status_summary: StatusSummaryItem[];
  priority_summary: PrioritySummaryItem[];
  category_summary: CategorySummaryItem[];
  department_summary: DepartmentSummaryItem[];
  zone_summary: ZoneSummaryItem[];
  hotspots: HotspotItem[];
  location_points: LocationPoint[];
  ai_summary: AiSummary;
  sla_summary: SlaSummary;
  feedback_summary: FeedbackSummary;
  recent_alerts: InsightAlert[];
  recommendations: AiRecommendation[];
};

export type AiAdminInsightsResponse = {
  success: boolean;
  message: string;
  data: AiAdminInsightsData;
};