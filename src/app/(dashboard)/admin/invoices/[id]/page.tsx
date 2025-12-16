"use client";

import { use } from "react";
import {
  useInvoice,
  useSendInvoice,
  useMarkInvoiceAsPaid,
} from "@/hooks/use-invoices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  FileText,
  Calendar,
  User,
  Mail,
  AlertCircle,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

type PageProps = {
  params: Promise<{ id: string }>;
};

const statusColors: Record<
  "draft" | "pending" | "paid" | "overdue" | "cancelled" | "refunded",
  string
> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-orange-100 text-orange-800",
};

export default function AdminInvoiceDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: invoice, isLoading } = useInvoice(id);
  const sendInvoice = useSendInvoice();
  const markAsPaid = useMarkInvoiceAsPaid();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Invoice not found</h2>
          <p className="text-muted-foreground mb-6">
            The invoice you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/admin/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const dueDate = new Date(invoice.dueDate);
  const isOverdue = invoice.status !== "paid" && dueDate < new Date();

  const handleSend = async () => {
    try {
      await sendInvoice.mutateAsync(id);
      toast.success("Invoice sent successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to send invoice");
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await markAsPaid.mutateAsync({
        id,
        data: {
          paymentMethod: "cash",
          paymentReference: `Manual payment - ${new Date().toISOString()}`,
        },
      });
      toast.success("Invoice marked as paid");
    } catch (error: any) {
      toast.error(error.message || "Failed to mark invoice as paid");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground mt-1">
              Issued on {new Date(invoice.issueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Badge className={statusColors[invoice.status]} variant="secondary">
            {invoice.status}
          </Badge>
          {invoice.status === "draft" && (
            <Button onClick={handleSend} disabled={sendInvoice.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {sendInvoice.isPending ? "Sending..." : "Send Invoice"}
            </Button>
          )}
          {(invoice.status === "pending" || invoice.status === "overdue") && (
            <Button onClick={handleMarkAsPaid} disabled={markAsPaid.isPending}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {markAsPaid.isPending ? "Processing..." : "Mark as Paid"}
            </Button>
          )}
        </div>
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">
                  This invoice is overdue
                </p>
                <p className="text-sm text-red-700">
                  Payment was due on {dueDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Billed To
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-semibold">{invoice.customerName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="h-3 w-3" />
                {invoice.customerEmail}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice #:</span>
              <span className="font-mono font-medium">
                {invoice.invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issue Date:</span>
              <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date:</span>
              <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                {dueDate.toLocaleDateString()}
              </span>
            </div>
            {invoice.paidDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Date:</span>
                <span className="text-green-600">
                  {new Date(invoice.paidDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-mono">
                ${(invoice.subtotal / 100).toFixed(2)}
              </span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-mono">
                  ${(invoice.taxAmount / 100).toFixed(2)}
                </span>
              </div>
            )}
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-mono text-red-600">
                  -${(invoice.discountAmount / 100).toFixed(2)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total:</span>
              <span className="font-mono text-green-600">
                ${(invoice.total / 100).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
          <CardDescription>Detailed breakdown of charges</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.taxRate ? `${item.taxRate}%` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${(item.amount / 100).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-semibold">
                  Subtotal
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  ${(invoice.subtotal / 100).toFixed(2)}
                </TableCell>
              </TableRow>
              {invoice.taxAmount > 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-semibold">
                    Tax
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${(invoice.taxAmount / 100).toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
              {invoice.discountAmount > 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-semibold">
                    Discount
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-red-600">
                    -${(invoice.discountAmount / 100).toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold text-lg">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-lg text-green-600">
                  ${(invoice.total / 100).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Notes and Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="grid gap-6 md:grid-cols-2">
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
          {invoice.terms && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{invoice.terms}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
