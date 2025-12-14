import type { ConsultationFormData } from "@/schemas/consultation.schema";
import type { ApiResponse } from "../api-utils";

const API_BASE = "/api/v1/consultation";

export interface ConsultationResponse {
  success: boolean;
  message: string;
}

export const consultationApi = {
  submitConsultation: async (
    data: ConsultationFormData
  ): Promise<ConsultationResponse> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json: ApiResponse<ConsultationResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages?.[0] || "Failed to submit consultation");
    }

    return json.data;
  },
};
