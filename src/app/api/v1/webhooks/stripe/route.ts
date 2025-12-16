import { type NextRequest, NextResponse } from "next/server";
import { stripeService } from "@/app/services/Stripe.service";
import { InvoiceQueries, InvoiceModel } from "@/lib/db/models/Invoice.model";
import { createAuditLog } from "@/lib/audit-logger";
import { env } from "@/config/env";
import { ensureDBConnection } from "@/lib/db";
import { AuditAction, AuditSeverity } from "@/lib/audit-types";

export const config = {
  api: {
    bodyParser: false,
  },
};

// POST /api/v1/webhooks/stripe - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    // Get raw body
    const rawBody = await request.text();

    // Verify webhook signature (only if webhook secret is configured)
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const event = stripeService.constructWebhookEvent(
      rawBody,
      signature,
      webhookSecret
    );

    await ensureDBConnection();

    // Handle different event types
    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object as any; // Stripe Invoice type
        const invoiceId = invoice.metadata?.invoiceId;

        if (invoiceId) {
          await InvoiceQueries.markAsPaid(invoiceId, {
            paymentMethod: "stripe",
            stripePaymentIntentId: invoice.payment_intent as string,
          });

          await createAuditLog(
            {
              action: AuditAction.INVOICE_MARK_PAID,
              description: `Stripe webhook: invoice paid`,
              resourceType: "invoice",
              resourceId: invoiceId,
              severity: AuditSeverity.INFO,
              metadata: {
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_paid,
                source: "stripe_webhook",
              },
            },
            { request }
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const invoiceId = invoice.metadata?.invoiceId;

        if (invoiceId) {
          await InvoiceQueries.update(invoiceId, {
            status: "overdue",
          });

          await createAuditLog(
            {
              action: AuditAction.INVOICE_UPDATE,
              description: `Stripe webhook: invoice payment failed`,
              resourceType: "invoice",
              resourceId: invoiceId,
              severity: AuditSeverity.WARNING,
              metadata: {
                stripeInvoiceId: invoice.id,
                source: "stripe_webhook",
              },
            },
            { request }
          );
        }
        break;
      }

      case "invoice.voided": {
        const invoice = event.data.object;
        const invoiceId = invoice.metadata?.invoiceId;

        if (invoiceId) {
          await InvoiceQueries.update(invoiceId, {
            status: "cancelled",
          });

          await createAuditLog(
            {
              action: AuditAction.INVOICE_VOID,
              description: `Stripe webhook: invoice voided`,
              resourceType: "invoice",
              resourceId: invoiceId,
              severity: AuditSeverity.WARNING,
              metadata: {
                stripeInvoiceId: invoice.id,
                source: "stripe_webhook",
              },
            },
            { request }
          );
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          // Find invoice with this payment intent
          const invoice = await InvoiceModel.findOne({
            stripePaymentIntentId: paymentIntentId,
          }).exec();

          if (invoice) {
            await InvoiceQueries.update(invoice._id, {
              status: "refunded",
            });

            await createAuditLog(
              {
                action: AuditAction.INVOICE_REFUND,
                description: `Stripe webhook: invoice refunded (${invoice.invoiceNumber})`,
                resourceType: "invoice",
                resourceId: invoice._id,
                resourceName: invoice.invoiceNumber,
                severity: AuditSeverity.WARNING,
                metadata: {
                  amount: charge.amount_refunded,
                  source: "stripe_webhook",
                },
              },
              { request }
            );
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
