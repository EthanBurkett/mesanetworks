import type { Edge } from "reactflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "./ColorPicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface EdgePropertiesPanelProps {
  selectedEdge: Edge;
  onClose: () => void;
  onUpdateEdgeData: (edgeId: string, updates: Partial<any>) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export function EdgePropertiesPanel({
  selectedEdge,
  onClose,
  onUpdateEdgeData,
  onDeleteEdge,
}: EdgePropertiesPanelProps) {
  return (
    <div className="w-80 border-l bg-background p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Connection Properties</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Connection Type */}
        <div className="space-y-2">
          <Label htmlFor="connection-type">Connection Type</Label>
          <Select
            value={selectedEdge.data?.connectionType || "ethernet"}
            onValueChange={(value) =>
              onUpdateEdgeData(selectedEdge.id, { connectionType: value })
            }
          >
            <SelectTrigger id="connection-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethernet">Ethernet</SelectItem>
              <SelectItem value="fiber">Fiber Optic</SelectItem>
              <SelectItem value="wireless">Wireless</SelectItem>
              <SelectItem value="wan">WAN</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bandwidth */}
        <div className="space-y-2">
          <Label htmlFor="bandwidth">Bandwidth</Label>
          <Select
            value={selectedEdge.data?.bandwidth || "1 Gbps"}
            onValueChange={(value) =>
              onUpdateEdgeData(selectedEdge.id, {
                bandwidth: value,
                label: value,
              })
            }
          >
            <SelectTrigger id="bandwidth">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100 Mbps">100 Mbps</SelectItem>
              <SelectItem value="1 Gbps">1 Gbps</SelectItem>
              <SelectItem value="10 Gbps">10 Gbps</SelectItem>
              <SelectItem value="40 Gbps">40 Gbps</SelectItem>
              <SelectItem value="100 Gbps">100 Gbps</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* VLAN */}
        <div className="space-y-2">
          <Label htmlFor="edge-vlan">VLAN</Label>
          <Input
            id="edge-vlan"
            value={selectedEdge.data?.vlan || ""}
            onChange={(e) =>
              onUpdateEdgeData(selectedEdge.id, { vlan: e.target.value })
            }
            placeholder="10"
          />
        </div>

        {/* Color */}
        <ColorPicker
          label="Connection Color"
          value={selectedEdge.style?.stroke || "#3b82f6"}
          onChange={(color) => {
            const currentMarkerEnd =
              typeof selectedEdge.markerEnd === "object"
                ? selectedEdge.markerEnd
                : {};
            onUpdateEdgeData(selectedEdge.id, {
              style: {
                ...selectedEdge.style,
                stroke: color,
                strokeWidth: 2.5,
              },
              markerEnd: {
                ...currentMarkerEnd,
                color: color,
              },
              labelStyle: {
                ...selectedEdge.labelStyle,
                fill: color,
              },
            });
          }}
        />

        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="edge-label">Label</Label>
          <Input
            id="edge-label"
            value={selectedEdge.data?.label || selectedEdge.label || ""}
            onChange={(e) =>
              onUpdateEdgeData(selectedEdge.id, { label: e.target.value })
            }
            placeholder="Connection label"
          />
        </div>

        <Separator />

        {/* Connection Info */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">Source</Label>
          <p className="text-sm font-mono">{selectedEdge.source}</p>
          <Label className="text-muted-foreground text-xs">Target</Label>
          <p className="text-sm font-mono">{selectedEdge.target}</p>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="edge-notes">Notes</Label>
          <Textarea
            id="edge-notes"
            value={selectedEdge.data?.notes || ""}
            onChange={(e) =>
              onUpdateEdgeData(selectedEdge.id, { notes: e.target.value })
            }
            placeholder="Additional notes"
          />
        </div>

        {/* Delete Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onDeleteEdge(selectedEdge.id)}
        >
          Delete Connection
        </Button>
      </div>
    </div>
  );
}
