"use client";

import { useState } from "react";
import { useAuth } from "@/hooks";
import { useInvoices } from "@/hooks/use-invoices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdvancedDataTable } from "@/components/data-table/advanced-data-table";
import type { AdvancedColumn } from "@/components/data-table/advanced-data-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

type Invoice = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled" | "refunded";
  total: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  terms?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate?: number;
  }>;
};

const statusColors: Record<Invoice["status"], string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-orange-100 text-orange-800",
};

export default function UserInvoicesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useInvoices({
    customerEmail: user?.email,
  });

  const invoices = data?.invoices || [];

  // Calculate statistics
  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === "paid").length,
    pending: invoices.filter((inv) => inv.status === "pending").length,
    overdue: invoices.filter((inv) => inv.status === "overdue").length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paidAmount: invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.total, 0),
    pendingAmount: invoices
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + inv.total, 0),
    overdueAmount: invoices
      .filter((inv) => inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.total, 0),
  };

  const columns: AdvancedColumn<Invoice>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      render: (invoice) => (
        <Link
          href={`/account/invoices/${invoice._id}`}
          className="font-mono font-medium text-primary hover:text-primary/80 hover:underline"
        >
          {invoice.invoiceNumber}
        </Link>
      ),
      sortable: true,
      searchable: true,
    },
    {
      key: "issueDate",
      header: "Issue Date",
      render: (invoice) => (
        <span className="text-sm text-muted-foreground">
          {new Date(invoice.issueDate).toLocaleDateString()}
        </span>
      ),
      sortable: true,
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (invoice) => {
        const dueDate = new Date(invoice.dueDate);
        const isOverdue = invoice.status !== "paid" && dueDate < new Date();
        return (
          <span
            className={`text-sm ${
              isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"
            }`}
          >
            {dueDate.toLocaleDateString()}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: "total",
      header: "Amount",
      render: (invoice) => (
        <span className="font-mono font-semibold text-muted-foreground">
          ${(invoice.total / 100).toFixed(2)}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (invoice) => (
        <Badge className={statusColors[invoice.status]} variant="secondary">
          {invoice.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (invoice) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/account/invoices/${invoice._id}`}>
              <Eye className="mr-1 h-4 w-4" />
              View
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your invoices
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.paid} paid, {stats.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All invoices combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${(stats.pendingAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pending} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Amount
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${(stats.overdueAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overdue} overdue invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>
            All invoices issued to {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedDataTable
            data={invoices}
            columns={columns}
            getRowKey={(invoice) => invoice._id}
            searchPlaceholder="Search by invoice number..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
