import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Server,
  Wifi,
  Camera,
  Router,
  HardDrive,
  Cloud,
  Network,
  Shield,
} from "lucide-react";
import type { DeviceType } from "@/components/network-topology-chart";

interface CustomNodeProps {
  data: any;
  selected?: boolean;
}

export function CustomNode({ data, selected }: CustomNodeProps) {
  const getDeviceIcon = (type: DeviceType) => {
    const iconProps = { className: "w-6 h-6" };
    switch (type) {
      case "router":
        return <Router {...iconProps} />;
      case "switch":
        return <Network {...iconProps} />;
      case "server":
        return <Server {...iconProps} />;
      case "ap":
        return <Wifi {...iconProps} />;
      case "camera":
        return <Camera {...iconProps} />;
      case "nas":
        return <HardDrive {...iconProps} />;
      case "cloud":
        return <Cloud {...iconProps} />;
      case "firewall":
        return <Shield {...iconProps} />;
      default:
        return <Network {...iconProps} />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card
      className={cn(
        "min-w-[200px] p-4 shadow-lg border-2 transition-all group",
        selected &&
          "border-primary ring-2 ring-primary ring-offset-2 bg-primary/5",
        data.groupId &&
          !selected &&
          "border-amber-500 bg-amber-50 dark:bg-amber-950/20",
        !selected && !data.groupId && "hover:border-primary"
      )}
    >
      {/* Handles for connections - visible on hover */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-left"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: "30%" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-center"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-right"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: "70%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-left"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-center"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-right"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: "70%" }}
      />
      {/* Left side handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-top"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-center"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-bottom"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: "70%" }}
      />
      {/* Right side handles */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-top"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-center"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-bottom"
        className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ top: "70%" }}
      />
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
          {getDeviceIcon(data.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{data.label}</h3>
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                getStatusColor(data.status)
              )}
            />
          </div>
          {data.ip && (
            <p className="text-xs text-muted-foreground font-mono">{data.ip}</p>
          )}
          {data.location && (
            <p className="text-xs text-muted-foreground">{data.location}</p>
          )}
          {data.vlan && (
            <Badge variant="secondary" className="text-xs mt-1">
              VLAN {data.vlan}
            </Badge>
          )}
          {data.groupId && (
            <Badge
              variant="outline"
              className="text-xs mt-1 border-amber-500 text-amber-700 dark:text-amber-400"
            >
              Grouped
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
