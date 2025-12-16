import { ApiResponse } from "@/lib/api-utils";
import type {
  CreateInvoiceData,
  UpdateInvoiceData,
  MarkAsPaidData,
} from "@/schemas/invoice.schema";

const API_BASE = "/api/v1/invoices";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

export interface InvoiceResponse {
  _id: string;
  invoiceNumber: string;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled" | "refunded";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  terms?: string;
  createdBy: string;
  assignedTo?: string;
  stripeInvoiceId?: string;
  stripeCustomerId?: string;
  stripePaymentIntentId?: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListResponse {
  invoices: InvoiceResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  draftInvoices: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
}

export const invoicesApi = {
  getInvoices: async (params?: {
    status?: string;
    customerEmail?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<InvoiceListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.customerEmail)
      searchParams.append("customerEmail", params.customerEmail);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const res = await fetch(`${API_BASE}?${searchParams.toString()}`, {
      credentials: "include",
    });

    const json: ApiResponse<InvoiceListResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch invoices");
    }

    return json.data;
  },

  getInvoice: async (id: string): Promise<InvoiceResponse> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      credentials: "include",
    });

    const json: ApiResponse<InvoiceResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch invoice");
    }

    return json.data;
  },

  createInvoice: async (data: CreateInvoiceData): Promise<InvoiceResponse> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json: ApiResponse<InvoiceResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to create invoice");
    }

    return json.data;
  },

  updateInvoice: async (
    id: string,
    data: UpdateInvoiceData
  ): Promise<InvoiceResponse> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json: ApiResponse<InvoiceResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to update invoice");
    }

    return json.data;
  },

  deleteInvoice: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success) {
      throw new Error(json.messages[0] || "Failed to delete invoice");
    }
  },

  markAsPaid: async (
    id: string,
    data: MarkAsPaidData
  ): Promise<InvoiceResponse> => {
    const res = await fetch(`${API_BASE}/${id}/mark-paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const json: ApiResponse<InvoiceResponse> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to mark invoice as paid");
    }

    return json.data;
  },

  sendInvoice: async (id: string): Promise<{ stripeInvoiceId: string }> => {
    const res = await fetch(`${API_BASE}/${id}/send`, {
      method: "POST",
      credentials: "include",
    });

    const json: ApiResponse<{ stripeInvoiceId: string }> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to send invoice");
    }

    return json.data;
  },

  getStatistics: async (): Promise<InvoiceStatistics> => {
    const res = await fetch(`${API_BASE}/statistics`, {
      credentials: "include",
    });

    const json: ApiResponse<InvoiceStatistics> = await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to fetch statistics");
    }

    return json.data;
  },

  payInvoice: async (
    id: string
  ): Promise<{ stripeInvoiceId: string; paymentUrl: string }> => {
    const res = await fetch(`${API_BASE}/${id}/pay`, {
      method: "POST",
      credentials: "include",
    });

    const json: ApiResponse<{ stripeInvoiceId: string; paymentUrl: string }> =
      await res.json();

    if (!json.success || !json.data) {
      throw new Error(json.messages[0] || "Failed to process payment");
    }

    return json.data;
  },
};
