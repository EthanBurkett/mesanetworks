import { z } from "zod";

export const consultationSchema = z.object({
  // Customer Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),

  // Property Information
  propertyType: z.enum(["residential", "commercial"], {
    message: "Please select property type",
  }),
  propertyName: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),

  // Project Requirements
  serviceType: z.array(z.string()).min(1, "Select at least one service"),
  projectScope: z
    .string()
    .min(10, "Please provide project details (minimum 10 characters)"),
  timeline: z.enum(["asap", "1-2weeks", "1month", "flexible"], {
    message: "Please select a timeline",
  }),
  budget: z.enum(["under-5k", "5k-10k", "10k-25k", "25k-plus", "not-sure"], {
    message: "Please select a budget range",
  }),

  // Additional Information
  additionalNotes: z.string().optional(),
  preferredContactMethod: z
    .enum(["email", "phone", "either"])
    .default("either"),
  preferredContactTime: z
    .enum(["morning", "afternoon", "evening", "anytime"])
    .default("anytime"),
});

export type ConsultationFormData = z.infer<typeof consultationSchema>;
