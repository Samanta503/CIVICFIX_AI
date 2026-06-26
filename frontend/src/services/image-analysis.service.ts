import { getAuthToken } from "@/lib/auth-storage";
import type {
  AnalyzeComplaintResponse,
  AnalyzeMediaResponse,
  BulkImageAnalysisResponse,
  ImageAnalysisMediaResponse,
  ImageAnalysisResultsResponse,
  ImageAnalysisStatus,
  UpdateImageAnalysisStatusResponse,
} from "@/types/image-analysis.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data as T;
}

function getJsonAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getImageAnalysisMedia(): Promise<ImageAnalysisMediaResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/image-analysis/media`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<ImageAnalysisMediaResponse>(response);
}

export async function getImageAnalysisResults(
  status?: ImageAnalysisStatus | "all"
): Promise<ImageAnalysisResultsResponse> {
  const query = status && status !== "all" ? `?status=${status}` : "";

  const response = await fetch(
    `${API_BASE_URL}/ai/image-analysis/results${query}`,
    {
      method: "GET",
      headers: getJsonAuthHeaders(),
    }
  );

  return parseResponse<ImageAnalysisResultsResponse>(response);
}

export async function analyzeMedia(
  mediaId: number
): Promise<AnalyzeMediaResponse> {
  const response = await fetch(
    `${API_BASE_URL}/ai/image-analysis/media/${mediaId}/analyze`,
    {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({}),
    }
  );

  return parseResponse<AnalyzeMediaResponse>(response);
}

export async function analyzeComplaintImages(
  complaintId: number
): Promise<AnalyzeComplaintResponse> {
  const response = await fetch(
    `${API_BASE_URL}/ai/complaints/${complaintId}/image-analysis/analyze`,
    {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({}),
    }
  );

  return parseResponse<AnalyzeComplaintResponse>(response);
}

export async function runBulkImageAnalysis(): Promise<BulkImageAnalysisResponse> {
  const response = await fetch(
    `${API_BASE_URL}/ai/image-analysis/run-bulk-scan`,
    {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({}),
    }
  );

  return parseResponse<BulkImageAnalysisResponse>(response);
}

export async function updateImageAnalysisStatus(
  analysisId: number,
  payload: {
    status: ImageAnalysisStatus;
    review_note?: string;
  }
): Promise<UpdateImageAnalysisStatusResponse> {
  const response = await fetch(
    `${API_BASE_URL}/ai/image-analysis/results/${analysisId}/status`,
    {
      method: "PUT",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse<UpdateImageAnalysisStatusResponse>(response);
}