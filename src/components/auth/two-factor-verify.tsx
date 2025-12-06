"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface TwoFactorVerifyProps {
  onVerify: (code: string) => void;
  onUseBackupCode: (code: string) => void;
  onBack: () => void;
  isVerifying: boolean;
  error?: string;
}

export function TwoFactorVerify({
  onVerify,
  onUseBackupCode,
  onBack,
  isVerifying,
  error,
}: TwoFactorVerifyProps) {
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useBackup) {
      if (backupCode.trim()) {
        onUseBackupCode(backupCode.trim());
      }
    } else {
      if (code.length === 6) {
        onVerify(code);
      }
    }
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
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Two-Factor Authentication
            </h1>
            <p className="text-muted-foreground">
              Enter the verification code from your authenticator app
            </p>
          </div>

          {/* Verification Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {useBackup ? "Enter Backup Code" : "Verification Code"}
              </CardTitle>
              <CardDescription>
                {useBackup
                  ? "Use one of your backup codes to sign in"
                  : "Enter the 6-digit code from your authenticator app"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!useBackup ? (
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      maxLength={6}
                      disabled={isVerifying}
                      className="text-center text-2xl tracking-widest"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="backup">Backup Code</Label>
                    <Input
                      id="backup"
                      type="text"
                      placeholder="XXXXXXXX"
                      value={backupCode}
                      onChange={(e) =>
                        setBackupCode(e.target.value.toUpperCase())
                      }
                      disabled={isVerifying}
                      className="font-mono"
                      autoFocus
                    />
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={
                    isVerifying ||
                    (!useBackup && code.length !== 6) ||
                    (useBackup && !backupCode.trim())
                  }
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setUseBackup(!useBackup);
                      setCode("");
                      setBackupCode("");
                    }}
                    disabled={isVerifying}
                  >
                    {useBackup
                      ? "Use authenticator app instead"
                      : "Use backup code instead"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onBack}
                    disabled={isVerifying}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
