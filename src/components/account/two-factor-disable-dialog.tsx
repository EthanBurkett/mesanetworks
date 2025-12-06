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
import { AlertTriangle, Loader2 } from "lucide-react";

interface DisableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisable: (code: string) => void;
  isDisabling: boolean;
}

export function TwoFactorDisableDialog({
  open,
  onOpenChange,
  onDisable,
  isDisabling,
}: DisableDialogProps) {
  const [disableCode, setDisableCode] = useState("");

  const handleDisable = () => {
    if (disableCode.length === 6) {
      onDisable(disableCode);
      setDisableCode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter a verification code to confirm you want to disable 2FA
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">
              Your account will be less secure without two-factor authentication
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="disable-code">Verification Code</Label>
            <Input
              id="disable-code"
              placeholder="Enter 6-digit code"
              value={disableCode}
              onChange={(e) =>
                setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))
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
            variant="destructive"
            onClick={handleDisable}
            disabled={disableCode.length !== 6 || isDisabling}
          >
            {isDisabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disable 2FA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
