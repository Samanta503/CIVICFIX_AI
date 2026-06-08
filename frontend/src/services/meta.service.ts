import { apiRequest } from "@/lib/api";
import type { PublicMetaResponse } from "@/types/meta.types";

export async function getPublicMeta(): Promise<PublicMetaResponse> {
  return apiRequest<PublicMetaResponse>("/public/meta", {
    method: "GET",
  });
}