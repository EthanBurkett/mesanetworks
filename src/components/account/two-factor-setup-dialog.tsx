"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import type { SetupResponse } from "@/hooks/use-two-factor";

interface SetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setupData: SetupResponse | null;
  onVerify: (code: string) => void;
  isVerifying: boolean;
}

export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  setupData,
  onVerify,
  isVerifying,
}: SetupDialogProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      toast.success("Secret copied to clipboard");
    }
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      onVerify(verificationCode);
      setVerificationCode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Scan the QR code with your authenticator app
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {setupData?.qrCode && (
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <Image
                src={setupData.qrCode}
                alt="QR Code"
                width={200}
                height={200}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Or enter this code manually:</Label>
            <div className="flex gap-2">
              <Input value={setupData?.secret || ""} readOnly />
              <Button size="icon" variant="outline" onClick={copySecret}>
                {copiedSecret ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="verify-code">Verification Code</Label>
            <Input
              id="verify-code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              maxLength={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={verificationCode.length !== 6 || isVerifying}
          >
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Enable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
