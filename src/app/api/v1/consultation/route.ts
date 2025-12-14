import { type NextRequest } from "next/server";
import { wrapper } from "@/lib/api-utils";
import { consultationSchema } from "@/schemas/consultation.schema";
import { getTransporter } from "@/lib/email/smtp-client";
import { env } from "@/config/env";

export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      parser: consultationSchema,
    },
    async ({ body }) => {
      // Get email transporter from database settings
      const transporter = await getTransporter();

      // Format the email content
      const emailContent = `
New Consultation Request

CUSTOMER INFORMATION
--------------------
Name: ${body.firstName} ${body.lastName}
Email: ${body.email}
Phone: ${body.phone}

PROPERTY INFORMATION
--------------------
Type: ${body.propertyType === "residential" ? "Residential" : "Commercial"}
${body.propertyName ? `Business/Property Name: ${body.propertyName}` : ""}
Address: ${body.address}
City: ${body.city}, ${body.state} ${body.zipCode}

PROJECT REQUIREMENTS
--------------------
Services Requested: ${body.serviceType.join(", ")}

Project Scope:
${body.projectScope}

Timeline: ${formatTimeline(body.timeline)}
Budget Range: ${formatBudget(body.budget)}

CONTACT PREFERENCES
-------------------
Preferred Method: ${formatContactMethod(body.preferredContactMethod)}
Preferred Time: ${formatContactTime(body.preferredContactTime)}

${
  body.additionalNotes
    ? `\nADDITIONAL NOTES\n----------------\n${body.additionalNotes}`
    : ""
}

---
This consultation request was submitted via the MesaNet website.
      `.trim();

      // Send email to business
      await transporter.sendMail({
        from:
          env.SMTP_FROM_EMAIL ||
          '"MesaNet Consultations" <noreply@mesanet.works>',
        to: "consult@mesanet.works",
        replyTo: body.email,
        subject: `New Consultation Request - ${body.firstName} ${body.lastName}`,
        text: emailContent,
        html: emailContent.replace(/\n/g, "<br>"),
      });

      // Send confirmation email to customer
      await transporter.sendMail({
        from: env.SMTP_FROM_EMAIL || '"MesaNet" <noreply@mesanet.works>',
        to: body.email,
        subject: "Consultation Request Received - MesaNet",
        text: `Hi ${body.firstName},

Thank you for requesting a consultation with MesaNet. We've received your information and will review your project requirements.

We typically respond within 24 hours during business days. You can expect to hear from us soon to schedule your consultation.

Project Summary:
- Services: ${body.serviceType.join(", ")}
- Timeline: ${formatTimeline(body.timeline)}
- Property Type: ${
          body.propertyType === "residential" ? "Residential" : "Commercial"
        }

If you have any questions in the meantime, feel free to reply to this email.

Best regards,
MesaNet Team
        `,
      });

      return {
        success: true,
        message: "Consultation request submitted successfully",
      };
    }
  );

// Helper functions to format display values
function formatTimeline(timeline: string): string {
  const map: Record<string, string> = {
    asap: "As soon as possible",
    "1-2weeks": "1-2 weeks",
    "1month": "Within 1 month",
    flexible: "Flexible",
  };
  return map[timeline] || timeline;
}

function formatBudget(budget: string): string {
  const map: Record<string, string> = {
    "under-5k": "Under $5,000",
    "5k-10k": "$5,000 - $10,000",
    "10k-25k": "$10,000 - $25,000",
    "25k-plus": "$25,000+",
    "not-sure": "Not sure yet",
  };
  return map[budget] || budget;
}

function formatContactMethod(method: string): string {
  const map: Record<string, string> = {
    email: "Email",
    phone: "Phone",
    either: "Email or Phone",
  };
  return map[method] || method;
}

function formatContactTime(time: string): string {
  const map: Record<string, string> = {
    morning: "Morning (8am-12pm)",
    afternoon: "Afternoon (12pm-5pm)",
    evening: "Evening (5pm-8pm)",
    anytime: "Anytime",
  };
  return map[time] || time;
}
