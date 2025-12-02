"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Plus,
  GripVertical,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader2,
} from "lucide-react";
import { Reorder, AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useUpdateRoleHierarchy,
} from "@/hooks/use-roles";
import { RoleResponse } from "@/lib/api/auth";
import { toast } from "sonner";
import { Permission } from "@/lib/rbac/permissions";

const availablePermissions = Object.entries(Permission).map(([key, value]) => {
  // Convert enum key to readable label
  const label = key
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

  // Determine category from permission value
  let category = "Other";
  if (value.startsWith("user:")) category = "User Management";
  else if (value.startsWith("role:")) category = "Role Management";
  else if (value.startsWith("session:")) category = "Sessions";
  else if (
    value.startsWith("admin:") ||
    value.startsWith("system:") ||
    value.startsWith("audit:")
  )
    category = "Admin";

  return { value, label, category };
});

export default function RolesPage() {
  const { data: rolesData, isLoading } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const updateHierarchy = useUpdateRoleHierarchy();

  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<RoleResponse | null>(null);

  // Debounce state for hierarchy updates
  const hierarchyUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  const pendingHierarchyUpdates = useRef<Map<string, number>>(new Map());
  const [isSavingHierarchy, setIsSavingHierarchy] = useState(false);

  // Create role form state
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    hierarchyLevel: 0,
    inherits: false,
    inheritsFrom: [] as string[],
  });

  // Sync roles from query data
  useEffect(() => {
    if (rolesData) {
      // Sort by hierarchy level descending (highest first)
      const sorted = [...rolesData].sort(
        (a, b) => b.hierarchyLevel - a.hierarchyLevel
      );
      setRoles(sorted);
    }
  }, [rolesData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hierarchyUpdateTimeout.current) {
        clearTimeout(hierarchyUpdateTimeout.current);
      }
    };
  }, []);

  const handleReorder = useCallback(
    (newOrder: RoleResponse[]) => {
      // Update local state immediately for smooth UX
      setRoles(newOrder);
      setIsSavingHierarchy(true);

      // Track pending updates
      newOrder.forEach((role, index) => {
        const newHierarchyLevel = newOrder.length - 1 - index;
        pendingHierarchyUpdates.current.set(role._id, newHierarchyLevel);
      });

      // Clear existing timeout
      if (hierarchyUpdateTimeout.current) {
        clearTimeout(hierarchyUpdateTimeout.current);
      }

      // Debounce API call by 500ms
      hierarchyUpdateTimeout.current = setTimeout(() => {
        const updates = Array.from(
          pendingHierarchyUpdates.current.entries()
        ).map(([roleId, hierarchyLevel]) => ({
          roleId,
          hierarchyLevel,
        }));

        // Clear pending updates
        pendingHierarchyUpdates.current.clear();

        // Call API to persist changes
        updateHierarchy.mutate(updates, {
          onError: (error: any) => {
            toast.error(error.message || "Failed to update hierarchy");
            setIsSavingHierarchy(false);
            // Revert on error
            if (rolesData) {
              const sorted = [...rolesData].sort(
                (a, b) => b.hierarchyLevel - a.hierarchyLevel
              );
              setRoles(sorted);
            }
          },
          onSuccess: () => {
            toast.success("Role hierarchy updated");
            setIsSavingHierarchy(false);
          },
        });
      }, 2000);
    },
    [updateHierarchy, rolesData]
  );

  const toggleExpanded = (roleId: string) => {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  const handleSelectRole = (roleId: string) => {
    setSelectedRole(roleId);
    const role = roles.find((r) => r._id === roleId);
    if (role) {
      setEditedRole({ ...role });
    }
  };

  const handleSaveRole = () => {
    if (!editedRole) return;

    updateRole.mutate(
      {
        roleId: editedRole._id,
        data: {
          name: editedRole.name,
          description: editedRole.description,
          permissions: editedRole.permissions,
          hierarchyLevel: editedRole.hierarchyLevel,
        },
      },
      {
        onSuccess: () => {
          toast.success("Role updated successfully");
          setSelectedRole(null);
          setEditedRole(null);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update role");
        },
      }
    );
  };

  const togglePermission = (permission: string) => {
    if (!editedRole || editedRole.isSystem) return;

    const newPermissions = editedRole.permissions.includes(permission)
      ? editedRole.permissions.filter((p) => p !== permission)
      : [...editedRole.permissions, permission];

    setEditedRole({
      ...editedRole,
      permissions: newPermissions,
    });
  };

  const toggleNewRolePermission = (permission: string) => {
    const newPermissions = newRole.permissions.includes(permission)
      ? newRole.permissions.filter((p) => p !== permission)
      : [...newRole.permissions, permission];

    setNewRole({ ...newRole, permissions: newPermissions });
  };

  const handleCreateRole = () => {
    if (!newRole.name || newRole.name.length < 3) {
      toast.error("Role name must be at least 3 characters");
      return;
    }

    createRole.mutate(newRole, {
      onSuccess: () => {
        toast.success("Role created successfully");
        setIsCreating(false);
        setNewRole({
          name: "",
          description: "",
          permissions: [],
          hierarchyLevel: 0,
          inherits: false,
          inheritsFrom: [],
        });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create role");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selected = editedRole;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage role hierarchy and permissions. Drag to reorder.
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="gap-2"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List with Drag & Drop */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-2">
            {isSavingHierarchy && (
              <Alert className="mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Saving hierarchy changes...</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Hierarchy
              </h2>
              <span className="text-sm text-muted-foreground">
                Higher = More Privilege
              </span>
            </div>

            <Reorder.Group
              axis="y"
              values={roles}
              onReorder={handleReorder}
              className="space-y-3"
            >
              {roles.map((role) => (
                <Reorder.Item
                  key={role._id}
                  value={role}
                  layout
                  className={cn(
                    "bg-card border-2 rounded-lg transition-colors cursor-pointer",
                    selectedRole === role._id
                      ? "border-accent shadow-lg"
                      : "border-border hover:border-accent/50"
                  )}
                >
                  <div
                    onClick={() => handleSelectRole(role._id)}
                    className="p-4"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                      <div
                        className={cn(
                          "h-10 w-10 rounded-lg flex items-center justify-center",
                          role.hierarchyLevel === 4 &&
                            "bg-gradient-to-br from-purple-500 to-pink-500",
                          role.hierarchyLevel === 3 &&
                            "bg-gradient-to-br from-blue-500 to-cyan-500",
                          role.hierarchyLevel === 2 &&
                            "bg-gradient-to-br from-green-500 to-emerald-500",
                          role.hierarchyLevel === 1 &&
                            "bg-gradient-to-br from-orange-500 to-yellow-500",
                          role.hierarchyLevel === 0 &&
                            "bg-gradient-to-br from-gray-500 to-slate-500"
                        )}
                      >
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{role.name}</h3>
                          {role.isSystem && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Lock className="h-3 w-3" />
                              System
                            </Badge>
                          )}
                          {role.inherits && (
                            <Badge variant="secondary" className="text-xs">
                              Inherits
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(role._id);
                          }}
                          className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          {expandedRole === role._id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence initial={false}>
                      {expandedRole === role._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Permissions ({role.permissions.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {role.permissions.map((perm) => (
                                    <Badge
                                      key={perm}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {perm}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {role.inherits && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Inheritance
                                  </p>
                                  <p className="text-sm">
                                    {role.inheritsFrom.length > 0
                                      ? `Inherits from specific roles`
                                      : `Inherits from all roles with lower hierarchy`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Drag roles to reorder their hierarchy.
                Higher positions = more privilege.
              </p>
            </div>
          </Card>
        </div>

        {/* Role Details / Editor */}
        <div className="lg:col-span-1">
          {isCreating ? (
            <Card className="p-6 border-2 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Create New Role</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCreating(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="mb-4" />

              <div className="space-y-4">
                <div>
                  <Label>Role Name*</Label>
                  <Input
                    value={newRole.name}
                    onChange={(e) =>
                      setNewRole({ ...newRole, name: e.target.value })
                    }
                    placeholder="CUSTOM_ROLE"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={newRole.description}
                    onChange={(e) =>
                      setNewRole({ ...newRole, description: e.target.value })
                    }
                    placeholder="Role description"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Hierarchy Level</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newRole.hierarchyLevel}
                    onChange={(e) =>
                      setNewRole({
                        ...newRole,
                        hierarchyLevel: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher number = more privilege
                  </p>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newRole.inherits}
                      onChange={(e) =>
                        setNewRole({ ...newRole, inherits: e.target.checked })
                      }
                      className="rounded border-input"
                    />
                    Enable Inheritance
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inherit permissions from lower-level roles
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="mb-2 block">
                    Permissions ({newRole.permissions.length})
                  </Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {availablePermissions.map((perm) => (
                      <label
                        key={perm.value}
                        className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-accent/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={newRole.permissions.includes(perm.value)}
                          onChange={() => toggleNewRolePermission(perm.value)}
                          className="rounded border-input"
                        />
                        <span className="flex-1">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={handleCreateRole}
                  disabled={createRole.isPending || !newRole.name}
                  className="w-full gap-2"
                >
                  {createRole.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create Role
                </Button>
              </div>
            </Card>
          ) : selected ? (
            <Card className="p-6 border-2 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Role Details</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedRole(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="mb-4" />

              <div className="space-y-4">
                <div>
                  <Label>Role Name</Label>
                  <Input
                    value={selected.name}
                    onChange={(e) =>
                      setEditedRole({ ...selected, name: e.target.value })
                    }
                    disabled={selected.isSystem}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={selected.description}
                    onChange={(e) =>
                      setEditedRole({
                        ...selected,
                        description: e.target.value,
                      })
                    }
                    disabled={selected.isSystem}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Hierarchy Level</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      type="number"
                      value={selected.hierarchyLevel}
                      disabled
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      (set by position)
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.inherits}
                      onChange={(e) =>
                        setEditedRole({
                          ...selected,
                          inherits: e.target.checked,
                        })
                      }
                      disabled={selected.isSystem}
                      className="rounded border-input"
                    />
                    Enable Inheritance
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inherit permissions from lower-level roles
                  </p>
                </div>

                <Separator />

                <div>
                  <Label className="mb-2 block">
                    Permissions ({selected.permissions.length})
                  </Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {availablePermissions.map((perm) => (
                      <label
                        key={perm.value}
                        className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-accent/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected.permissions.includes(perm.value)}
                          onChange={() => togglePermission(perm.value)}
                          disabled={selected.isSystem}
                          className="rounded border-input"
                        />
                        <span className="flex-1">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {!selected.isSystem && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveRole}
                        disabled={updateRole.isPending}
                        className="flex-1 gap-2"
                      >
                        {updateRole.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 border-2 border-dashed">
              <div className="text-center text-muted-foreground py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No role selected</p>
                <p className="text-sm mt-1">Click on a role to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
