"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  MarkerType,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
} from "reactflow";
// @ts-ignore
import "reactflow/dist/style.css";
// @ts-ignore
import "@/styles/reactflow-theme.css";
import {
  Server,
  Wifi,
  Camera,
  Monitor,
  Network,
  Router,
  HardDrive,
  Database,
  Cloud,
  Smartphone,
  Cable,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Device Types
export type DeviceType =
  | "router"
  | "switch"
  | "server"
  | "ap"
  | "camera"
  | "client"
  | "nas"
  | "cloud"
  | "mobile"
  | "firewall";

export interface NetworkDevice {
  id: string;
  type: DeviceType;
  label: string;
  ip?: string;
  location?: string;
  status?: "online" | "offline" | "warning";
  vlan?: string;
  position?: { x: number; y: number };
  metadata?: Record<string, string>;
}

export interface NetworkConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
  bandwidth?: string;
  type?: "ethernet" | "fiber" | "wireless" | "wan";
  vlan?: string;
}

export interface NetworkTopologyData {
  devices: NetworkDevice[];
  connections: NetworkConnection[];
  title?: string;
  description?: string;
}

// Custom Node Component
interface CustomNodeProps {
  data: {
    label: string;
    type: DeviceType;
    ip?: string;
    location?: string;
    status?: "online" | "offline" | "warning";
    vlan?: string;
    metadata?: Record<string, string>;
    onNodeClick?: (id: string) => void;
  };
  id: string;
}

const deviceConfig: Record<
  DeviceType,
  { icon: typeof Server; color: string; bgColor: string; hexColor: string }
> = {
  router: {
    icon: Router,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    hexColor: "#3b82f6",
  },
  switch: {
    icon: Network,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    hexColor: "#a855f7",
  },
  server: {
    icon: Server,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    hexColor: "#22c55e",
  },
  ap: {
    icon: Wifi,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    hexColor: "#06b6d4",
  },
  camera: {
    icon: Camera,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    hexColor: "#f97316",
  },
  client: {
    icon: Monitor,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    hexColor: "#6b7280",
  },
  nas: {
    icon: HardDrive,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    hexColor: "#eab308",
  },
  cloud: {
    icon: Cloud,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    hexColor: "#0ea5e9",
  },
  mobile: {
    icon: Smartphone,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    hexColor: "#ec4899",
  },
  firewall: {
    icon: Cable,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    hexColor: "#ef4444",
  },
};

function CustomNode({ data, id }: CustomNodeProps) {
  const config = deviceConfig[data.type];
  const Icon = config.icon;

  const statusColors = {
    online: "border-green-500 shadow-green-200",
    offline: "border-red-500 shadow-red-200",
    warning: "border-yellow-500 shadow-yellow-200",
  };

  return (
    <>
      {/* Connection handles for edges - multiple handles for parallel connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-left"
        className="!opacity-0"
        style={{ background: "transparent", border: "none", left: "30%" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-center"
        className="!opacity-0"
        style={{ background: "transparent", border: "none", left: "50%" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-right"
        className="!opacity-0"
        style={{ background: "transparent", border: "none", left: "70%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-left"
        className="!opacity-0"
        style={{ background: "transparent", border: "none", left: "30%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-center"
        className="!opacity-0"
        style={{ background: "transparent", border: "none", left: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-right"
        className="!opacity-0"
        style={{ background: "transparent", border: "none", left: "70%" }}
      />
      <Card
        className={cn(
          "min-w-[160px] cursor-pointer transition-all hover:shadow-lg",
          data.status && statusColors[data.status],
          "border-2"
        )}
        onClick={() => data.onNodeClick?.(id)}
      >
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <Icon className={cn("w-5 h-5", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{data.label}</div>
              {data.ip && (
                <div className="text-xs text-muted-foreground font-mono">
                  {data.ip}
                </div>
              )}
            </div>
            {data.status && (
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  data.status === "online" && "bg-green-500 animate-pulse",
                  data.status === "offline" && "bg-red-500",
                  data.status === "warning" && "bg-yellow-500 animate-pulse"
                )}
              />
            )}
          </div>

          {(data.location || data.vlan) && (
            <div className="flex gap-1 flex-wrap">
              {data.location && (
                <Badge variant="outline" className="text-xs">
                  {data.location}
                </Badge>
              )}
              {data.vlan && (
                <Badge variant="secondary" className="text-xs">
                  VLAN {data.vlan}
                </Badge>
              )}
            </div>
          )}

          {data.metadata && Object.keys(data.metadata).length > 0 && (
            <div className="text-xs text-muted-foreground space-y-0.5 pt-1 border-t">
              {Object.entries(data.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2">
                  <span className="font-medium">{key}:</span>
                  <span className="truncate">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

// Memoize nodeTypes outside component to prevent recreation on each render
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Props for the main component
interface NetworkTopologyChartProps {
  data: NetworkTopologyData;
  className?: string;
  onNodeClick?: (device: NetworkDevice) => void;
  onConnectionClick?: (connection: NetworkConnection) => void;
  autoLayout?: boolean;
  height?: string;
}

export function NetworkTopologyChart({
  data,
  className,
  onNodeClick,
  onConnectionClick,
  autoLayout = true,
  height = "600px",
}: NetworkTopologyChartProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [layoutType, setLayoutType] = useState<
    "auto" | "hierarchical" | "radial"
  >("hierarchical");

  // Auto-layout calculation
  const calculateLayout = useCallback(
    (
      devices: NetworkDevice[],
      connections: NetworkConnection[],
      type: "auto" | "hierarchical" | "radial"
    ) => {
      if (type === "hierarchical") {
        // Hierarchical layout - organize by network topology
        // Build adjacency map
        const adjacencyMap = new Map<string, Set<string>>();
        const reverseMap = new Map<string, Set<string>>();

        connections.forEach((conn) => {
          if (!adjacencyMap.has(conn.source))
            adjacencyMap.set(conn.source, new Set());
          if (!reverseMap.has(conn.target))
            reverseMap.set(conn.target, new Set());
          adjacencyMap.get(conn.source)!.add(conn.target);
          reverseMap.get(conn.target)!.add(conn.source);
        });

        // Find root nodes (nodes with no incoming connections or cloud/firewall types)
        const rootNodes = devices.filter(
          (d) =>
            !reverseMap.has(d.id) || d.type === "cloud" || d.type === "firewall"
        );

        // BFS to assign layers
        const layers: Map<number, NetworkDevice[]> = new Map();
        const visited = new Set<string>();
        const deviceLayers = new Map<string, number>();

        const queue: Array<{ device: NetworkDevice; layer: number }> = [];
        rootNodes.forEach((device) => {
          queue.push({ device, layer: 0 });
          visited.add(device.id);
        });

        while (queue.length > 0) {
          const { device, layer } = queue.shift()!;

          if (!layers.has(layer)) layers.set(layer, []);
          layers.get(layer)!.push(device);
          deviceLayers.set(device.id, layer);

          // Add children to next layer
          const children = adjacencyMap.get(device.id);
          if (children) {
            children.forEach((childId) => {
              if (!visited.has(childId)) {
                const childDevice = devices.find((d) => d.id === childId);
                if (childDevice) {
                  queue.push({ device: childDevice, layer: layer + 1 });
                  visited.add(childId);
                }
              }
            });
          }
        }

        // Position unconnected devices at the end
        devices.forEach((device) => {
          if (!visited.has(device.id)) {
            const maxLayer = Math.max(...Array.from(layers.keys()), 0) + 1;
            if (!layers.has(maxLayer)) layers.set(maxLayer, []);
            layers.get(maxLayer)!.push(device);
          }
        });

        // Calculate positions
        const positioned: NetworkDevice[] = [];
        let y = 100;
        const sortedLayers = Array.from(layers.keys()).sort((a, b) => a - b);

        sortedLayers.forEach((layerNum) => {
          const layerDevices = layers.get(layerNum)!;
          const deviceCount = layerDevices.length;
          const spacing = 350;
          const startX = ((deviceCount - 1) * spacing) / -2 + 500;

          layerDevices.forEach((device, idx) => {
            positioned.push({
              ...device,
              position: { x: startX + idx * spacing, y },
            });
          });

          y += 250;
        });

        return positioned;
      }

      if (type === "radial") {
        // Radial layout - circle arrangement
        const centerX = 500;
        const centerY = 400;
        const radius = 250;

        return devices.map((device, idx) => {
          const angle = (idx / devices.length) * 2 * Math.PI;
          return {
            ...device,
            position: {
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle),
            },
          };
        });
      }

      // Auto layout - smart positioning
      return devices.map((device, idx) => ({
        ...device,
        position: device.position || {
          x: 200 + (idx % 4) * 350,
          y: 100 + Math.floor(idx / 4) * 250,
        },
      }));
    },
    []
  );

  // Convert devices to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    const devicesWithLayout = autoLayout
      ? calculateLayout(data.devices, data.connections, layoutType)
      : data.devices;

    return devicesWithLayout.map((device) => ({
      id: device.id,
      type: "custom",
      position: device.position || { x: 0, y: 0 },
      data: {
        label: device.label,
        type: device.type,
        ip: device.ip,
        location: device.location,
        status: device.status,
        vlan: device.vlan,
        metadata: device.metadata,
        onNodeClick: (id: string) => {
          setSelectedNode(id);
          const clickedDevice = data.devices.find((d) => d.id === id);
          if (clickedDevice && onNodeClick) {
            onNodeClick(clickedDevice);
          }
        },
      },
    }));
  }, [
    data.devices,
    data.connections,
    autoLayout,
    layoutType,
    calculateLayout,
    onNodeClick,
  ]);

  // Convert connections to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    const connectionTypeStyles = {
      ethernet: {
        stroke: "#3b82f6",
        strokeWidth: 2.5,
      },
      fiber: {
        stroke: "#ef4444",
        strokeWidth: 3.5,
      },
      wireless: {
        stroke: "#06b6d4",
        strokeWidth: 2.5,
        strokeDasharray: "5,5",
      },
      wan: {
        stroke: "#8b5cf6",
        strokeWidth: 2.5,
      },
    };

    // Group connections by source node and bandwidth to assign unique handles
    const sourceGroups = new Map<string, Map<string, NetworkConnection[]>>();
    data.connections.forEach((conn) => {
      if (!sourceGroups.has(conn.source)) {
        sourceGroups.set(conn.source, new Map());
      }
      const bandwidth = conn.bandwidth || "unknown";
      const bandwidthMap = sourceGroups.get(conn.source)!;
      if (!bandwidthMap.has(bandwidth)) {
        bandwidthMap.set(bandwidth, []);
      }
      bandwidthMap.get(bandwidth)!.push(conn);
    });

    // Similarly for target nodes
    const targetGroups = new Map<string, Map<string, NetworkConnection[]>>();
    data.connections.forEach((conn) => {
      if (!targetGroups.has(conn.target)) {
        targetGroups.set(conn.target, new Map());
      }
      const bandwidth = conn.bandwidth || "unknown";
      const bandwidthMap = targetGroups.get(conn.target)!;
      if (!bandwidthMap.has(bandwidth)) {
        bandwidthMap.set(bandwidth, []);
      }
      bandwidthMap.get(bandwidth)!.push(conn);
    });

    const handlePositions = ["left", "center", "right"];

    return data.connections.map((conn, index) => {
      const connType = conn.type || "ethernet";
      const style = connectionTypeStyles[connType];
      const bandwidth = conn.bandwidth || "unknown";

      // Determine which handle to use based on bandwidth grouping
      const sourceBandwidthMap = sourceGroups.get(conn.source)!;
      const sourceBandwidths = Array.from(sourceBandwidthMap.keys()).sort();
      const sourceBandwidthIndex = sourceBandwidths.indexOf(bandwidth);
      const sourceHandlePos = handlePositions[sourceBandwidthIndex % 3];

      const targetBandwidthMap = targetGroups.get(conn.target)!;
      const targetBandwidths = Array.from(targetBandwidthMap.keys()).sort();
      const targetBandwidthIndex = targetBandwidths.indexOf(bandwidth);
      const targetHandlePos = handlePositions[targetBandwidthIndex % 3];

      return {
        id: conn.id,
        source: conn.source,
        target: conn.target,
        sourceHandle: `bottom-${sourceHandlePos}`,
        targetHandle: `top-${targetHandlePos}`,
        label: conn.label || conn.bandwidth,
        type: "smoothstep",
        animated: connType === "wireless",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: style.stroke,
        },
        style: {
          ...style,
          strokeOpacity: 0.8,
        },
        labelStyle: {
          fontSize: 12,
          fontWeight: 600,
          fill: style.stroke,
        },
        labelBgStyle: {
          fill: "hsl(var(--background))",
          fillOpacity: 1,
          rx: 6,
          ry: 6,
        },
        labelBgPadding: [6, 10] as [number, number],
        labelShowBg: true,
      };
    });
  }, [data.connections]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when data or layout changes
  useEffect(() => {
    setNodes(initialNodes);
    console.log("Nodes updated:", initialNodes.length);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
    console.log(
      "Edges updated:",
      initialEdges.length,
      "First edge:",
      initialEdges[0]
    );
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Stats calculation
  const stats = useMemo(() => {
    const deviceCount = data.devices.length;
    const onlineCount = data.devices.filter(
      (d) => d.status === "online"
    ).length;
    const connectionCount = data.connections.length;
    const vlanCount = new Set(data.devices.map((d) => d.vlan).filter(Boolean))
      .size;

    return { deviceCount, onlineCount, connectionCount, vlanCount };
  }, [data.devices, data.connections]);

  return (
    <div
      className={cn(
        "relative border rounded-lg overflow-hidden bg-background",
        className
      )}
    >
      {/* Header */}
      {(data.title || data.description) && (
        <div className="p-4 border-b bg-muted/30">
          {data.title && (
            <h3 className="font-semibold text-lg">{data.title}</h3>
          )}
          {data.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {data.description}
            </p>
          )}
        </div>
      )}

      {/* React Flow Canvas */}
      <div style={{ height }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
          elementsSelectable={true}
          className="dark:bg-gray-950"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            className="dark:opacity-20"
          />
          <Controls
            showInteractive={false}
            className="dark:bg-gray-900 dark:border-gray-700 dark:fill-gray-100"
          />
          <MiniMap
            nodeColor={(node) => {
              const deviceType = node.data.type as DeviceType;
              return deviceConfig[deviceType]?.hexColor || "#6b7280";
            }}
            maskColor="rgb(0, 0, 0, 0.1)"
            className="dark:bg-gray-900 dark:border-gray-700"
            zoomable
            pannable
          />

          {/* Stats and Legend Panel */}
          <Panel
            position="top-left"
            className="bg-background/95 backdrop-blur-sm rounded-lg border p-3 shadow-lg pointer-events-auto"
            style={{ zIndex: 5 }}
          >
            <div className="flex gap-6">
              {/* Network Overview */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Network Overview
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Devices</div>
                    <div className="font-bold text-lg">{stats.deviceCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Online</div>
                    <div className="font-bold text-lg text-green-600 dark:text-green-400">
                      {stats.onlineCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Connections</div>
                    <div className="font-bold text-lg">
                      {stats.connectionCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">VLANs</div>
                    <div className="font-bold text-lg">{stats.vlanCount}</div>
                  </div>
                </div>
              </div>

              {/* Connection Types Legend */}
              <div className="space-y-2 border-l pl-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Connection Types
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-blue-500" />
                    <span>Ethernet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-0.5 bg-red-500"
                      style={{ height: "3px" }}
                    />
                    <span>Fiber</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 border-t-2 border-dashed border-cyan-500" />
                    <span>Wireless</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-purple-500" />
                    <span>WAN</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Layout Controls */}
          <Panel
            position="top-right"
            className="bg-background/95 backdrop-blur-sm rounded-lg border p-2 shadow-lg pointer-events-auto"
            style={{ zIndex: 5 }}
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Layout
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={layoutType === "auto" ? "default" : "outline"}
                onClick={() => {
                  setLayoutType("auto");
                  const newDevices = calculateLayout(
                    data.devices,
                    data.connections,
                    "auto"
                  );
                  setNodes((nds) =>
                    nds.map((node, idx) => ({
                      ...node,
                      position: newDevices[idx].position!,
                    }))
                  );
                }}
                className="text-xs"
              >
                Auto
              </Button>
              <Button
                size="sm"
                variant={layoutType === "hierarchical" ? "default" : "outline"}
                onClick={() => {
                  setLayoutType("hierarchical");
                  const newDevices = calculateLayout(
                    data.devices,
                    data.connections,
                    "hierarchical"
                  );
                  setNodes((nds) =>
                    nds.map((node) => {
                      const device = newDevices.find((d) => d.id === node.id);
                      return device
                        ? { ...node, position: device.position! }
                        : node;
                    })
                  );
                }}
                className="text-xs"
              >
                Hierarchy
              </Button>
              <Button
                size="sm"
                variant={layoutType === "radial" ? "default" : "outline"}
                onClick={() => {
                  setLayoutType("radial");
                  const newDevices = calculateLayout(
                    data.devices,
                    data.connections,
                    "radial"
                  );
                  setNodes((nds) =>
                    nds.map((node) => {
                      const device = newDevices.find((d) => d.id === node.id);
                      return device
                        ? { ...node, position: device.position! }
                        : node;
                    })
                  );
                }}
                className="text-xs"
              >
                Radial
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
