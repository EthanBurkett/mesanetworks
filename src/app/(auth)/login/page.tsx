"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useLogin, useVerify2FA } from "@/hooks";
import { loginSchema, LoginSchema } from "@/schemas/auth.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TwoFactorVerify } from "@/components/auth/two-factor-verify";

export default function LoginPage() {
  const [requires2FA, setRequires2FA] = useState(false);
  const [verifyError, setVerifyError] = useState<string>();

  const loginMutation = useLogin();
  const verify2FAMutation = useVerify2FA();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginSchema) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        if (response.requires2FA) {
          setRequires2FA(true);
        }
      },
      onError: (error: Error) => {
        setError("identifier", { message: error.message });
      },
    });
  };

  const handleVerify2FA = (code: string) => {
    setVerifyError(undefined);
    verify2FAMutation.mutate(
      { token: code },
      {
        onError: (error: Error) => {
          setVerifyError(error.message);
        },
      }
    );
  };

  const handleUseBackupCode = (code: string) => {
    setVerifyError(undefined);
    verify2FAMutation.mutate(
      { backupCode: code },
      {
        onError: (error: Error) => {
          setVerifyError(error.message);
        },
      }
    );
  };

  const handleBackToLogin = () => {
    setRequires2FA(false);
    setVerifyError(undefined);
  };

  // Show 2FA verification if required
  if (requires2FA) {
    return (
      <TwoFactorVerify
        onVerify={handleVerify2FA}
        onUseBackupCode={handleUseBackupCode}
        onBack={handleBackToLogin}
        isVerifying={verify2FAMutation.isPending}
        error={verifyError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
                Mesa Networks
              </Badge>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-card border-2 border-border rounded-xl p-8 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("identifier")}
                  disabled={loginMutation.isPending}
                />
                {errors.identifier && (
                  <p className="text-sm text-destructive">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={loginMutation.isPending}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Create one
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
