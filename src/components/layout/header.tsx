"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { UserButton } from "@/components/auth/user-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useAuth, useHasRoleHierarchy } from "@/hooks";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/rbac/permissions";

export function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const hasEmployeeAccess = useHasRoleHierarchy(Role.EMPLOYEE);
  const hasAdminAccess = useHasRoleHierarchy(Role.ADMIN);

  const navItems = [
    { href: "#services", label: "Services" },
    { href: "#why-us", label: "Why Us" },
    { href: "#projects", label: "Projects" },
    { href: "/admin", label: "Admin", requires: Role.ADMIN },
    { href: "/dashboard", label: "Dashboard", requires: Role.EMPLOYEE },
  ];

  const handleNavClick = (href: string) => {
    setOpen(false);
    // Small delay to allow sheet to close before scrolling
    setTimeout(() => {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                MN
              </span>
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              Mesa Networks
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              if (item.requires) {
                if (item.requires === Role.ADMIN && !hasAdminAccess) {
                  return null;
                }

                if (item.requires === Role.EMPLOYEE && !hasEmployeeAccess) {
                  return null;
                }
              }

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-primary to-accent transition-[width] duration-300 will-change-[width] group-hover:w-full"></span>
                </a>
              );
            })}
            <ThemeSwitcher />
            <UserButton />
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeSwitcher />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">
                          MN
                        </span>
                      </div>
                      <span className="text-lg font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                        Mesa Networks
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 mt-8">
                  {/* User Section */}
                  {isAuthenticated && (
                    <div className="pb-4 border-b border-border">
                      <UserButton />
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      if (item.requires) {
                        if (item.requires === Role.ADMIN && !hasAdminAccess) {
                          return null;
                        }

                        if (
                          item.requires === Role.EMPLOYEE &&
                          !hasEmployeeAccess
                        ) {
                          return null;
                        }
                      }

                      return (
                        <button
                          key={item.href}
                          onClick={() => handleNavClick(item.href)}
                          className="text-left px-4 py-3 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>

                  {/* Auth Buttons for non-authenticated users */}
                  {!isAuthenticated && (
                    <div className="flex flex-col gap-2 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setOpen(false);
                          router.push("/login");
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="gradient"
                        className="w-full"
                        onClick={() => {
                          setOpen(false);
                          router.push("/register");
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
