export type DuplicateStatus = "pending" | "confirmed" | "rejected" | "ignored";

export type DuplicateBasicEntity = {
  id: number;
  name: string;
  slug: string;
};

export type DuplicateZone = {
  id: number;
  name: string;
  city: string;
  ward_number: string | null;
};

export type DuplicateComplaint = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  address: string;
  status: string;
  priority: string;
  submitted_at: string | null;

  category: DuplicateBasicEntity | null;
  department: DuplicateBasicEntity | null;
  zone: DuplicateZone | null;
};

export type DuplicateSuggestion = {
  id: number;
  model_name: string;
  similarity_score: number;
  text_similarity_score: number;
  location_similarity_score: number;
  category_similarity_score: number;
  distance_meters: number | null;
  matched_reasons: string[] | null;
  raw_output: Record<string, unknown> | null;
  status: DuplicateStatus;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;

  source_complaint: DuplicateComplaint | null;
  matched_complaint: DuplicateComplaint | null;

  created_by: {
    id: number;
    name: string;
    email: string;
  } | null;

  reviewed_by: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type DuplicateStats = {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
  ignored: number;
  high_similarity: number;
};

export type DuplicateListResponse = {
  success: boolean;
  message: string;
  data: {
    stats: DuplicateStats;
    suggestions: DuplicateSuggestion[];
  };
};

export type DuplicateScanResponse = {
  success: boolean;
  message: string;
  data: {
    analysis: {
      model_name: string;
      source_complaint_id: number;
      source_complaint_no: string;
      total_candidates_checked: number;
      total_matches_found: number;
      matches: unknown[];
    };
    suggestions: DuplicateSuggestion[];
  };
};

export type DuplicateBulkScanResponse = {
  success: boolean;
  message: string;
  data: {
    complaints_checked: number;
    suggestions_saved: number;
  };
};

export type DuplicateUpdateStatusResponse = {
  success: boolean;
  message: string;
  data: {
    suggestion: DuplicateSuggestion;
  };
};