"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInvoices, useInvoiceStatistics } from "@/hooks/use-invoices";
import {
  AdvancedDataTable,
  type AdvancedColumn,
} from "@/components/data-table/advanced-data-table";
import type { InvoiceResponse } from "@/lib/api/invoices";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Filter,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
  draft: "bg-gray-500",
  pending: "bg-yellow-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  cancelled: "bg-gray-400",
  refunded: "bg-blue-500",
};

const statusIcons = {
  draft: FileText,
  pending: Clock,
  paid: CheckCircle,
  overdue: AlertCircle,
  cancelled: FileText,
  refunded: DollarSign,
};

export default function InvoicesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    data: invoicesData,
    isLoading,
    refetch,
  } = useInvoices({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: stats, refetch: refetchStats } = useInvoiceStatistics();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/v1/invoices/sync", {
        method: "POST",
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        await Promise.all([refetch(), refetchStats()]);
        alert(`Synced ${result.updatedCount} invoices successfully!`);
      } else {
        alert("Sync failed: " + (result.message || "Unknown error"));
      }
    } catch (error: any) {
      alert("Sync failed: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Invoice table columns
  const invoiceColumns: AdvancedColumn<InvoiceResponse>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      sortable: true,
      searchable: true,
      className: "font-mono font-medium",
    },
    {
      key: "customerName",
      header: "Customer",
      sortable: true,
      searchable: true,
      render: (invoice) => (
        <div>
          <div className="font-medium">{invoice.customerName}</div>
          <div className="text-sm text-muted-foreground">
            {invoice.customerEmail}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Amount",
      sortable: true,
      className: "font-mono",
      render: (invoice) => `$${(invoice.total / 100).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (invoice) => {
        const StatusIcon =
          statusIcons[invoice.status as keyof typeof statusIcons];
        return (
          <Badge
            variant="secondary"
            className={cn(
              "text-white",
              statusColors[invoice.status as keyof typeof statusColors]
            )}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {invoice.status}
          </Badge>
        );
      },
    },
    {
      key: "issueDate",
      header: "Issue Date",
      sortable: true,
      render: (invoice) => new Date(invoice.issueDate).toLocaleDateString(),
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (invoice) => new Date(invoice.dueDate).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage customer invoices and payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
            <RefreshCw
              className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")}
            />
            {isSyncing ? "Syncing..." : "Sync with Stripe"}
          </Button>
          <Button onClick={() => router.push("/admin/invoices/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Invoices
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {stats.draftInvoices || 0} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${((stats.totalRevenue || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.paidInvoices} paid invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Revenue
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${((stats.pendingRevenue || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingInvoices} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Amount
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${((stats.overdueRevenue || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.overdueInvoices} overdue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <label className="text-sm font-medium">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {invoicesData?.total || 0} total invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AdvancedDataTable
              data={invoicesData?.invoices || []}
              columns={invoiceColumns}
              getRowKey={(invoice) => invoice._id}
              emptyMessage="No invoices found"
              searchPlaceholder="Search by invoice number, customer name, or email..."
              defaultPageSize={20}
              onRowClick={(invoice) =>
                router.push(`/admin/invoices/${invoice._id}`)
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
