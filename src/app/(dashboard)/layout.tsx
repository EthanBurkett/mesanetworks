"use client";

import { useAuth, useHasRoleHierarchy, useIsAdmin } from "@/hooks";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
  LayoutDashboard,
  User,
  Settings,
  Shield,
  Clock,
  ChevronRight,
  Loader2,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/rbac/permissions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your overview",
    requiresRole: Role.EMPLOYEE,
  },
  {
    title: "Time Clock",
    href: "/dashboard/timesheet",
    icon: Clock,
    description: "Track your hours",
    requiresRole: Role.EMPLOYEE,
  },
  {
    title: "Account",
    href: "/account",
    icon: User,
    description: "Personal settings",
  },
  {
    title: "Admin Panel",
    href: "/admin",
    icon: Shield,
    description: "System administration",
    requiresAdmin: true,
  },
];

function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const hasEmployeeAccess = useHasRoleHierarchy(Role.EMPLOYEE);

  const allowedMenuItems = menuItems.filter((item) => {
    if (item.requiresAdmin && !isAdmin) return false;
    if (item.requiresRole && !hasEmployeeAccess) return false;
    return true;
  });

  return (
    <aside className={cn("flex flex-col gap-4", className)}>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Navigation
        </h2>
        <div className="space-y-1">
          {allowedMenuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-foreground transition-colors",
                  isActive ? "bg-accent text-foreground" : "transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <div>
                    <p>{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 border-r border-border min-h-screen sticky top-0">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  MN
                </span>
              </div>
              <span className="text-lg font-bold">Mesa Networks</span>
            </Link>
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Header */}
          <div className="lg:hidden border-b border-border p-4 flex items-center justify-between sticky top-0 bg-background z-40">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  MN
                </span>
              </div>
              <span className="text-lg font-bold">Mesa Networks</span>
            </Link>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-6">
                  <div className="mb-8">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">
                          MN
                        </span>
                      </div>
                      <span className="text-lg font-bold">Mesa Networks</span>
                    </div>
                  </div>
                  <Sidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Page Content */}
          <main className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
