"use client";

import { useAuth } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AccountPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      {/* Profile Info */}
      <div className="bg-card border-2 border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-accent" />
          <h2 className="text-xl font-semibold">Personal Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Full Name
            </label>
            <p className="text-lg font-medium mt-1">
              {user.firstName} {user.lastName}
            </p>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email Address
            </label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-medium">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Account Status
            </label>
            <div className="mt-1">
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {user.lastLoginAt && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Login
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-medium">
                    {formatDistanceToNow(new Date(user.lastLoginAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
