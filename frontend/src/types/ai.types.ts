export type AiBasicUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

export type AiBasicEntity = {
  id: number;
  name: string;
  slug: string;
};

export type AiPrediction = {
  id?: number;
  complaint_id?: number | null;
  model_name: string;

  input_title?: string | null;
  input_description?: string | null;
  input_address?: string | null;

  predicted_priority: "low" | "medium" | "high" | "critical" | string;
  confidence_score: number;
  predicted_summary: string | null;
  reasoning: string | null;

  matched_keywords: {
    category?: string[];
    priority?: string[];
  } | null;

  raw_output?: Record<string, unknown> | null;

  predicted_category?: AiBasicEntity | null;
  predicted_department?: AiBasicEntity | null;

  predicted_category_id?: number | null;
  predicted_category_name?: string | null;
  predicted_department_id?: number | null;
  predicted_department_name?: string | null;

  created_by?: AiBasicUser | null;

  reviewed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AiComplaintItem = {
  id: number;
  complaint_no: string;
  title: string;
  description: string;
  address: string;
  priority: string;
  status: string;
  submitted_at: string | null;
  created_at: string | null;

  citizen: AiBasicUser | null;
  category: AiBasicEntity | null;
  department: AiBasicEntity | null;

  zone: {
    id: number;
    name: string;
    city: string;
    ward_number: string | null;
  } | null;

  ai_prediction: AiPrediction | null;
};

export type AiComplaintListResponse = {
  success: boolean;
  message: string;
  data: {
    items: AiComplaintItem[];
  };
};

export type AiPredictTextPayload = {
  title: string;
  description: string;
  address?: string;
};

export type AiPredictTextResponse = {
  success: boolean;
  message: string;
  data: {
    prediction: AiPrediction;
  };
};

export type AiPredictComplaintResponse = {
  success: boolean;
  message: string;
  data: {
    prediction: AiPrediction;
    item: AiComplaintItem;
  };
};