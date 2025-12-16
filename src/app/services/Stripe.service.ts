import { env } from "@/config/env";
import Stripe from "stripe";
import type { Invoice } from "@/lib/db/models/Invoice.model";

export class StripeService {
  public stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
    });
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createOrGetCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    // Check if customer already exists
    const existingCustomers = await this.stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  /**
   * Create a Stripe invoice from our invoice data
   */
  async createInvoice(invoice: Invoice): Promise<Stripe.Invoice> {
    // Create or get customer
    const customer = await this.createOrGetCustomer(
      invoice.customerEmail,
      invoice.customerName,
      {
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
      }
    );

    // Create invoice in Stripe
    const stripeInvoice = await this.stripe.invoices.create({
      customer: customer.id,
      auto_advance: false, // Don't auto-finalize
      collection_method: "send_invoice",
      days_until_due: Math.ceil(
        (new Date(invoice.dueDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      ),
      description: invoice.notes,
      metadata: {
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    // Add line items
    for (const item of invoice.items) {
      await this.stripe.invoiceItems.create({
        customer: customer.id,
        invoice: stripeInvoice.id,
        description: `${item.description} (Qty: ${item.quantity})`,
        amount: item.amount,
        tax_rates: item.taxRate
          ? [
              await this.getOrCreateTaxRate(
                item.taxRate,
                `Tax ${item.taxRate}%`
              ),
            ]
          : undefined,
      });
    }

    // Apply discount if any
    if (invoice.discountAmount > 0) {
      await this.stripe.invoiceItems.create({
        customer: customer.id,
        invoice: stripeInvoice.id,
        description: "Discount",
        amount: -invoice.discountAmount,
      });
    }

    return stripeInvoice;
  }

  /**
   * Finalize and send a Stripe invoice
   */
  async finalizeAndSendInvoice(
    stripeInvoiceId: string
  ): Promise<Stripe.Invoice> {
    // Finalize the invoice
    const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(
      stripeInvoiceId
    );

    // Send the invoice
    return this.stripe.invoices.sendInvoice(stripeInvoiceId);
  }

  /**
   * Get or create a tax rate
   */
  async getOrCreateTaxRate(
    percentage: number,
    displayName: string
  ): Promise<string> {
    // Try to find existing tax rate
    const taxRates = await this.stripe.taxRates.list({
      active: true,
      limit: 100,
    });

    const existingRate = taxRates.data.find(
      (rate) => rate.percentage === percentage
    );

    if (existingRate) {
      return existingRate.id;
    }

    // Create new tax rate
    const newRate = await this.stripe.taxRates.create({
      display_name: displayName,
      percentage,
      inclusive: false,
    });

    return newRate.id;
  }

  /**
   * Create a payment intent for an invoice
   */
  async createPaymentIntent(
    amount: number,
    customerEmail: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency: "usd",
      receipt_email: customerEmail,
      metadata,
    });
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Retrieve an invoice
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return this.stripe.invoices.retrieve(invoiceId);
  }

  /**
   * Mark Stripe invoice as paid
   */
  async markInvoiceAsPaid(invoiceId: string): Promise<Stripe.Invoice> {
    return this.stripe.invoices.pay(invoiceId, {
      paid_out_of_band: true,
    });
  }

  /**
   * Void a Stripe invoice
   */
  async voidInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return this.stripe.invoices.voidInvoice(invoiceId);
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });
  }

  /**
   * Get webhook event
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  }

  /**
   * Retrieve a Stripe invoice by ID
   */
  async retrieveInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return this.stripe.invoices.retrieve(invoiceId);
  }
}

export const stripeService = new StripeService();
