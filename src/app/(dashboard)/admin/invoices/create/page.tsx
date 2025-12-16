"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createInvoiceSchema,
  type CreateInvoiceData,
} from "@/schemas/invoice.schema";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { useUsers } from "@/hooks/use-users";
import {
  AdvancedDataTable,
  type AdvancedColumn,
} from "@/components/data-table/advanced-data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Calculator,
  User,
  DollarSign,
  ArrowLeft,
  Save,
  Send,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserResponse } from "@/lib/api/users";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const { data: users, isLoading: usersLoading } = useUsers();
  const createInvoice = useCreateInvoice();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateInvoiceData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      items: [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }],
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      discountAmount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const discountAmount = watch("discountAmount") || 0;

  // Auto-populate customer details when user is selected
  useEffect(() => {
    if (selectedUser) {
      setValue("customerName", selectedUser.displayName);
      setValue("customerEmail", selectedUser.email);
      setValue("assignedTo", selectedUser._id);
    }
  }, [selectedUser, setValue]);

  // Calculate item amount when quantity or unit price changes
  const calculateItemAmount = (index: number) => {
    const item = items[index];
    if (item) {
      // Convert dollars to cents: quantity * price in dollars * 100
      const amountInCents = Math.round(
        (item.quantity || 0) * (item.unitPrice || 0) * 100
      );
      setValue(`items.${index}.amount`, amountInCents);
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = items.reduce((sum, item) => {
    if (item.taxRate && item.amount) {
      return sum + Math.round((item.amount * item.taxRate) / 100);
    }
    return sum;
  }, 0);
  // Discount is in dollars, convert to cents for calculation
  const discountInCents = Math.round((discountAmount || 0) * 100);
  const total = subtotal + taxAmount - discountInCents;

  const onSubmit = async (data: CreateInvoiceData) => {
    // Convert discount from dollars to cents
    const submissionData = {
      ...data,
      discountAmount: Math.round((data.discountAmount || 0) * 100),
    };
    await createInvoice.mutateAsync(submissionData);
    router.push("/admin/invoices");
  };

  // User table columns
  const userColumns: AdvancedColumn<UserResponse>[] = [
    {
      key: "displayName",
      header: "Name",
      sortable: true,
      searchable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-8 w-8 rounded-full"
            />
          )}
          <div>
            <div className="font-medium">{user.displayName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      sortable: true,
      render: (user) => (
        <Badge variant={user.isActive ? "default" : "secondary"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      searchable: true,
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles?.slice(0, 2).map((role) => (
            <Badge key={role._id} variant="outline" className="text-xs">
              {role.name}
            </Badge>
          ))}
          {(user.roles?.length || 0) > 2 && (
            <Badge variant="outline" className="text-xs">
              +{(user.roles?.length || 0) - 2}
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/invoices")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Invoice</h1>
            <p className="text-muted-foreground">
              Create a new invoice for a customer. Enter amounts in USD ($).
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Selection & Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Selection Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Select Customer
                </CardTitle>
                <CardDescription>
                  Click on a user to auto-fill customer information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <AdvancedDataTable
                    data={users || []}
                    columns={userColumns}
                    getRowKey={(user) => user._id}
                    onRowClick={setSelectedUser}
                    emptyMessage="No users found"
                    searchPlaceholder="Search users by name or email..."
                    defaultPageSize={5}
                    rowClassName={(user) =>
                      selectedUser?._id === user._id ? "bg-primary/10" : ""
                    }
                  />
                )}
                {selectedUser && (
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Selected:</span>
                      <span>{selectedUser.displayName}</span>
                      <Badge variant="outline">{selectedUser.email}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Customer details for the invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      {...register("customerName")}
                      placeholder="John Doe"
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500">
                        {errors.customerName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      {...register("customerEmail")}
                      placeholder="john@example.com"
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-red-500">
                        {errors.customerEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      {...register("customerPhone")}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      {...register("issueDate")}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="customerAddress">Address</Label>
                    <Textarea
                      id="customerAddress"
                      {...register("customerAddress")}
                      placeholder="123 Main St, City, State 12345"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Line Items
                    </CardTitle>
                    <CardDescription>
                      Add items and services to the invoice
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        description: "",
                        quantity: 1,
                        unitPrice: 0,
                        amount: 0,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-3 items-start p-4 border rounded-lg bg-card"
                  >
                    <div className="col-span-5 space-y-2">
                      <Label htmlFor={`items.${index}.description`}>
                        Description
                      </Label>
                      <Input
                        id={`items.${index}.description`}
                        {...register(`items.${index}.description`)}
                        placeholder="Service or product description"
                      />
                      {errors.items?.[index]?.description && (
                        <p className="text-xs text-red-500">
                          {errors.items[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`items.${index}.quantity`}>Qty</Label>
                      <Input
                        id={`items.${index}.quantity`}
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                          onChange: () => calculateItemAmount(index),
                        })}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`items.${index}.unitPrice`}>
                        Price ($)
                      </Label>
                      <Input
                        id={`items.${index}.unitPrice`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...register(`items.${index}.unitPrice`, {
                          valueAsNumber: true,
                          onChange: () => calculateItemAmount(index),
                        })}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor={`items.${index}.taxRate`}>Tax %</Label>
                      <Input
                        id={`items.${index}.taxRate`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        {...register(`items.${index}.taxRate`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0"
                      />
                    </div>

                    <div className="col-span-1 flex items-end justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="col-span-12 flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Line Total:</span>
                      <div className="font-mono font-medium">
                        ${((items[index]?.amount || 0) / 100).toFixed(2)}
                        {items[index]?.taxRate && items[index]?.amount
                          ? ` + $${(
                              (items[index].amount * items[index].taxRate!) /
                              100 /
                              100
                            ).toFixed(2)} tax`
                          : ""}
                      </div>
                    </div>
                  </div>
                ))}

                {errors.items && !Array.isArray(errors.items) && (
                  <p className="text-sm text-red-500">{errors.items.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" {...register("dueDate")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountAmount">Discount ($)</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...register("discountAmount", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...register("notes")}
                      placeholder="Additional notes for the customer..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      {...register("terms")}
                      placeholder="Payment terms and conditions..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Invoice Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Invoice Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-mono">
                        ${(subtotal / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span className="font-mono">
                        ${(taxAmount / 100).toFixed(2)}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="font-mono text-red-500">
                          -${((discountAmount * 100) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="font-mono">
                        ${(total / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createInvoice.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createInvoice.isPending
                        ? "Creating..."
                        : "Create Invoice"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/admin/invoices")}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>💡 Enter amounts in dollars (USD)</p>
                  <p>📧 Invoice will be saved as draft</p>
                  <p>✉️ Send invoice later from the list</p>
                  <p>💳 Stripe integration available</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
