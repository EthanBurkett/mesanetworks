"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useSendPasswordResetCode, useResetPassword } from "@/hooks";
import {
  sendCodeSchema,
  SendCodeSchema,
  resetPasswordSchema,
  ResetPasswordSchema,
} from "@/schemas/auth.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const resetPasswordWithConfirm = resetPasswordSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordWithConfirm = z.infer<typeof resetPasswordWithConfirm>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [savedEmail, setSavedEmail] = useState("");

  const emailForm = useForm<SendCodeSchema>({
    resolver: zodResolver(sendCodeSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordWithConfirm>({
    resolver: zodResolver(resetPasswordWithConfirm),
    defaultValues: {
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const sendCodeMutation = useSendPasswordResetCode();
  const resetPasswordMutation = useResetPassword();

  const onSendCode = (data: SendCodeSchema) => {
    sendCodeMutation.mutate(data, {
      onSuccess: (_, variables) => {
        setSavedEmail(variables.email);
        resetForm.setValue("email", variables.email);
        setStep("reset");
      },
      onError: (error: Error) => {
        emailForm.setError("email", { message: error.message });
      },
    });
  };

  const onResetPassword = (data: ResetPasswordWithConfirm) => {
    const { confirmPassword, ...resetData } = data;
    resetPasswordMutation.mutate(resetData, {
      onSuccess: () => {
        window.location.href = "/login";
      },
      onError: (error: Error) => {
        resetForm.setError("code", { message: error.message });
      },
    });
  };

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
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              {step === "email"
                ? "Enter your email to receive a reset code"
                : "Enter the code and your new password"}
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border-2 border-border rounded-xl p-8 shadow-lg">
            {step === "email" ? (
              <form
                onSubmit={emailForm.handleSubmit(onSendCode)}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...emailForm.register("email")}
                    disabled={sendCodeMutation.isPending}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={sendCodeMutation.isPending}
                >
                  {sendCodeMutation.isPending
                    ? "Sending..."
                    : "Send Reset Code"}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={resetForm.handleSubmit(onResetPassword)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter code from email"
                    {...resetForm.register("code")}
                    disabled={resetPasswordMutation.isPending}
                  />
                  {resetForm.formState.errors.code && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    {...resetForm.register("newPassword")}
                    disabled={resetPasswordMutation.isPending}
                  />
                  {resetForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...resetForm.register("confirmPassword")}
                    disabled={resetPasswordMutation.isPending}
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending
                    ? "Resetting..."
                    : "Reset Password"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Back to login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
