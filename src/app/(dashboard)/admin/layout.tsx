"use client";

import { useAuth } from "@/hooks";
import { useHasPermission } from "@/hooks/use-permissions";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect } from "react";
import {
  Shield,
  Users,
  Settings,
  ChevronRight,
  Loader2,
  LayoutDashboard,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and analytics",
    permission: "admin:panel:access",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    description: "Manage user accounts",
    permission: "user:list",
  },
  {
    title: "Roles & Permissions",
    href: "/admin/roles",
    icon: Shield,
    description: "Configure role hierarchy",
    permission: "role:read",
  },
  {
    title: "Activity Logs",
    href: "/admin/logs",
    icon: Activity,
    description: "Audit trail and logs",
    permission: "audit:log:read",
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System configuration",
    permission: "system:settings",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, permissions } = useAuth();
  const hasAdminAccess = useHasPermission("admin:panel:access");

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!hasAdminAccess) {
        router.push("/");
      }
    }
  }, [user, isLoading, hasAdminAccess, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter menu items based on permissions
  const allowedMenuItems = menuItems.filter((item) =>
    permissions.includes(item.permission as any)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    MN
                  </span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Mesa Networks
                </span>
              </Link>
              <Badge variant="outline" className="ml-2">
                Admin Panel
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to Home
              </Link>
              <Link
                href="/account"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                My Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-card border-2 border-border rounded-xl p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Admin Panel</h3>
                    <p className="text-xs text-muted-foreground">
                      System Management
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <nav className="space-y-1">
                {allowedMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all group",
                        isActive
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground hidden lg:block">
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 text-accent" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-9"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
