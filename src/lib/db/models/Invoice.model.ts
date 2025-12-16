import { field, getModel, model } from "../odm";
import { Errors } from "@/lib/api-utils";
import { parseDbError } from "@/utils/db-error-parser";

export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "stripe" | "cash" | "check" | "wire_transfer";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number; // in cents
  amount: number; // quantity * unitPrice (in cents)
  taxRate?: number; // percentage
}

@model("Invoice", {
  timestamps: true,
})
export class Invoice {
  _id!: string;
  _createdAt!: Date;
  _updatedAt!: Date;

  // Invoice Details
  @field({ type: String, required: true, unique: true })
  invoiceNumber!: string;

  @field({
    type: String,
    required: true,
    enum: ["draft", "pending", "paid", "overdue", "cancelled", "refunded"],
    default: "draft",
  })
  status!: InvoiceStatus;

  // Customer Information
  @field({ type: String, required: true })
  customerName!: string;

  @field({ type: String, required: true })
  customerEmail!: string;

  @field({ type: String })
  customerPhone?: string;

  @field({ type: String })
  customerAddress?: string;

  @field({ type: String })
  stripeCustomerId?: string; // Stripe customer ID

  // Invoice Items
  @field({ type: Array, required: true })
  items!: InvoiceItem[];

  // Amounts (all in cents)
  @field({ type: Number, required: true })
  subtotal!: number;

  @field({ type: Number, default: 0 })
  taxAmount!: number;

  @field({ type: Number, default: 0 })
  discountAmount!: number;

  @field({ type: Number, required: true })
  total!: number;

  // Dates
  @field({ type: Date, required: true })
  issueDate!: Date;

  @field({ type: Date, required: true })
  dueDate!: Date;

  @field({ type: Date })
  paidAt?: Date;

  // Payment Information
  @field({ type: String, enum: ["stripe", "cash", "check", "wire_transfer"] })
  paymentMethod?: PaymentMethod;

  @field({ type: String })
  stripeInvoiceId?: string; // Stripe invoice ID

  @field({ type: String })
  stripePaymentIntentId?: string; // Stripe payment intent ID

  @field({ type: String })
  paymentReference?: string; // Check number, wire confirmation, etc.

  // Additional Information
  @field({ type: String })
  notes?: string;

  @field({ type: String })
  terms?: string;

  @field({ type: String, ref: "User" })
  createdBy?: string; // User who created the invoice

  @field({ type: String, ref: "User" })
  assignedTo?: string; // Team member assigned to this invoice
}

export const InvoiceModel = getModel(Invoice);

export class InvoiceQueries {
  /**
   * Find invoice by ID
   */
  static async findById(id: string) {
    return InvoiceModel.findById(id)
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      .exec();
  }

  /**
   * Find invoice by invoice number
   */
  static async findByInvoiceNumber(invoiceNumber: string) {
    return InvoiceModel.findOne({ invoiceNumber }).exec();
  }

  /**
   * Get all invoices with pagination and filters
   */
  static async findAll(filters: {
    status?: InvoiceStatus;
    customerEmail?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const {
      status,
      customerEmail,
      page = 1,
      limit = 50,
      sortBy = "_createdAt",
      sortOrder = "desc",
    } = filters;

    const query: any = {};
    if (status) query.status = status;
    if (customerEmail) query.customerEmail = customerEmail;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(query)
        .populate("createdBy", "firstName lastName email")
        .populate("assignedTo", "firstName lastName email")
        .sort(sort as any)
        .skip(skip)
        .limit(limit)
        .exec(),
      InvoiceModel.countDocuments(query),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new invoice
   */
  static async create(data: Partial<Invoice>) {
    try {
      const invoice = new InvoiceModel(data);
      await invoice.save();
      return invoice;
    } catch (error) {
      parseDbError(error);
    }
  }

  /**
   * Update an invoice
   */
  static async update(id: string, data: Partial<Invoice>) {
    try {
      const invoice = await InvoiceModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
        .populate("createdBy", "firstName lastName email")
        .populate("assignedTo", "firstName lastName email")
        .exec();

      if (!invoice) {
        throw new Errors.NotFound("Invoice not found");
      }

      return invoice;
    } catch (error) {
      parseDbError(error);
    }
  }

  /**
   * Delete an invoice
   */
  static async delete(id: string) {
    const invoice = await InvoiceModel.findByIdAndDelete(id).exec();
    if (!invoice) {
      throw new Errors.NotFound("Invoice not found");
    }
    return invoice;
  }

  /**
   * Generate next invoice number
   */
  static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    // Find the latest invoice for this year
    const latestInvoice = await InvoiceModel.findOne({
      invoiceNumber: { $regex: `^${prefix}` },
    })
      .sort({ invoiceNumber: -1 })
      .exec();

    if (!latestInvoice) {
      return `${prefix}0001`;
    }

    // Extract the number and increment
    const lastNumber = parseInt(
      latestInvoice.invoiceNumber.replace(prefix, ""),
      10
    );
    const nextNumber = (lastNumber + 1).toString().padStart(4, "0");

    return `${prefix}${nextNumber}`;
  }

  /**
   * Get invoices by status
   */
  static async findByStatus(status: InvoiceStatus) {
    return InvoiceModel.find({ status })
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      .sort({ _createdAt: -1 })
      .exec();
  }

  /**
   * Get overdue invoices
   */
  static async findOverdue() {
    const now = new Date();
    return InvoiceModel.find({
      status: { $in: ["pending", "overdue"] },
      dueDate: { $lt: now },
      paidAt: { $exists: false },
    })
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      .sort({ dueDate: 1 })
      .exec();
  }

  /**
   * Mark invoice as paid
   */
  static async markAsPaid(
    id: string,
    paymentData: {
      paymentMethod: PaymentMethod;
      paymentReference?: string;
      stripePaymentIntentId?: string;
    }
  ) {
    return InvoiceModel.findByIdAndUpdate(
      id,
      {
        status: "paid",
        paidAt: new Date(),
        ...paymentData,
      },
      { new: true }
    )
      .populate("createdBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      .exec();
  }

  /**
   * Get customer's invoices
   */
  static async findByCustomerEmail(email: string) {
    return InvoiceModel.find({ customerEmail: email })
      .sort({ _createdAt: -1 })
      .exec();
  }

  /**
   * Get invoice statistics
   */
  static async getStatistics() {
    const [
      totalInvoices,
      draftInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    ] = await Promise.all([
      InvoiceModel.countDocuments(),
      InvoiceModel.countDocuments({ status: "draft" }),
      InvoiceModel.countDocuments({ status: "paid" }),
      InvoiceModel.countDocuments({ status: "pending" }),
      InvoiceModel.countDocuments({ status: "overdue" }),
    ]);

    const [totalRevenue] = await InvoiceModel.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const [pendingRevenue] = await InvoiceModel.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const [overdueRevenue] = await InvoiceModel.aggregate([
      { $match: { status: "overdue" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    return {
      totalInvoices,
      draftInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue: totalRevenue?.total || 0,
      pendingRevenue: pendingRevenue?.total || 0,
      overdueRevenue: overdueRevenue?.total || 0,
    };
  }
}
