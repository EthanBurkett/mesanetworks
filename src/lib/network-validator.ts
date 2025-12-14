import type { Node, Edge } from "reactflow";

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: string;
  title: string;
  description: string;
  affectedNodes?: string[];
  affectedEdges?: string[];
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

/**
 * Detect orphaned devices - devices with no connections
 */
function detectOrphanedDevices(
  nodes: Node[],
  edges: Edge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const connectedNodeIds = new Set<string>();

  // Find all nodes that have at least one connection
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  // Find orphaned nodes (excluding cloud nodes as they may be intentionally isolated)
  const orphanedNodes = nodes.filter(
    (node) =>
      !connectedNodeIds.has(node.id) &&
      node.data.type !== "cloud" &&
      node.type !== "group"
  );

  if (orphanedNodes.length > 0) {
    issues.push({
      id: "orphaned-devices",
      severity: "warning",
      category: "Connectivity",
      title: `${orphanedNodes.length} Orphaned Device${
        orphanedNodes.length > 1 ? "s" : ""
      }`,
      description: `The following devices are not connected to any other device: ${orphanedNodes
        .map((n) => n.data.label || n.id)
        .join(", ")}`,
      affectedNodes: orphanedNodes.map((n) => n.id),
      suggestion:
        "Connect these devices to the network or remove them if they are not needed.",
    });
  }

  return issues;
}

/**
 * Identify missing default gateway - check if network has a router or firewall
 */
function checkDefaultGateway(nodes: Node[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const hasRouter = nodes.some(
    (node) => node.data.type === "router" || node.data.type === "firewall"
  );

  if (!hasRouter && nodes.length > 0) {
    issues.push({
      id: "missing-gateway",
      severity: "error",
      category: "Architecture",
      title: "Missing Default Gateway",
      description:
        "No router or firewall detected in the network. A default gateway is required for routing traffic.",
      suggestion:
        "Add a router or firewall to serve as the default gateway for your network.",
    });
  }

  return issues;
}

/**
 * Check for IP address conflicts
 */
function checkIPConflicts(nodes: Node[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ipMap = new Map<string, string[]>();

  // Group nodes by IP address
  nodes.forEach((node) => {
    const ip = node.data.ipAddress || node.data.ip;
    if (ip && ip.trim()) {
      const existing = ipMap.get(ip) || [];
      existing.push(node.id);
      ipMap.set(ip, existing);
    }
  });

  // Find IPs used by multiple devices
  ipMap.forEach((nodeIds, ip) => {
    if (nodeIds.length > 1) {
      const labels = nodeIds
        .map((id) => {
          const node = nodes.find((n) => n.id === id);
          return node?.data.label || id;
        })
        .join(", ");

      issues.push({
        id: `ip-conflict-${ip}`,
        severity: "error",
        category: "IP Configuration",
        title: `IP Address Conflict: ${ip}`,
        description: `Multiple devices are using the same IP address (${ip}): ${labels}`,
        affectedNodes: nodeIds,
        suggestion: `Assign unique IP addresses to each device. Consider using a DHCP server or IP address management tool.`,
      });
    }
  });

  // Validate IP format
  nodes.forEach((node) => {
    const ip = node.data.ipAddress || node.data.ip;
    if (ip && ip.trim() && !isValidIP(ip)) {
      issues.push({
        id: `invalid-ip-${node.id}`,
        severity: "warning",
        category: "IP Configuration",
        title: "Invalid IP Address Format",
        description: `Device "${
          node.data.label || node.id
        }" has an invalid IP address: ${ip}`,
        affectedNodes: [node.id],
        suggestion:
          "Use a valid IPv4 format (e.g., 192.168.1.1) or IPv6 format.",
      });
    }
  });

  return issues;
}

/**
 * Validate IP address format (basic IPv4 check)
 */
function isValidIP(ip: string): boolean {
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

/**
 * Validate VLAN consistency - check for VLAN mismatches
 */
function validateVLANConsistency(
  nodes: Node[],
  edges: Edge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check each edge for VLAN consistency
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return;

    const edgeVLAN = edge.data?.vlan;
    const sourceVLAN = sourceNode.data?.vlan;
    const targetVLAN = targetNode.data?.vlan;

    // If edge has VLAN tag, check if devices are configured for it
    if (edgeVLAN && edgeVLAN.trim()) {
      const edgeVLANs = edgeVLAN.split(",").map((v: string) => v.trim());

      // Check source device VLAN
      if (
        sourceVLAN &&
        !edgeVLANs.some((vlan: string) => sourceVLAN.includes(vlan))
      ) {
        issues.push({
          id: `vlan-mismatch-${edge.id}-source`,
          severity: "warning",
          category: "VLAN Configuration",
          title: "VLAN Mismatch",
          description: `Connection "${
            edge.data?.label || edge.id
          }" uses VLAN ${edgeVLAN}, but source device "${
            sourceNode.data.label || sourceNode.id
          }" is configured for VLAN ${sourceVLAN}`,
          affectedNodes: [sourceNode.id],
          affectedEdges: [edge.id],
          suggestion:
            "Ensure VLAN tags on connections match the VLAN configuration on connected devices.",
        });
      }

      // Check target device VLAN
      if (
        targetVLAN &&
        !edgeVLANs.some((vlan: string) => targetVLAN.includes(vlan))
      ) {
        issues.push({
          id: `vlan-mismatch-${edge.id}-target`,
          severity: "warning",
          category: "VLAN Configuration",
          title: "VLAN Mismatch",
          description: `Connection "${
            edge.data?.label || edge.id
          }" uses VLAN ${edgeVLAN}, but target device "${
            targetNode.data.label || targetNode.id
          }" is configured for VLAN ${targetVLAN}`,
          affectedNodes: [targetNode.id],
          affectedEdges: [edge.id],
          suggestion:
            "Ensure VLAN tags on connections match the VLAN configuration on connected devices.",
        });
      }
    }
  });

  return issues;
}

/**
 * Detect bandwidth bottlenecks
 */
function detectBandwidthBottlenecks(
  nodes: Node[],
  edges: Edge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Calculate total bandwidth per node
  const nodeBandwidth = new Map<
    string,
    { incoming: number; outgoing: number; label: string }
  >();

  nodes.forEach((node) => {
    nodeBandwidth.set(node.id, {
      incoming: 0,
      outgoing: 0,
      label: node.data.label || node.id,
    });
  });

  edges.forEach((edge) => {
    const bandwidth = parseBandwidth(edge.data?.bandwidth || edge.label || "0");

    const source = nodeBandwidth.get(edge.source);
    const target = nodeBandwidth.get(edge.target);

    if (source) {
      source.outgoing += bandwidth;
      nodeBandwidth.set(edge.source, source);
    }

    if (target) {
      target.incoming += bandwidth;
      nodeBandwidth.set(edge.target, target);
    }
  });

  // Find potential bottlenecks
  nodeBandwidth.forEach((bw, nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Check for asymmetric bandwidth (outgoing much higher than incoming to a specific device)
    const connectedEdges = edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    );

    connectedEdges.forEach((edge) => {
      const edgeBandwidth = parseBandwidth(
        edge.data?.bandwidth || edge.label || "0"
      );
      const isSource = edge.source === nodeId;

      // Find the upstream connection
      const upstreamEdge = edges.find(
        (e) => e.target === nodeId && e.id !== edge.id
      );
      if (upstreamEdge) {
        const upstreamBandwidth = parseBandwidth(
          upstreamEdge.data?.bandwidth || upstreamEdge.label || "0"
        );

        // If downstream is requesting more bandwidth than upstream provides
        if (edgeBandwidth > upstreamBandwidth && isSource) {
          issues.push({
            id: `bottleneck-${nodeId}-${edge.id}`,
            severity: "warning",
            category: "Performance",
            title: "Potential Bandwidth Bottleneck",
            description: `Device "${
              bw.label
            }" may experience a bottleneck. Upstream connection provides ${formatBandwidth(
              upstreamBandwidth
            )} but downstream requires ${formatBandwidth(edgeBandwidth)}.`,
            affectedNodes: [nodeId],
            affectedEdges: [edge.id, upstreamEdge.id],
            suggestion:
              "Consider upgrading the upstream connection or implementing QoS policies.",
          });
        }
      }
    });

    // Check for devices with many high-bandwidth connections (potential switch oversubscription)
    if (
      (node.data.type === "switch" || node.data.type === "router") &&
      connectedEdges.length > 4
    ) {
      const totalBandwidth = bw.incoming + bw.outgoing;
      const avgPerConnection = totalBandwidth / connectedEdges.length;

      if (avgPerConnection > 1000) {
        // More than 1 Gbps average per connection
        issues.push({
          id: `oversubscription-${nodeId}`,
          severity: "info",
          category: "Performance",
          title: "Potential Switch Oversubscription",
          description: `Device "${bw.label}" has ${
            connectedEdges.length
          } connections with high average bandwidth (${formatBandwidth(
            avgPerConnection
          )} per connection).`,
          affectedNodes: [nodeId],
          suggestion:
            "Verify that the switch backplane can handle the aggregate bandwidth. Consider port channeling or upgrading to a higher-capacity switch.",
        });
      }
    }
  });

  return issues;
}

/**
 * Parse bandwidth string to Mbps number
 */
function parseBandwidth(bandwidth: string): number {
  const normalized = bandwidth.toLowerCase().trim();

  const match = normalized.match(/([\d.]+)\s*(gbps|mbps|kbps|bps)?/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || "mbps";

  switch (unit) {
    case "gbps":
      return value * 1000;
    case "mbps":
      return value;
    case "kbps":
      return value / 1000;
    case "bps":
      return value / 1000000;
    default:
      return value;
  }
}

/**
 * Format bandwidth for display
 */
function formatBandwidth(mbps: number): string {
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(2)} Gbps`;
  }
  return `${mbps.toFixed(2)} Mbps`;
}

/**
 * Main validation function - runs all validation checks
 */
export function validateNetwork(
  nodes: Node[],
  edges: Edge[]
): ValidationResult {
  const issues: ValidationIssue[] = [
    ...detectOrphanedDevices(nodes, edges),
    ...checkDefaultGateway(nodes),
    ...checkIPConflicts(nodes),
    ...validateVLANConsistency(nodes, edges),
    ...detectBandwidthBottlenecks(nodes, edges),
  ];

  const summary = {
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    info: issues.filter((i) => i.severity === "info").length,
  };

  return {
    isValid: summary.errors === 0,
    issues,
    summary,
  };
}
