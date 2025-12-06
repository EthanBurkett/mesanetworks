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
import { Loader2, Shield } from "lucide-react";

interface RegenerateCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerate: (code: string) => void;
  isRegenerating: boolean;
}

export function RegenerateCodesDialog({
  open,
  onOpenChange,
  onRegenerate,
  isRegenerating,
}: RegenerateCodesDialogProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onRegenerate(code);
      setCode("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isRegenerating) {
      setCode("");
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Regenerate Backup Codes
          </DialogTitle>
          <DialogDescription>
            Enter your authenticator code to generate new backup codes. This
            will invalidate all existing backup codes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-code">Verification Code</Label>
            <Input
              id="verify-code"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              disabled={isRegenerating}
              className="text-center text-lg tracking-widest"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isRegenerating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={code.length !== 6 || isRegenerating}
            >
              {isRegenerating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Regenerate Codes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
