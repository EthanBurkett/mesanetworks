import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SaveNetworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networkName: string;
  networkDescription: string;
  onNetworkNameChange: (name: string) => void;
  onNetworkDescriptionChange: (description: string) => void;
  onSave: () => void;
  isUpdating: boolean;
  isSaving?: boolean;
}

export function SaveNetworkDialog({
  open,
  onOpenChange,
  networkName,
  networkDescription,
  onNetworkNameChange,
  onNetworkDescriptionChange,
  onSave,
  isUpdating,
  isSaving = false,
}: SaveNetworkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUpdating ? "Update Network" : "Save Network"}
          </DialogTitle>
          <DialogDescription>
            Save your network design to the cloud
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="network-name">Network Name *</Label>
            <Input
              id="network-name"
              value={networkName}
              onChange={(e) => onNetworkNameChange(e.target.value)}
              placeholder="My Office Network"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="network-description">Description</Label>
            <Textarea
              id="network-description"
              value={networkDescription}
              onChange={(e) => onNetworkDescriptionChange(e.target.value)}
              placeholder="Describe your network design..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : isUpdating ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
