"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Link from "next/link";
import { useRegister, useSendVerificationCode, useVerifyEmail } from "@/hooks";
import { registerSchema, RegisterSchema } from "@/schemas/auth.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const registerMutation = useRegister();
  const sendCodeMutation = useSendVerificationCode();
  const verifyMutation = useVerifyEmail();

  const onSubmit = (data: RegisterSchema) => {
    registerMutation.mutate(data, {
      onSuccess: (_, variables) => {
        setEmail(variables.email);
        sendCodeMutation.mutate(
          { email: variables.email },
          {
            onSuccess: () => {
              setStep("verify");
            },
            onError: (error: Error) => {
              setError("email", { message: error.message });
            },
          }
        );
      },
      onError: (error: Error) => {
        setError("email", { message: error.message });
      },
    });
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      setVerifyError("");
      verifyMutation.mutate(
        { email, code: verificationCode },
        {
          onError: (error: Error) => {
            setVerifyError(error.message);
          },
        }
      );
    }
  };

  const handleResendCode = () => {
    setVerificationCode("");
    setVerifyError("");
    sendCodeMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative min-h-screen flex items-center justify-center py-12">
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
            <h1 className="text-3xl font-bold mb-2">
              {step === "register" ? "Create Account" : "Verify Your Email"}
            </h1>
            <p className="text-muted-foreground">
              {step === "register"
                ? "Join Mesa Networks today"
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {/* Forms */}
          <div className="bg-card border-2 border-border rounded-xl p-8 shadow-lg">
            {step === "register" ? (
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        {...register("firstName")}
                        disabled={
                          registerMutation.isPending ||
                          sendCodeMutation.isPending
                        }
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        {...register("lastName")}
                        disabled={
                          registerMutation.isPending ||
                          sendCodeMutation.isPending
                        }
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register("email")}
                      disabled={
                        registerMutation.isPending || sendCodeMutation.isPending
                      }
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      disabled={
                        registerMutation.isPending || sendCodeMutation.isPending
                      }
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      At least 6 characters
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={
                      registerMutation.isPending || sendCodeMutation.isPending
                    }
                  >
                    {registerMutation.isPending || sendCodeMutation.isPending
                      ? "Creating account..."
                      : "Create Account"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    Already have an account?{" "}
                  </span>
                  <Link
                    href="/login"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-center block">Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={verificationCode}
                      onChange={(value) => {
                        setVerificationCode(value);
                        setVerifyError("");
                      }}
                      disabled={verifyMutation.isPending}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {verifyError && (
                    <p className="text-sm text-destructive text-center">
                      {verifyError}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleVerify}
                  variant="gradient"
                  className="w-full"
                  disabled={
                    verificationCode.length !== 6 || verifyMutation.isPending
                  }
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-sm text-primary hover:underline"
                    disabled={sendCodeMutation.isPending}
                  >
                    {sendCodeMutation.isPending ? "Sending..." : "Resend Code"}
                  </button>
                  <div>
                    <Link
                      href="/login"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Back to login
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
