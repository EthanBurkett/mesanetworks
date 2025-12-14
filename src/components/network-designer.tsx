"use client";

import { useCallback, useState, useRef, DragEvent, useEffect } from "react";
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
  OnConnect,
  ReactFlowInstance,
  getNodesBounds,
  getViewportForBounds,
} from "reactflow";
import dagre from "dagre";
// @ts-ignore
import "reactflow/dist/style.css";
// @ts-ignore
import "@/styles/reactflow-theme.css";
import {
  Save,
  Download,
  Upload,
  Trash2,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Image,
  FileImage,
  Share2,
  Database,
  Layers,
  Network,
  CheckCircle2,
  Library,
  Palette,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  useNetworks,
  useCreateNetwork,
  useUpdateNetwork,
  useDeleteNetwork,
  useShareNetwork,
} from "@/hooks";
import { useAuth } from "@/contexts";
import {
  CustomNode,
  GroupNode,
  DevicePaletteSidebar,
  NodePropertiesPanel,
  EdgePropertiesPanel,
  NodeContextMenu,
  EdgeContextMenu,
  SaveNetworkDialog,
  LoadNetworkDialog,
  ShareNetworkDialog,
  ColorPicker,
  ValidationPanel,
  DeviceTemplatesDialog,
  VisualSettingsPanel,
  ConnectionLegend,
} from "./network-designer/";
import type { VisualSettings } from "./network-designer/";
import { NETWORK_TEMPLATES } from "./network-designer/constants";
import { validateNetwork, ValidationResult } from "@/lib/network-validator";
import { DeviceTemplate } from "@/lib/device-templates";
import { Label } from "./ui/label";
import { defaultVisualSettings } from "./network-designer/VisualSettingsPanel";

type DeviceType =
  | "router"
  | "switch"
  | "firewall"
  | "server"
  | "nas"
  | "ap"
  | "camera"
  | "cloud"
  | "client";

const nodeTypes: NodeTypes = { custom: CustomNode, group: GroupNode };

export function NetworkDesigner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [edgeIdCounter, setEdgeIdCounter] = useState(1);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // UI state
  const [gridSnap, setGridSnap] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [defaultEdgeColor, setDefaultEdgeColor] = useState("#3b82f6");
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<
    "LR" | "TB" | "force" | "radial"
  >("TB");
  const [contextMenuNode, setContextMenuNode] = useState<Node | null>(null);
  const [contextMenuEdge, setContextMenuEdge] = useState<Edge | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [nodeGroups, setNodeGroups] = useState<Map<string, string[]>>(
    new Map()
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [networkName, setNetworkName] = useState("");
  const [networkDescription, setNetworkDescription] = useState("");
  const [currentNetworkId, setCurrentNetworkId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [validationPanelOpen, setValidationPanelOpen] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [deviceTemplatesDialogOpen, setDeviceTemplatesDialogOpen] =
    useState(false);
  const [visualSettingsPanelOpen, setVisualSettingsPanelOpen] = useState(false);
  const [visualSettings, setVisualSettings] = useState<VisualSettings>(
    defaultVisualSettings
  );

  // Undo/Redo state
  const [history, setHistory] = useState<
    Array<{ nodes: Node[]; edges: Edge[] }>
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoingRef = useRef(false);
  const lastSavedStateRef = useRef<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("network-designer-data");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
        if (data.nodeIdCounter) setNodeIdCounter(data.nodeIdCounter);
        if (data.edgeIdCounter) setEdgeIdCounter(data.edgeIdCounter);
      } catch (e) {
        console.error("Failed to load saved network:", e);
      }
    }
  }, [setNodes, setEdges]);

  // Save to history for undo/redo - debounced to prevent infinite loops
  useEffect(() => {
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
      return;
    }

    const currentState = JSON.stringify({ nodes, edges });

    // Only save if state actually changed
    if (currentState === lastSavedStateRef.current) {
      return;
    }

    lastSavedStateRef.current = currentState;

    const timeoutId = setTimeout(() => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({ nodes, edges });

        // Keep only last 50 states
        return newHistory.slice(-50);
      });

      setHistoryIndex((prev) => {
        const newHistory = history.slice(0, prev + 1);
        return Math.min(newHistory.length, 49);
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges]);

  // Auto-save to localStorage when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const data = {
        nodes,
        edges,
        nodeIdCounter,
        edgeIdCounter,
      };
      localStorage.setItem("network-designer-data", JSON.stringify(data));
    }
  }, [nodes, edges, nodeIdCounter, edgeIdCounter]);

  // Update edge animations when visual settings change
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: visualSettings.connectionAnimation,
        style: {
          ...edge.style,
          strokeDasharray:
            visualSettings.connectionAnimation &&
            visualSettings.animationType === "dash"
              ? "5,5"
              : undefined,
          animationDuration: visualSettings.connectionAnimation
            ? `${2 / visualSettings.animationSpeed}s`
            : undefined,
        },
      }))
    );
  }, [
    visualSettings.connectionAnimation,
    visualSettings.animationType,
    visualSettings.animationSpeed,
    setEdges,
  ]);

  // Apply custom node colors when color scheme changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === "custom" && node.data.type) {
          const deviceType = node.data
            .type as keyof typeof visualSettings.customNodeColors;
          const color =
            visualSettings.customNodeColors[deviceType] ||
            visualSettings.customNodeColors.client;
          return {
            ...node,
            style: {
              ...node.style,
              borderColor: color,
            },
          };
        }
        return node;
      })
    );
  }, [
    visualSettings.customNodeColors,
    visualSettings.nodeColorScheme,
    setNodes,
  ]);

  // Update selected node when selection changes
  useEffect(() => {
    const selected = nodes.find((node) => node.selected);
    setSelectedNode(selected || null);
  }, [nodes]);

  // Update selected edge when selection changes
  useEffect(() => {
    const selected = edges.find((edge) => edge.selected);
    setSelectedEdge(selected || null);
  }, [edges]);

  // Apply layout algorithm
  const applyLayout = useCallback(
    (algorithm: "LR" | "TB" | "force" | "radial") => {
      if (algorithm === "LR" || algorithm === "TB") {
        // Dagre layout (hierarchical)
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir: algorithm });

        nodes.forEach((node) => {
          dagreGraph.setNode(node.id, { width: 200, height: 80 });
        });

        edges.forEach((edge) => {
          dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const layoutedNodes = nodes.map((node) => {
          const nodeWithPosition = dagreGraph.node(node.id);
          return {
            ...node,
            position: {
              x: nodeWithPosition.x - 100,
              y: nodeWithPosition.y - 40,
            },
          };
        });

        setNodes(layoutedNodes);
      } else if (algorithm === "force") {
        // Simple force-directed layout
        const centerX = 400;
        const centerY = 300;
        const radius = 250;
        const angleStep = (2 * Math.PI) / nodes.length;

        const layoutedNodes = nodes.map((node, index) => {
          const angle = index * angleStep;
          return {
            ...node,
            position: {
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle),
            },
          };
        });

        setNodes(layoutedNodes);
      } else if (algorithm === "radial") {
        // Radial layout
        const centerX = 400;
        const centerY = 300;
        const innerRadius = 150;
        const outerRadius = 300;

        // Find root nodes (nodes with no incoming edges)
        const incomingEdges = new Map<string, number>();
        edges.forEach((edge) => {
          incomingEdges.set(
            edge.target,
            (incomingEdges.get(edge.target) || 0) + 1
          );
        });

        const rootNodes = nodes.filter(
          (node) =>
            !incomingEdges.has(node.id) || incomingEdges.get(node.id) === 0
        );
        const leafNodes = nodes.filter((node) => incomingEdges.has(node.id));

        const layoutedNodes = nodes.map((node, index) => {
          const isRoot = rootNodes.includes(node);
          const radius = isRoot ? innerRadius : outerRadius;
          const nodesInLevel = isRoot ? rootNodes.length : leafNodes.length;
          const indexInLevel = isRoot
            ? rootNodes.indexOf(node)
            : leafNodes.indexOf(node);
          const angleStep = (2 * Math.PI) / nodesInLevel;
          const angle = indexInLevel * angleStep;

          return {
            ...node,
            position: {
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle),
            },
          };
        });

        setNodes(layoutedNodes);
      }

      setLayoutAlgorithm(algorithm);
    },
    [nodes, edges, setNodes]
  );

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn({ duration: 200 });
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut({ duration: 200 });
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.2, duration: 200 });
  }, [reactFlowInstance]);

  // Grid snap toggle
  const toggleGridSnap = useCallback(() => {
    setGridSnap((prev) => !prev);
  }, []);

  // Keyboard shortcuts
  const handleSelectAll = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: true,
      }))
    );
  }, [setNodes]);

  const handleDuplicate = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    const newNodes = selectedNodes.map((node) => ({
      ...node,
      id: `device-${nodeIdCounter + nodes.indexOf(node)}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: false,
    }));

    setNodes((nds) => [
      ...nds.map((n) => ({ ...n, selected: false })),
      ...newNodes,
    ]);
    setNodeIdCounter((prev) => prev + selectedNodes.length);
  }, [nodes, nodeIdCounter, setNodes]);

  // Update group name
  const updateGroupName = useCallback(
    (groupId: string, newName: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === groupId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: newName,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Group selected nodes
  const groupSelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length < 2) {
      alert("Please select at least 2 nodes to group");
      return;
    }

    const groupId = `group-${Date.now()}`;
    const nodeIds = selectedNodes.map((n) => n.id);

    // Calculate bounds of selected nodes
    const minX = Math.min(...selectedNodes.map((n) => n.position.x));
    const minY = Math.min(...selectedNodes.map((n) => n.position.y));
    const maxX = Math.max(
      ...selectedNodes.map((n) => n.position.x + (n.width || 200))
    );
    const maxY = Math.max(
      ...selectedNodes.map((n) => n.position.y + (n.height || 150))
    );

    // Create parent group node
    const groupNode = {
      id: groupId,
      type: "group",
      position: { x: minX - 40, y: minY - 60 },
      data: {
        label: "New Group",
        onNameChange: (newName: string) => updateGroupName(groupId, newName),
      },
      style: {
        width: maxX - minX + 120,
        height: maxY - minY + 100,
      },
    };

    // Update node groups
    setNodeGroups((prev) => {
      const newGroups = new Map(prev);
      newGroups.set(groupId, nodeIds);
      return newGroups;
    });

    // Add parent node first, then update children
    setNodes((nds) => [
      groupNode,
      ...nds.map((node) => {
        if (nodeIds.includes(node.id)) {
          return {
            ...node,
            position: {
              x: node.position.x - minX + 40,
              y: node.position.y - minY + 60,
            },
            parentNode: groupId,
            extent: "parent" as const,
            data: {
              ...node.data,
              groupId,
            },
          };
        }
        return node;
      }),
    ]);
  }, [nodes, setNodes, updateGroupName]);

  // Ungroup nodes
  const ungroupNodes = useCallback(
    (groupId: string) => {
      // Get the group node to restore positions
      const groupNode = nodes.find((n) => n.id === groupId);
      if (!groupNode) return;

      setNodeGroups((prev) => {
        const newGroups = new Map(prev);
        newGroups.delete(groupId);
        return newGroups;
      });

      setNodes((nds) =>
        nds
          .filter((n) => n.id !== groupId) // Remove parent group node
          .map((node) => {
            if (node.parentNode === groupId) {
              // Restore child nodes to absolute positions
              const { groupId: _, ...restData } = node.data;
              return {
                ...node,
                position: {
                  x: groupNode.position.x + node.position.x,
                  y: groupNode.position.y + node.position.y,
                },
                parentNode: undefined,
                extent: undefined,
                data: restData,
              };
            }
            return node;
          })
      );
    },
    [nodes, setNodes]
  );

  // Delete node via context menu
  const deleteNodeById = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  // Delete edge via context menu
  const deleteEdgeById = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  // Duplicate node via context menu
  const duplicateNodeById = useCallback(
    (nodeId: string) => {
      const nodeToDuplicate = nodes.find((n) => n.id === nodeId);
      if (!nodeToDuplicate) return;

      const newNode = {
        ...nodeToDuplicate,
        id: `device-${nodeIdCounter}`,
        position: {
          x: nodeToDuplicate.position.x + 50,
          y: nodeToDuplicate.position.y + 50,
        },
        selected: false,
      };

      setNodes((nds) => [...nds, newNode]);
      setNodeIdCounter((prev) => prev + 1);
    },
    [nodes, nodeIdCounter, setNodes]
  );

  // Handle node context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenuNode(node);
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
    },
    []
  );

  // Handle edge context menu
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenuEdge(edge);
      setSelectedEdge(edge);
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
    },
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `connection-${edgeIdCounter}`,
        type: "smoothstep",
        animated: false,
        data: {
          bandwidth: "1 Gbps",
          connectionType: "ethernet",
          vlan: "",
          label: "1 Gbps",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: defaultEdgeColor,
        },
        style: {
          stroke: defaultEdgeColor,
          strokeWidth: 2.5,
        },
        label: "1 Gbps",
        labelStyle: {
          fontSize: 12,
          fontWeight: 600,
          fill: defaultEdgeColor,
        },
        labelBgStyle: {
          fill: "hsl(var(--background))",
          fillOpacity: 1,
        },
        // Make edges easier to select with wider interaction area
        interactionWidth: 20,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setEdgeIdCounter((id) => id + 1);
    },
    [setEdges, edgeIdCounter, defaultEdgeColor]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as DeviceType;

      if (
        typeof type === "undefined" ||
        !type ||
        !reactFlowWrapper.current ||
        !reactFlowInstance
      ) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `device-${nodeIdCounter}`,
        type: "custom",
        position,
        data: {
          label: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } ${nodeIdCounter}`,
          type,
          status: "online",
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeIdCounter((id) => id + 1);
    },
    [reactFlowInstance, nodeIdCounter, setNodes]
  );

  // Handle device template selection
  const handleTemplateSelection = useCallback(
    (template: DeviceTemplate) => {
      if (!reactFlowInstance) {
        toast.error("Canvas not ready");
        return;
      }

      // Get the center of the viewport
      const { x, y, zoom } = reactFlowInstance.getViewport();
      const centerX = -x / zoom + window.innerWidth / (2 * zoom);
      const centerY = -y / zoom + window.innerHeight / (2 * zoom);

      const newNode: Node = {
        id: `device-${nodeIdCounter}`,
        type: "custom",
        position: { x: centerX - 100, y: centerY - 75 },
        data: {
          label: template.name,
          type: template.category,
          status: "online",
          ip: "",
          location: "",
          vlan: template.defaultVLAN?.toString() || "",
          portCount: template.portCount,
          bandwidth: template.bandwidth,
          powerConsumption: template.powerConsumption,
          rackUnits: template.rackUnits,
          metadata: {
            vendor: template.vendor,
            ...template.metadata,
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeIdCounter((id) => id + 1);
      toast.success(`Added ${template.name} to canvas`);
    },
    [reactFlowInstance, nodeIdCounter, setNodes]
  );

  // Delete selected nodes and edges
  const onDeleteKey = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoingRef.current = true;
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex((i) => i - 1);
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoingRef.current = true;
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex((i) => i + 1);
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Save manually
  const saveToLocalStorage = useCallback(() => {
    const data = {
      nodes,
      edges,
      nodeIdCounter,
      edgeIdCounter,
    };
    localStorage.setItem("network-designer-data", JSON.stringify(data));
    toast.success("Network design saved to local storage!");
  }, [nodes, edges, nodeIdCounter, edgeIdCounter]);

  // API hooks
  const { user } = useAuth();
  const { data: savedNetworks, refetch: refetchNetworks } = useNetworks();
  const createNetworkMutation = useCreateNetwork();
  const updateNetworkMutation = useUpdateNetwork(currentNetworkId || "");
  const deleteNetworkMutation = useDeleteNetwork();
  const shareNetworkMutation = useShareNetwork(currentNetworkId || "");

  // Open save dialog
  const openSaveDialog = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  // Handle save to database
  const handleSaveToDatabase = useCallback(async () => {
    if (!networkName.trim()) {
      toast.error("Please enter a network name");
      return;
    }

    const networkData = {
      name: networkName,
      description: networkDescription,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type || "custom",
        position: n.position,
        data: { ...n.data, onNameChange: undefined },
        selected: n.selected,
        parentNode: n.parentNode,
        extent: n.extent === "parent" ? "parent" : undefined,
        width: n.width,
        height: n.height,
        style: n.style,
      })),
      edges,
      metadata: {
        nodeIdCounter: nodeIdCounter || 1,
        edgeIdCounter: edgeIdCounter || 1,
        layoutAlgorithm,
      },
    };

    try {
      if (currentNetworkId) {
        // Update existing network
        await updateNetworkMutation.mutateAsync(networkData);
        toast.success("Network updated successfully!");
      } else {
        // Create new network
        const result = await createNetworkMutation.mutateAsync(networkData);
        setCurrentNetworkId(result._id);
        toast.success("Network saved successfully!");
      }
      setSaveDialogOpen(false);
      // Don't clear name/description so user can share immediately
      // setNetworkName("");
      // setNetworkDescription("");
    } catch (error: any) {
      toast.error(error.message || "Failed to save network");
    }
  }, [
    networkName,
    networkDescription,
    nodes,
    edges,
    nodeIdCounter,
    edgeIdCounter,
    layoutAlgorithm,
    currentNetworkId,
    createNetworkMutation,
    updateNetworkMutation,
  ]);

  // Handle load from database
  const handleLoadNetwork = useCallback(
    async (network: any) => {
      // If the network doesn't have nodes/edges, fetch the full network data
      if (!network.nodes || !network.edges) {
        try {
          const fullNetwork = await fetch(`/api/v1/networks/${network._id}`, {
            credentials: "include",
          }).then((res) => res.json());

          if (!fullNetwork.success || !fullNetwork.data) {
            toast.error("Failed to load network");
            return;
          }
          network = fullNetwork.data;
        } catch (error) {
          toast.error("Failed to load network");
          return;
        }
      }

      setNodes(
        (network.nodes || []).map((n: any) => ({
          ...n,
          data: {
            ...n.data,
            onNameChange:
              n.type === "group"
                ? (newName: string) => updateGroupName(n.id, newName)
                : undefined,
          },
        }))
      );
      setEdges(network.edges || []);
      if (network.metadata) {
        if (network.metadata.nodeIdCounter)
          setNodeIdCounter(network.metadata.nodeIdCounter);
        if (network.metadata.edgeIdCounter)
          setEdgeIdCounter(network.metadata.edgeIdCounter);
        if (network.metadata.layoutAlgorithm)
          setLayoutAlgorithm(network.metadata.layoutAlgorithm);
      }
      setCurrentNetworkId(network._id);
      setNetworkName(network.name);
      setNetworkDescription(network.description || "");
      setLoadDialogOpen(false);
      toast.success(`Loaded "${network.name}"`);
    },
    [setNodes, setEdges, updateGroupName]
  );

  // Handle delete network
  const handleDeleteNetwork = useCallback(
    async (networkId: string) => {
      if (!confirm("Are you sure you want to delete this network?")) return;

      try {
        await deleteNetworkMutation.mutateAsync(networkId);
        toast.success("Network deleted successfully!");
        refetchNetworks();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete network");
      }
    },
    [deleteNetworkMutation, refetchNetworks]
  );

  // Handle share network
  const handleShareNetwork = useCallback(async () => {
    if (!currentNetworkId) {
      toast.error("Please save the network first before sharing");
      return;
    }

    try {
      const result = await shareNetworkMutation.mutateAsync({
        isPublic: true,
      });
      setShareUrl(result.shareUrl);
      setShareDialogOpen(true);
      toast.success("Network is now public and shareable!");
    } catch (error: any) {
      toast.error(error.message || "Failed to share network");
    }
  }, [currentNetworkId, shareNetworkMutation]);

  // Handle copy share link
  const copyShareLink = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    }
  }, [shareUrl]);

  // Export to PNG
  const exportToPNG = useCallback(() => {
    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(
      nodesBounds,
      nodesBounds.width,
      nodesBounds.height,
      0.5,
      2,
      0.2
    );

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = nodesBounds.width + 100;
    const height = nodesBounds.height + 100;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const reactFlowElement = document.querySelector(
      ".react-flow"
    ) as HTMLElement;
    if (!reactFlowElement) return;

    import("html-to-image").then(({ toPng }) => {
      toPng(reactFlowElement, {
        backgroundColor: "#ffffff",
        width: width * 2,
        height: height * 2,
        style: {
          width: `${width}px`,
          height: `${height}px`,
        },
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = `${networkName || "network-design"}.png`;
          link.href = dataUrl;
          link.click();
          toast.success("Exported to PNG!");
        })
        .catch((error) => {
          console.error("Error exporting to PNG:", error);
          toast.error("Failed to export to PNG");
        });
    });
  }, [nodes, networkName]);

  // Export to SVG
  const exportToSVG = useCallback(() => {
    const reactFlowElement = document.querySelector(
      ".react-flow"
    ) as HTMLElement;
    if (!reactFlowElement) return;

    import("html-to-image").then(({ toSvg }) => {
      toSvg(reactFlowElement, {
        backgroundColor: "#ffffff",
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = `${networkName || "network-design"}.svg`;
          link.href = dataUrl;
          link.click();
          toast.success("Exported to SVG!");
        })
        .catch((error) => {
          console.error("Error exporting to SVG:", error);
          toast.error("Failed to export to SVG");
        });
    });
  }, [networkName]);

  // Handle keyboard shortcuts
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore keyboard shortcuts when user is typing in an input or textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        undo();
      }
      // Redo
      else if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "y" || (event.key === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        redo();
      }
      // Save
      else if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveToLocalStorage();
      }
      // Select All
      else if ((event.ctrlKey || event.metaKey) && event.key === "a") {
        event.preventDefault();
        handleSelectAll();
      }
      // Duplicate
      else if ((event.ctrlKey || event.metaKey) && event.key === "d") {
        event.preventDefault();
        handleDuplicate();
      }
      // Group
      else if ((event.ctrlKey || event.metaKey) && event.key === "g") {
        event.preventDefault();
        groupSelectedNodes();
      }
      // Delete
      else if (event.key === "Delete" || event.key === "Backspace") {
        onDeleteKey();
      }
    },
    [
      onDeleteKey,
      undo,
      redo,
      saveToLocalStorage,
      handleSelectAll,
      handleDuplicate,
      groupSelectedNodes,
    ]
  );

  // Add keyboard listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [onKeyDown]);

  // Update node data from properties panel
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<any>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node
        )
      );
    },
    [setNodes]
  );

  // Update edge data from properties panel
  const updateEdgeData = useCallback(
    (edgeId: string, updates: Partial<any>) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            // If style, markerEnd, or labelStyle are being directly updated, use them as-is
            if (updates.style || updates.markerEnd || updates.labelStyle) {
              return {
                ...edge,
                data: { ...edge.data, ...updates },
                ...(updates.label !== undefined && { label: updates.label }),
                ...(updates.style && { style: updates.style }),
                ...(updates.markerEnd && { markerEnd: updates.markerEnd }),
                ...(updates.labelStyle && { labelStyle: updates.labelStyle }),
              };
            }

            // Otherwise, apply connection type styling
            const connectionType =
              updates.connectionType || edge.data?.connectionType || "ethernet";
            const bandwidth =
              updates.bandwidth || edge.data?.bandwidth || "1 Gbps";

            // Connection type styling
            const connectionTypeStyles: Record<string, any> = {
              ethernet: { stroke: "#3b82f6", strokeWidth: 2.5 },
              fiber: { stroke: "#ef4444", strokeWidth: 3.5 },
              wireless: {
                stroke: "#06b6d4",
                strokeWidth: 2.5,
                strokeDasharray: "5,5",
              },
              wan: { stroke: "#8b5cf6", strokeWidth: 2.5 },
            };

            const style =
              connectionTypeStyles[connectionType] ||
              connectionTypeStyles.ethernet;
            const label = updates.label || bandwidth;

            return {
              ...edge,
              data: { ...edge.data, ...updates },
              label,
              style: { ...edge.style, ...style },
              labelStyle: {
                ...edge.labelStyle,
                fill: style.stroke,
              },
              markerEnd: {
                // @ts-ignore
                ...edge.markerEnd,
                color: style.stroke,
              },
              animated: connectionType === "wireless",
            };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  // Export network to JSON
  const exportToJSON = useCallback(() => {
    const data = {
      nodes,
      edges,
      nodeIdCounter,
      edgeIdCounter,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `network-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, nodeIdCounter, edgeIdCounter]);

  // Import network from JSON
  const importFromJSON = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) setEdges(data.edges);
          if (data.nodeIdCounter) setNodeIdCounter(data.nodeIdCounter);
          if (data.edgeIdCounter) setEdgeIdCounter(data.edgeIdCounter);
        } catch (error) {
          console.error("Failed to import network:", error);
          alert("Failed to import network. Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    },
    [setNodes, setEdges]
  );

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to clear the entire canvas? This cannot be undone."
      )
    ) {
      setNodes([]);
      setEdges([]);
      setNodeIdCounter(1);
      setEdgeIdCounter(1);
      localStorage.removeItem("network-designer-data");
    }
  }, [setNodes, setEdges]);

  // Load template network
  const loadTemplate = useCallback(
    (templateType: "home" | "small" | "medium" | "enterprise") => {
      if (nodes.length > 0 || edges.length > 0) {
        if (
          !confirm(
            "Loading a template will replace your current network. Continue?"
          )
        ) {
          return;
        }
      }

      const template = NETWORK_TEMPLATES[templateType];
      if (!template) {
        toast.error("Template not found");
        return;
      }

      setNodes(template.nodes);
      setEdges(template.edges);

      // Set ID counters based on template
      const maxNodeId = Math.max(
        ...template.nodes.map((n) => parseInt(n.id.split("-")[1] || "0")),
        0
      );
      const maxEdgeId = Math.max(
        ...template.edges.map((e) => parseInt(e.id.slice(1)) || 0),
        0
      );
      setNodeIdCounter(maxNodeId + 1);
      setEdgeIdCounter(maxEdgeId + 1);

      toast.success(`Loaded ${templateType} network template`);
    },
    [nodes.length, edges.length, setNodes, setEdges]
  );

  // Run network validation
  const runValidation = useCallback(() => {
    const result = validateNetwork(nodes, edges);
    setValidationResult(result);
    setValidationPanelOpen(true);

    // Clear any previous highlighting when validation is re-run
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: false,
        style: {
          ...node.style,
          border: undefined,
        },
      }))
    );
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        selected: false,
        style: {
          ...edge.style,
          stroke: edge.data?.connectionType
            ? getConnectionTypeColor(edge.data.connectionType)
            : edge.style?.stroke,
          strokeWidth: edge.data?.connectionType === "fiber" ? 3.5 : 2.5,
        },
      }))
    );

    if (result.isValid) {
      toast.success("Network validation passed!");
    } else {
      toast.warning(
        `Found ${result.summary.errors} errors and ${result.summary.warnings} warnings`
      );
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Helper function to get connection type color
  const getConnectionTypeColor = (connectionType: string): string => {
    const colors: Record<string, string> = {
      ethernet: "#3b82f6",
      fiber: "#ef4444",
      wireless: "#06b6d4",
      wan: "#8b5cf6",
    };
    return colors[connectionType] || "#3b82f6";
  };

  // Highlight nodes from validation
  const highlightNodes = useCallback(
    (nodeIds: string[]) => {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: nodeIds.includes(node.id),
          style: {
            ...node.style,
            border: nodeIds.includes(node.id) ? "2px solid #ef4444" : undefined,
          },
        }))
      );
    },
    [setNodes]
  );

  // Highlight edges from validation
  const highlightEdges = useCallback(
    (edgeIds: string[]) => {
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          selected: edgeIds.includes(edge.id),
          style: {
            ...edge.style,
            stroke: edgeIds.includes(edge.id)
              ? "#ef4444"
              : edge.data?.connectionType
              ? getConnectionTypeColor(edge.data.connectionType)
              : edge.style?.stroke,
            strokeWidth: edgeIds.includes(edge.id)
              ? 4
              : edge.data?.connectionType === "fiber"
              ? 3.5
              : 2.5,
          },
        }))
      );
    },
    [setEdges]
  );

  return (
    <div className="flex h-full">
      {/* Device Palette Sidebar */}
      <DevicePaletteSidebar
        searchQuery={paletteSearch}
        onSearchChange={setPaletteSearch}
      />

      {/* Canvas */}
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            style: { strokeWidth: 2.5 },
            animated: visualSettings.connectionAnimation,
            labelStyle: {
              fontSize: 12,
              fontWeight: 600,
              fill: "var(--primary)",
            },
            labelBgStyle: {
              fill: "var(--background)",
              fillOpacity: 0.95,
            },
          }}
          edgesUpdatable
          edgesFocusable
          elementsSelectable
          multiSelectionKeyCode="Control"
          selectionKeyCode="Shift"
          deleteKeyCode="Delete"
          snapToGrid={gridSnap}
          snapGrid={[15, 15]}
        >
          <Background
            variant={visualSettings.backgroundPattern}
            gap={visualSettings.backgroundGap}
            size={visualSettings.backgroundSize}
            style={{
              opacity: visualSettings.backgroundOpacity,
            }}
          />
          <Controls />
          {visualSettings.minimapEnabled && (
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
              position={visualSettings.minimapPosition}
              style={{
                transform: `scale(${visualSettings.minimapSize})`,
                transformOrigin:
                  visualSettings.minimapPosition === "top-left"
                    ? "top left"
                    : visualSettings.minimapPosition === "top-right"
                    ? "top right"
                    : visualSettings.minimapPosition === "bottom-left"
                    ? "bottom left"
                    : "bottom right",
              }}
            />
          )}

          {/* Connection Legend */}
          {visualSettings.showLegend && (
            <ConnectionLegend position={visualSettings.legendPosition} />
          )}

          {/* Toolbar Panel */}
          <Panel
            position="top-center"
            className="bg-card border rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2 p-2">
              {/* Edit Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              {/* File Operations */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Save className="w-4 h-4" />
                    File
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={openSaveDialog}>
                    <Database className="w-4 h-4 mr-2" />
                    {currentNetworkId ? "Update" : "Save"} to Database
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLoadDialogOpen(true)}>
                    <Database className="w-4 h-4 mr-2" />
                    Load from Database
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={saveToLocalStorage}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Locally (Ctrl+S)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleShareNetwork}
                    disabled={!currentNetworkId}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Network
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export/Import */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={exportToJSON}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPNG}>
                    <Image className="w-4 h-4 mr-2" />
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToSVG}>
                    <FileImage className="w-4 h-4 mr-2" />
                    Export as SVG
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <label className="flex items-center cursor-pointer relative">
                      <Upload className="w-4 h-4 mr-2" />
                      Import JSON
                      <input
                        type="file"
                        accept=".json"
                        onChange={importFromJSON}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Templates */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Layers className="w-4 h-4" />
                    Templates
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => loadTemplate("home")}>
                    Home Network
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadTemplate("small")}>
                    Small Business
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadTemplate("medium")}>
                    Medium Business
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadTemplate("enterprise")}>
                    Enterprise Grade
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Device Templates Library */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setDeviceTemplatesDialogOpen(true)}
              >
                <Library className="w-4 h-4" />
                Device Library
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Visual Settings */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setVisualSettingsPanelOpen(true)}
                title="Visual Settings"
              >
                <Palette className="w-4 h-4" />
                Visuals
              </Button>

              {/* Layout */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Network className="w-4 h-4" />
                    Layout
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => applyLayout("TB")}>
                    Top to Bottom
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyLayout("LR")}>
                    Left to Right
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyLayout("force")}>
                    Force-Directed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyLayout("radial")}>
                    Radial
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Validation */}
              <Button
                variant="outline"
                size="sm"
                onClick={runValidation}
                className="gap-2"
                title="Validate Network"
              >
                <CheckCircle2 className="w-4 h-4" />
                Validate
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              {/* View Controls */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Maximize2 className="w-4 h-4" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleZoomIn}>
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Zoom In
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleZoomOut}>
                    <ZoomOut className="w-4 h-4 mr-2" />
                    Zoom Out
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleFitView}>
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Fit to View
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleGridSnap}>
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Grid Snap: {gridSnap ? "On" : "Off"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Edge Color Picker */}
              <ColorPicker
                label="Edge"
                value={defaultEdgeColor}
                onChange={setDefaultEdgeColor}
              />

              <div className="w-px h-6 bg-border mx-1" />

              {/* Clear */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="gap-2 text-destructive hover:text-destructive"
                title="Clear Canvas"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Panel>

          <Panel
            position="bottom-left"
            className="bg-card border rounded-lg p-2 shadow-lg"
          >
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Shortcuts:</strong>
              </p>
              <p>• Ctrl+Z: Undo | Ctrl+Y: Redo</p>
              <p>• Ctrl+S: Save | Ctrl+A: Select All</p>
              <p>• Ctrl+D: Duplicate | Ctrl+G: Group</p>
              <p>• Del: Delete | Right-click: Menu</p>
              <p>• Ctrl+Click: Multi-select</p>
              <p>• Shift+Drag: Box select</p>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <NodePropertiesPanel
          selectedNode={selectedNode}
          onClose={() =>
            setNodes((nds) => nds.map((node) => ({ ...node, selected: false })))
          }
          onUpdateNodeData={updateNodeData}
        />
      )}

      {/* Connection Properties Panel */}
      {selectedEdge && !selectedNode && (
        <EdgePropertiesPanel
          selectedEdge={selectedEdge}
          onClose={() =>
            setEdges((eds) => eds.map((edge) => ({ ...edge, selected: false })))
          }
          onUpdateEdgeData={updateEdgeData}
          onDeleteEdge={(edgeId: string) => {
            setEdges((eds) => eds.filter((e) => e.id !== edgeId));
            setSelectedEdge(null);
          }}
        />
      )}

      {/* Node Context Menu */}
      {contextMenuNode && contextMenuPosition && (
        <NodeContextMenu
          node={contextMenuNode}
          position={contextMenuPosition}
          onClose={() => {
            setContextMenuNode(null);
            setContextMenuPosition(null);
          }}
          onDuplicate={(nodeId: string) => {
            duplicateNodeById(nodeId);
            setContextMenuNode(null);
          }}
          onSelect={(nodeId: string) => {
            setNodes((nds) =>
              nds.map((n) => ({
                ...n,
                selected: n.id === nodeId,
              }))
            );
            setContextMenuNode(null);
          }}
          onGroupToggle={(nodeId: string, groupId: string | undefined) => {
            if (groupId) {
              ungroupNodes(groupId);
            } else {
              setNodes((nds) =>
                nds.map((n) => ({
                  ...n,
                  selected: n.id === nodeId,
                }))
              );
              groupSelectedNodes();
            }
            setContextMenuNode(null);
          }}
          onDelete={(nodeId: string) => {
            deleteNodeById(nodeId);
            setContextMenuNode(null);
          }}
        />
      )}

      {/* Edge Context Menu */}
      {contextMenuEdge && contextMenuPosition && (
        <EdgeContextMenu
          edge={contextMenuEdge}
          position={contextMenuPosition}
          onClose={() => {
            setContextMenuEdge(null);
            setContextMenuPosition(null);
          }}
          onEdit={(edge: Edge) => {
            setSelectedEdge(edge);
            setContextMenuEdge(null);
          }}
          onDelete={(edgeId: string) => {
            deleteEdgeById(edgeId);
            setContextMenuEdge(null);
          }}
        />
      )}

      {/* Save Dialog */}
      <SaveNetworkDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        networkName={networkName}
        networkDescription={networkDescription}
        onNetworkNameChange={setNetworkName}
        onNetworkDescriptionChange={setNetworkDescription}
        onSave={handleSaveToDatabase}
        isUpdating={!!currentNetworkId}
        isSaving={
          createNetworkMutation.isPending || updateNetworkMutation.isPending
        }
      />

      {/* Load Dialog */}
      <LoadNetworkDialog
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        networks={savedNetworks || []}
        onLoad={handleLoadNetwork}
        onDelete={handleDeleteNetwork}
      />

      {/* Share Dialog */}
      <ShareNetworkDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareUrl={shareUrl || ""}
        onCopyLink={copyShareLink}
      />

      {/* Validation Panel */}
      {validationPanelOpen && (
        <ValidationPanel
          validationResult={validationResult}
          onClose={() => setValidationPanelOpen(false)}
          onHighlightNodes={highlightNodes}
          onHighlightEdges={highlightEdges}
        />
      )}

      {/* Device Templates Dialog */}
      <DeviceTemplatesDialog
        open={deviceTemplatesDialogOpen}
        onOpenChange={setDeviceTemplatesDialogOpen}
        onSelectTemplate={handleTemplateSelection}
      />

      {/* Visual Settings Panel */}
      <VisualSettingsPanel
        open={visualSettingsPanelOpen}
        onOpenChange={setVisualSettingsPanelOpen}
        settings={visualSettings}
        onSettingsChange={setVisualSettings}
      />
    </div>
  );
}
