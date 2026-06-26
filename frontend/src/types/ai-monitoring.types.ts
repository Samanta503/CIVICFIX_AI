export type AiMonitoringRiskLevel = "low" | "medium" | "high" | "critical";

export type AiMonitoringHealthStatus =
  | "healthy"
  | "warning"
  | "needs_review"
  | "inactive";

export type AiMonitoringStats = {
  total_ai_logs: number;
  classification_logs: number;
  duplicate_logs: number;
  image_logs: number;
  low_confidence_total: number;
  medium_confidence_total: number;
  high_confidence_total: number;
  average_confidence: number;
  pending_duplicate_reviews: number;
  pending_image_reviews: number;
  critical_image_findings: number;
};

export type AiFeatureHealth = {
  feature: string;
  label: string;
  description: string;
  total_logs: number;
  average_confidence: number;
  low_confidence_total: number;
  pending_review_total: number;
  health_status: AiMonitoringHealthStatus;
  message: string;
};

export type AiConfidenceBand = {
  feature: string;
  label: string;
  low: number;
  medium: number;
  high: number;
  average_confidence: number;
};

export type AiModelSummary = {
  model_name: string;
  total_logs: number;
  average_confidence: number;
  low_confidence_total: number;
  latest_activity_at: string | null;
};

export type AiActivityLog = {
  id: string;
  raw_id: number;
  feature: string;
  feature_label: string;
  event_type: string;
  model_name: string;
  complaint_id: number | null;
  complaint_no: string | null;
  complaint_title: string | null;
  complaint_status: string | null;
  complaint_priority: string | null;
  result_title: string | null;
  result_subtitle: string | null;
  confidence_score: number;
  risk_level: AiMonitoringRiskLevel;
  status: string;
  summary: string | null;
  details: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AiReviewQueueItem = {
  id: string;
  feature: string;
  title: string;
  complaint_no: string | null;
  complaint_title: string | null;
  score: number;
  severity?: string;
  created_at: string | null;
};

export type AiMonitoringRecommendation = {
  priority: AiMonitoringRiskLevel;
  title: string;
  description: string;
  action: string;
};

export type AiMonitoringData = {
  generated_at: string;
  model_name: string;
  stats: AiMonitoringStats;
  feature_health: AiFeatureHealth[];
  confidence_bands: AiConfidenceBand[];
  model_summary: AiModelSummary[] | Record<string, AiModelSummary>;
  low_confidence_items: AiActivityLog[];
  review_queue: AiReviewQueueItem[];
  activity_logs: AiActivityLog[];
  recommendations: AiMonitoringRecommendation[];
};

export type AiMonitoringResponse = {
  success: boolean;
  message: string;
  data: AiMonitoringData;
};