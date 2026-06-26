export type ImageAnalysisStatus = "pending" | "reviewed" | "ignored";

export type VisualSeverity = "low" | "medium" | "high" | "critical";

export type ImageAnalysisBasicUser = {
  id: number;
  name: string;
  email: string;
};

export type ImageAnalysisBasicEntity = {
  id: number;
  name: string;
  slug: string;
};

export type ImageAnalysisZone = {
  id: number;
  name: string;
  city: string;
  ward_number: string | null;
};

export type ImageAnalysisComplaint = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  address: string;
  status: string;
  priority: string;
  submitted_at: string | null;
  citizen: ImageAnalysisBasicUser | null;
  category: ImageAnalysisBasicEntity | null;
  department: ImageAnalysisBasicEntity | null;
  zone: ImageAnalysisZone | null;
};

export type ComplaintMediaAiAnalysis = {
  id: number;
  complaint_id: number;
  complaint_media_id: number;
  model_name: string;
  detected_issue_type: string | null;
  visual_severity: VisualSeverity;
  confidence_score: number;
  quality_score: number;
  image_width: number | null;
  image_height: number | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  analysis_summary: string | null;
  safety_observations: string | null;
  matched_visual_clues: string[] | null;
  recommendations: string[] | null;
  raw_output: Record<string, unknown> | null;
  status: ImageAnalysisStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  complaint: ImageAnalysisComplaint | null;
  media: {
    id: number;
    image_url: string | null;
    file_name: string | null;
    file_path: string | null;
  } | null;
  created_by: ImageAnalysisBasicUser | null;
  reviewed_by: ImageAnalysisBasicUser | null;
};

export type ImageAnalysisMediaItem = {
  id: number;
  complaint_id: number;
  media_type: string | null;
  file_name: string | null;
  file_path: string | null;
  mime_type: string | null;
  file_size: number | string | null;
  image_url: string | null;
  created_at: string | null;
  complaint: ImageAnalysisComplaint | null;
  analysis: ComplaintMediaAiAnalysis | null;
};

export type ImageAnalysisStats = {
  total_media: number;
  analyzed_media: number;
  pending_review: number;
  reviewed: number;
  ignored: number;
  high_confidence: number;
  critical_visual: number;
};

export type ImageAnalysisMediaResponse = {
  success: boolean;
  message: string;
  data: {
    stats: ImageAnalysisStats;
    items: ImageAnalysisMediaItem[];
  };
};

export type ImageAnalysisResultsResponse = {
  success: boolean;
  message: string;
  data: {
    stats: ImageAnalysisStats;
    analyses: ComplaintMediaAiAnalysis[];
  };
};

export type AnalyzeMediaResponse = {
  success: boolean;
  message: string;
  data: {
    analysis: ComplaintMediaAiAnalysis;
  };
};

export type AnalyzeComplaintResponse = {
  success: boolean;
  message: string;
  data: {
    complaint_id: number;
    complaint_no: string;
    total_media_analyzed: number;
    analyses: ComplaintMediaAiAnalysis[];
  };
};

export type BulkImageAnalysisResponse = {
  success: boolean;
  message: string;
  data: {
    media_checked: number;
    analyses_saved: number;
  };
};

export type UpdateImageAnalysisStatusResponse = {
  success: boolean;
  message: string;
  data: {
    analysis: ComplaintMediaAiAnalysis;
  };
};