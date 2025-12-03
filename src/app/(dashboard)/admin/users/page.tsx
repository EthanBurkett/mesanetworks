"use client";

import { useUsers } from "@/hooks/use-users";
import { useRoles } from "@/hooks/use-roles";
import { useUpdateUserRoles } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column, useDataTable } from "@/components/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { ManageRolesDialog } from "@/components/admin/manage-roles-dialog";
import { useState, useMemo } from "react";
import { Users, Filter, Shield, Mail, Calendar, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UserResponse } from "@/lib/api/users";

export default function UsersPage() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: roles } = useRoles();
  const updateUserRoles = useUpdateUserRoles();

  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filterFn = useMemo(() => {
    return (user: UserResponse): boolean => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      const matchesRole =
        roleFilter === "all" ||
        (user.roles && user.roles.some((r) => r._id === roleFilter)) ||
        false;

      return matchesStatus && matchesRole;
    };
  }, [statusFilter, roleFilter]);

  const {
    search,
    setSearch,
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredData,
  } = useDataTable({
    data: users || [],
    itemsPerPage: 10,
    searchFields: ["email", "firstName", "lastName", "displayName"],
    filterFn,
  });

  const handleEditRoles = (userId: string, currentRoles: string[]) => {
    setSelectedUser(userId);
    setSelectedRoles(currentRoles);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setSelectedRoles([]);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    await updateUserRoles.mutateAsync({
      userId: selectedUser,
      roles: selectedRoles,
    });
    handleCloseDialog();
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const columns: Column<UserResponse>[] = [
    {
      key: "user",
      header: "User",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <p className="font-medium">{user.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {user._id.slice(0, 8)}...
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {user.email}
        </div>
      ),
    },
    {
      key: "roles",
      header: "Roles",
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <Badge key={role._id} variant="outline">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No roles</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <Badge variant={user.isActive ? "default" : "secondary"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      render: (user) =>
        user.lastLoginAt ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDistanceToNow(new Date(user.lastLoginAt), {
              addSuffix: true,
            })}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Never</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (user) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEditRoles(user._id, user.roles?.map((r) => r._id) || []);
          }}
        >
          <Shield className="h-4 w-4 mr-2" />
          Manage Roles
        </Button>
      ),
    },
  ];

  const selectedUserName = useMemo(() => {
    if (!selectedUser || !users) return "";
    const user = users.find((u) => u._id === selectedUser);
    return user?.displayName || "";
  }, [selectedUser, users]);

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Total Users" value={users?.length || 0} />
        <StatCard
          icon={Users}
          label="Active Users"
          value={users?.filter((u) => u.isActive).length || 0}
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
        />
        <StatCard
          icon={Shield}
          label="Available Roles"
          value={roles?.length || 0}
          iconColor="text-orange-500"
          iconBgColor="bg-orange-500/10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search users..."
            filters={[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                placeholder: "Filter by status",
                options: [
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ],
              },
              {
                value: roleFilter,
                onChange: setRoleFilter,
                placeholder: "Filter by role",
                options: [
                  { value: "all", label: "All Roles" },
                  ...(roles?.map((role) => ({
                    value: role._id,
                    label: role.name,
                  })) || []),
                ],
              },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedData}
            columns={columns}
            emptyMessage="No users found"
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
            getRowKey={(user) => user._id}
          />
        </CardContent>
      </Card>

      <ManageRolesDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userName={selectedUserName}
        roles={roles || []}
        selectedRoles={selectedRoles}
        onToggleRole={toggleRole}
        onSave={handleSaveRoles}
        isSaving={updateUserRoles.isPending}
      />
    </div>
  );
}
