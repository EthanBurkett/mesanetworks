"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface SuspendUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  isCurrentlyActive: boolean;
  onConfirm: (reason?: string) => void;
  isSaving: boolean;
}

export function SuspendUserDialog({
  open,
  onOpenChange,
  userName,
  isCurrentlyActive,
  onConfirm,
  isSaving,
}: SuspendUserDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason || undefined);
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCurrentlyActive ? (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Suspend User Account
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Activate User Account
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCurrentlyActive ? (
              <>
                Are you sure you want to suspend <strong>{userName}</strong>?
                This will immediately revoke all their active sessions and
                prevent them from accessing the system.
              </>
            ) : (
              <>
                Are you sure you want to activate <strong>{userName}</strong>?
                This will allow them to access the system again.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isCurrentlyActive && (
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for suspension..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              The user will receive an email notification with this reason.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant={isCurrentlyActive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isCurrentlyActive ? "Suspending..." : "Activating..."}
              </>
            ) : isCurrentlyActive ? (
              "Suspend Account"
            ) : (
              "Activate Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
