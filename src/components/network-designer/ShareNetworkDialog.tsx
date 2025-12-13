import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";

interface ShareNetworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string | null;
  onCopyLink: () => void;
}

export function ShareNetworkDialog({
  open,
  onOpenChange,
  shareUrl,
  onCopyLink,
}: ShareNetworkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Network</DialogTitle>
          <DialogDescription>
            Your network is now publicly accessible via this link
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input value={shareUrl || ""} readOnly className="flex-1" />
          <Button onClick={onCopyLink} size="icon" variant="outline">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Anyone with this link can view your network design (read-only).
        </p>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
