"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
// @ts-ignore
import "reactflow/dist/style.css";
// @ts-ignore
import "@/styles/reactflow-theme.css";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Server,
  Wifi,
  Camera,
  Router as RouterIcon,
  HardDrive,
  Cloud,
  Network,
  Shield,
} from "lucide-react";

// Device type definition
type DeviceType =
  | "router"
  | "switch"
  | "server"
  | "ap"
  | "camera"
  | "nas"
  | "cloud"
  | "firewall";

// Custom Node Component (read-only version)
function CustomNode({ data, selected }: { data: any; selected?: boolean }) {
  const getDeviceIcon = (type: DeviceType) => {
    const iconProps = { className: "w-6 h-6" };
    switch (type) {
      case "router":
        return <RouterIcon {...iconProps} />;
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
        "min-w-[200px] p-4 shadow-lg border-2",
        data.groupId && "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
      )}
    >
      {/* Connection handles - hidden but functional */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-left"
        className="!opacity-0"
        style={{ left: "30%" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-center"
        className="!opacity-0"
        style={{ left: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-right"
        className="!opacity-0"
        style={{ left: "70%" }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-left"
        className="!opacity-0"
        style={{ left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-center"
        className="!opacity-0"
        style={{ left: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-right"
        className="!opacity-0"
        style={{ left: "70%" }}
      />

      <Handle
        type="target"
        position={Position.Left}
        id="left-top"
        className="!opacity-0"
        style={{ top: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-center"
        className="!opacity-0"
        style={{ top: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-bottom"
        className="!opacity-0"
        style={{ top: "70%" }}
      />

      <Handle
        type="target"
        position={Position.Right}
        id="right-top"
        className="!opacity-0"
        style={{ top: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-center"
        className="!opacity-0"
        style={{ top: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-bottom"
        className="!opacity-0"
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
            <p className="text-xs text-muted-foreground">VLAN: {data.vlan}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Group Node Component (read-only version)
function GroupNode({ data }: { data: any }) {
  return (
    <div
      className="border-2 border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-950/10 rounded-lg"
      style={{
        width: "100%",
        height: "100%",
        padding: "40px 20px 20px 20px",
      }}
    >
      <div className="absolute -top-3 left-4 bg-background px-2">
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          {data.label || "Group"}
        </span>
      </div>
    </div>
  );
}

export default function SharedNetworkPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [network, setNetwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Memoize node types to prevent React Flow warning
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      custom: CustomNode,
      group: GroupNode,
    }),
    []
  );

  useEffect(() => {
    async function loadSharedNetwork() {
      try {
        const response = await fetch(`/api/v1/shared/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to load shared network");
        }
        const result = await response.json();
        // API returns { success: true, data: {...} }
        if (!result.success || !result.data) {
          throw new Error(
            result.messages?.[0] || "Failed to load shared network"
          );
        }

        // Ensure edges have proper styling
        const networkData = result.data;

        if (networkData.edges && networkData.edges.length > 0) {
          networkData.edges = networkData.edges.map((edge: any) => {
            const strokeColor = edge.style?.stroke || "#3b82f6";

            // Convert string marker type to enum
            let markerType = MarkerType.ArrowClosed;
            if (edge.markerEnd?.type === "arrow") {
              markerType = MarkerType.Arrow;
            } else if (edge.markerEnd?.type === "arrowclosed") {
              markerType = MarkerType.ArrowClosed;
            }

            return {
              ...edge,
              id: edge.id || `edge-${Math.random()}`,
              source: edge.source,
              target: edge.target,
              type: edge.type || "smoothstep",
              animated: edge.animated || false,
              style: {
                strokeWidth: edge.style?.strokeWidth || 2.5,
                stroke: strokeColor,
                ...edge.style,
              },
              markerEnd: {
                type: markerType,
                width: 20,
                height: 20,
                color: strokeColor,
              },
              label: edge.label || edge.data?.label,
              labelStyle: edge.labelStyle || {
                fontSize: 12,
                fontWeight: 600,
                fill: strokeColor,
              },
              labelBgStyle: edge.labelBgStyle || {
                fill: "hsl(var(--background))",
                fillOpacity: 0.9,
              },
            };
          });
        } else {
          console.warn("No edges found in network data");
        }

        setNetwork(networkData);
      } catch (error: any) {
        toast.error(error.message || "Failed to load shared network");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadSharedNetwork();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading shared network...
          </p>
        </div>
      </div>
    );
  }

  if (!network) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Network Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            This shared network link is invalid or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background px-6 py-3">
        <h1 className="text-xl font-bold">{network.name}</h1>
        {network.description && (
          <p className="text-sm text-muted-foreground">{network.description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Shared network (read-only)
        </p>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={network.nodes || []}
          edges={network.edges || []}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: false,
            style: { strokeWidth: 2.5, stroke: "#3b82f6" },
          }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls showInteractive={false} />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
