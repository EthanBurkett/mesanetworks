"use client";

import { useAuth, useLogout } from "@/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  Shield,
  LogOut,
  Loader2,
  ChevronDown,
} from "lucide-react";

export function UserButton() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const logoutMutation = useLogout();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => router.push("/login")}>
          Sign In
        </Button>
        <Button
          size="sm"
          variant="gradient"
          onClick={() => router.push("/register")}
        >
          Sign Up
        </Button>
      </div>
    );
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 gap-2 rounded-full hover:text-foreground px-3 hover:bg-accent/10 dark:hover:bg-accent/20 dark:hover:text-foreground"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.firstName} />
            <AvatarFallback className="bg-linear-to-br from-primary to-accent text-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/account")}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/account/security")}>
          <Shield className="mr-2 h-4 w-4" />
          <span>Sessions & Security</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/account/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>
            {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
