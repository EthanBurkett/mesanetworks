import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface NetworkItem {
  _id: string;
  name: string;
  description?: string;
  _updatedAt: Date;
}

interface LoadNetworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networks: NetworkItem[] | undefined;
  onLoad: (network: NetworkItem) => void;
  onDelete: (networkId: string) => void;
}

export function LoadNetworkDialog({
  open,
  onOpenChange,
  networks,
  onLoad,
  onDelete,
}: LoadNetworkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Load Network</DialogTitle>
          <DialogDescription>
            Select a saved network design to load
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {networks && networks.length > 0 ? (
            networks.map((network) => (
              <Card
                key={network._id}
                className="p-4 hover:bg-accent cursor-pointer"
                onClick={() => onLoad(network)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{network.name}</h3>
                    {network.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {network.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Last updated:{" "}
                      {new Date(network._updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(network._id);
                    }}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No saved networks found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
