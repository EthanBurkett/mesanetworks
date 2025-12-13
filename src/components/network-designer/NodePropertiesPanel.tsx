import type { Node } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface NodePropertiesPanelProps {
  selectedNode: Node;
  onClose: () => void;
  onUpdateNodeData: (nodeId: string, data: Partial<any>) => void;
}

export function NodePropertiesPanel({
  selectedNode,
  onClose,
  onUpdateNodeData,
}: NodePropertiesPanelProps) {
  return (
    <div className="w-80 border-l bg-background p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Device Properties</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Device Name */}
        <div className="space-y-2">
          <Label htmlFor="device-name">Device Name</Label>
          <Input
            id="device-name"
            value={selectedNode.data.label || ""}
            onChange={(e) =>
              onUpdateNodeData(selectedNode.id, { label: e.target.value })
            }
            placeholder="Enter device name"
          />
        </div>

        {/* Device Type */}
        <div className="space-y-2">
          <Label htmlFor="device-type">Device Type</Label>
          <Select
            value={selectedNode.data.type || "server"}
            onValueChange={(value) =>
              onUpdateNodeData(selectedNode.id, { type: value })
            }
          >
            <SelectTrigger id="device-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="router">Router</SelectItem>
              <SelectItem value="switch">Switch</SelectItem>
              <SelectItem value="firewall">Firewall</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="nas">NAS</SelectItem>
              <SelectItem value="ap">Access Point</SelectItem>
              <SelectItem value="camera">Camera</SelectItem>
              <SelectItem value="cloud">Cloud/ISP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* IP Address */}
        <div className="space-y-2">
          <Label htmlFor="ip-address">IP Address</Label>
          <Input
            id="ip-address"
            value={selectedNode.data.ip || ""}
            onChange={(e) =>
              onUpdateNodeData(selectedNode.id, { ip: e.target.value })
            }
            placeholder="192.168.1.1"
            pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={selectedNode.data.location || ""}
            onChange={(e) =>
              onUpdateNodeData(selectedNode.id, { location: e.target.value })
            }
            placeholder="Server Room"
          />
        </div>

        {/* VLAN */}
        <div className="space-y-2">
          <Label htmlFor="vlan">VLAN</Label>
          <Input
            id="vlan"
            value={selectedNode.data.vlan || ""}
            onChange={(e) =>
              onUpdateNodeData(selectedNode.id, { vlan: e.target.value })
            }
            placeholder="10, 20"
          />
        </div>

        <Separator />

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={selectedNode.data.status || "online"}
            onValueChange={(value) =>
              onUpdateNodeData(selectedNode.id, { status: value })
            }
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <Label htmlFor="metadata">Additional Info</Label>
          <Textarea
            id="metadata"
            value={
              selectedNode.data.metadata
                ? Object.entries(selectedNode.data.metadata)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n")
                : ""
            }
            onChange={(e) => {
              const lines = e.target.value.split("\n");
              const metadata: Record<string, string> = {};
              lines.forEach((line) => {
                const [key, ...valueParts] = line.split(":");
                if (key && valueParts.length > 0) {
                  metadata[key.trim()] = valueParts.join(":").trim();
                }
              });
              onUpdateNodeData(selectedNode.id, { metadata });
            }}
            placeholder="Additional info"
          />
        </div>
      </div>
    </div>
  );
}
