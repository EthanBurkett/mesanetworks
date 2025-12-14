import { useMutation } from "@tanstack/react-query";
import { consultationApi } from "@/lib/api/consultation";
import type { ConsultationFormData } from "@/schemas/consultation.schema";

/**
 * Hook to submit consultation request
 */
export function useSubmitConsultation() {
  return useMutation({
    mutationFn: (data: ConsultationFormData) =>
      consultationApi.submitConsultation(data),
  });
}
