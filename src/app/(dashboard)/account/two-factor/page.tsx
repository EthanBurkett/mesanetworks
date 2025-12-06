"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Smartphone, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  useTwoFactorStatus,
  useSetupTwoFactor,
  useVerifyTwoFactor,
  useDisableTwoFactor,
  useRegenerateBackupCodes,
  type SetupResponse,
} from "@/hooks";
import { TwoFactorSetupDialog } from "@/components/account/two-factor-setup-dialog";
import { BackupCodesDialog } from "@/components/account/backup-codes-dialog";
import { TwoFactorDisableDialog } from "@/components/account/two-factor-disable-dialog";
import { TwoFactorStatusCard } from "@/components/account/two-factor-status-card";
import { RegenerateCodesDialog } from "@/components/account/regenerate-codes-dialog";

export default function TwoFactorPage() {
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Hooks
  const { data: status, isLoading } = useTwoFactorStatus();
  const setupMutation = useSetupTwoFactor();
  const verifyMutation = useVerifyTwoFactor();
  const disableMutation = useDisableTwoFactor();
  const regenerateCodesMutation = useRegenerateBackupCodes();

  const handleSetup = () => {
    setupMutation.mutate(undefined, {
      onSuccess: (data) => {
        setSetupData(data);
        setShowSetupDialog(true);
        toast.success("2FA setup initiated");
      },
      onError: () => {
        toast.error("Failed to setup two-factor authentication");
      },
    });
  };

  const handleVerify = (code: string) => {
    verifyMutation.mutate(code, {
      onSuccess: (data) => {
        setBackupCodes(data.backupCodes);
        setShowSetupDialog(false);
        setShowBackupCodesDialog(true);
      },
    });
  };

  const handleDisable = (code: string) => {
    disableMutation.mutate(code, {
      onSuccess: () => {
        setShowDisableDialog(false);
      },
    });
  };

  const handleRegenerateCodes = () => {
    setShowRegenerateDialog(true);
  };

  const handleConfirmRegenerate = (code: string) => {
    regenerateCodesMutation.mutate(code, {
      onSuccess: (codes) => {
        setBackupCodes(codes);
        setShowRegenerateDialog(false);
        setShowBackupCodesDialog(true);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Two-Factor Authentication</h1>
        <p className="text-muted-foreground">
          Add an extra layer of security to your account
        </p>
      </div>

      {/* Status Card */}
      <TwoFactorStatusCard status={status} />

      {/* Main Content */}
      {!status?.enabled ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Enable Two-Factor Authentication</CardTitle>
              <CardDescription>
                Protect your account with TOTP-based two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                <Smartphone className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium">Use an Authenticator App</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll need an authenticator app like Google Authenticator,
                    Authy, or 1Password to generate verification codes.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSetup}
                disabled={setupMutation.isPending}
                className="w-full"
              >
                {setupMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Set Up Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Backup Codes</CardTitle>
              <CardDescription>
                Use backup codes to access your account if you lose your
                authenticator device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRegenerateCodes}
                variant="outline"
                disabled={regenerateCodesMutation.isPending}
              >
                {regenerateCodesMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Regenerate Backup Codes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <CardTitle className="text-destructive">
                    Disable Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    This will remove the extra security layer from your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowDisableDialog(true)}
                variant="destructive"
              >
                Disable Two-Factor Auth
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Dialogs */}
      <TwoFactorSetupDialog
        open={showSetupDialog}
        onOpenChange={setShowSetupDialog}
        setupData={setupData}
        onVerify={handleVerify}
        isVerifying={verifyMutation.isPending}
      />

      <BackupCodesDialog
        open={showBackupCodesDialog}
        onOpenChange={setShowBackupCodesDialog}
        backupCodes={backupCodes}
      />

      <TwoFactorDisableDialog
        open={showDisableDialog}
        onOpenChange={setShowDisableDialog}
        onDisable={handleDisable}
        isDisabling={disableMutation.isPending}
      />

      <RegenerateCodesDialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
        onRegenerate={handleConfirmRegenerate}
        isRegenerating={regenerateCodesMutation.isPending}
      />
    </div>
  );
}
