"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { DataTable, Column, useDataTable } from "@/components/data-table";
import { SearchFilterBar } from "./search-filter-bar";
import { useState, useMemo } from "react";

interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
}

interface ManageRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  roles: Role[];
  selectedRoles: string[];
  onToggleRole: (roleId: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function ManageRolesDialog({
  open,
  onOpenChange,
  userName,
  roles,
  selectedRoles,
  onToggleRole,
  onSave,
  isSaving,
}: ManageRolesDialogProps) {
  const [roleTypeFilter, setRoleTypeFilter] = useState("all");

  const filterFn = useMemo(() => {
    return (role: Role) => {
      if (roleTypeFilter === "system") return role.isSystem;
      if (roleTypeFilter === "custom") return !role.isSystem;
      return true;
    };
  }, [roleTypeFilter]);

  const {
    search,
    setSearch,
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
  } = useDataTable({
    data: roles,
    itemsPerPage: 5,
    searchFields: ["name", "description"],
    filterFn,
  });

  const columns: Column<Role>[] = [
    {
      key: "checkbox",
      header: "",
      className: "w-12",
      render: (role) => (
        <Checkbox
          checked={selectedRoles.includes(role._id)}
          onCheckedChange={() => onToggleRole(role._id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: "name",
      header: "Role",
      render: (role) => (
        <p className="font-medium group-hover:text-foreground">{role.name}</p>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (role) => (
        <p className="text-sm text-muted-foreground group-hover:text-foreground">
          {role.description || "No description"}
        </p>
      ),
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (role) => (
        <p className="text-sm text-muted-foreground group-hover:text-foreground">
          {role.permissions.length}
        </p>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (role) =>
        role.isSystem ? (
          <Badge variant="secondary">System</Badge>
        ) : (
          <Badge variant="outline">Custom</Badge>
        ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[50vw] min-w-[25vw] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage User Roles</DialogTitle>
          <DialogDescription>
            Assign or remove roles for {userName}
          </DialogDescription>
        </DialogHeader>

        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search roles..."
          filters={[
            {
              value: roleTypeFilter,
              onChange: setRoleTypeFilter,
              placeholder: "Filter by type",
              options: [
                { value: "all", label: "All Types" },
                { value: "system", label: "System Roles" },
                { value: "custom", label: "Custom Roles" },
              ],
            },
          ]}
        />

        <div className="flex-1 overflow-auto">
          <DataTable
            data={paginatedData}
            columns={columns}
            emptyMessage="No roles found"
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={5}
            onPageChange={setCurrentPage}
            getRowKey={(role) => role._id}
            onRowClick={(role) => onToggleRole(role._id)}
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedRoles.length} role(s) selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
