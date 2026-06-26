export type CitizenDuplicateNoticeComplaint = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  address: string;
  status: string;
  priority: string;
  submitted_at: string | null;

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
};

export type CitizenDuplicateNotice = {
  id: number;
  is_duplicate: boolean;
  status: "confirmed";
  similarity_score: number;
  text_similarity_score: number;
  location_similarity_score: number;
  category_similarity_score: number;
  distance_meters: number | null;
  matched_reasons: string[] | null;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string | null;

  source_complaint: CitizenDuplicateNoticeComplaint | null;
  matched_complaint: CitizenDuplicateNoticeComplaint | null;

  reviewed_by: {
    id: number;
    name: string;
    email: string;
  } | null;
};

export type CitizenDuplicateNoticeListResponse = {
  success: boolean;
  message: string;
  data: {
    notices: CitizenDuplicateNotice[];
  };
};

export type CitizenDuplicateNoticeResponse = {
  success: boolean;
  message: string;
  data: {
    notice: CitizenDuplicateNotice | null;
  };
};