import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  amount: z.number().min(0, "Amount must be positive"),
  taxRate: z.number().min(0).max(100).optional(),
});

export const createInvoiceSchema = z.object({
  // Customer Information
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),

  // Invoice Items
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),

  // Dates
  issueDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),

  // Optional fields
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  assignedTo: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1).optional(),
  issueDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z
    .enum(["draft", "pending", "paid", "overdue", "cancelled", "refunded"])
    .optional(),
});

export const markAsPaidSchema = z.object({
  paymentMethod: z.enum(["stripe", "cash", "check", "wire_transfer"]),
  paymentReference: z.string().optional(),
});

export const sendInvoiceSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  sendEmail: z.boolean().default(true),
  createStripeInvoice: z.boolean().default(true),
});

export type InvoiceItemData = z.infer<typeof invoiceItemSchema>;
export type CreateInvoiceData = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceData = z.infer<typeof updateInvoiceSchema>;
export type MarkAsPaidData = z.infer<typeof markAsPaidSchema>;
export type SendInvoiceData = z.infer<typeof sendInvoiceSchema>;
