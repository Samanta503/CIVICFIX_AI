export type ComplaintFeedback = {
  id: number;
  complaint_id: number;
  citizen_id: number;
  rating: number;
  response_quality: "poor" | "fair" | "good" | "excellent" | null;
  issue_resolved: boolean;
  comment: string | null;
  submitted_at: string | null;
  created_at: string | null;
};

export type CitizenFeedbackItem = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  address: string;
  status: string;
  priority: string;
  submitted_at: string | null;
  resolved_at: string | null;

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

  feedback: ComplaintFeedback | null;
};

export type CitizenFeedbackListResponse = {
  success: boolean;
  message: string;
  data: {
    items: CitizenFeedbackItem[];
  };
};

export type CitizenFeedbackContextResponse = {
  success: boolean;
  message: string;
  data: {
    item: CitizenFeedbackItem;
  };
};

export type StoreFeedbackPayload = {
  rating: number;
  response_quality?: "poor" | "fair" | "good" | "excellent" | "";
  issue_resolved: boolean;
  comment?: string;
};

export type StoreFeedbackResponse = {
  success: boolean;
  message: string;
  data: {
    feedback: ComplaintFeedback;
    item: CitizenFeedbackItem;
  };
};

export type AdminFeedbackItem = {
  id: number;
  rating: number;
  response_quality: string | null;
  issue_resolved: boolean;
  comment: string | null;
  submitted_at: string | null;
  created_at: string | null;

  citizen: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  } | null;

  complaint: {
    id: number;
    complaint_no: string;
    title: string;
    status: string;
    priority: string;
    resolved_at: string | null;

    department: {
      id: number;
      name: string;
      slug: string;
    } | null;

    category: {
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
  } | null;
};

export type AdminFeedbackStats = {
  total_feedback: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
  low_rating: number;
  unresolved_feedback: number;
};

export type AdminFeedbackResponse = {
  success: boolean;
  message: string;
  data: {
    stats: AdminFeedbackStats;
    department_summary: {
      id: number;
      name: string;
      slug: string;
      feedback_count: number;
      average_rating: number;
    }[];
    feedback: AdminFeedbackItem[];
  };
};