import { DragEvent } from "react";
import type { DeviceType } from "@/components/network-topology-chart";

export interface DevicePaletteItemProps {
  type: DeviceType;
  label: string;
  icon: React.ReactNode;
}

export function DevicePaletteItem({
  type,
  label,
  icon,
}: DevicePaletteItemProps) {
  const onDragStart = (event: DragEvent, deviceType: DeviceType) => {
    event.dataTransfer.setData("application/reactflow", deviceType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      className="flex items-center gap-3 p-3 bg-card border rounded-lg cursor-move hover:border-primary hover:bg-accent transition-colors"
    >
      <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
