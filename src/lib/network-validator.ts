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
          "Use a valid IPv4 format (e.g., 192.168.1.1 or 192.168.1.0/24 with CIDR notation).",
      });
    }
  });

  return issues;
}

/**
 * Validate IP address format (IPv4 with optional CIDR notation)
 */
function isValidIP(ip: string): boolean {
  // Support CIDR notation (e.g., 192.168.1.1/24)
  const parts = ip.split("/");
  const ipPart = parts[0];
  const cidrPart = parts[1];

  // Validate IP address
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  if (!ipv4Regex.test(ipPart)) {
    return false;
  }

  // If CIDR is present, validate it (0-32)
  if (cidrPart !== undefined) {
    const cidr = parseInt(cidrPart, 10);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      return false;
    }
  }

  return true;
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
 * Parse power consumption string to watts
 * Examples: "740W" -> 740, "12W" -> 12, "Varies" -> 0
 */
function parsePowerConsumption(powerStr: string | undefined): number {
  if (!powerStr) return 0;

  const match = powerStr.match(/(\d+\.?\d*)\s*W/i);
  if (match) {
    return parseFloat(match[1]);
  }

  return 0;
}

/**
 * Check PoE (Power over Ethernet) budget on switches
 * Validates that PoE switches have enough power budget for connected PoE devices
 */
function validatePoEBudget(nodes: Node[], edges: Edge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Find all PoE switches
  const poeSwitches = nodes.filter((node) => {
    const metadata = node.data.metadata || {};
    return (
      (node.data.type === "switch" || node.data.type === "router") &&
      metadata["PoE Budget"]
    );
  });

  poeSwitches.forEach((switchNode) => {
    const metadata = switchNode.data.metadata || {};
    const poeBudgetStr = metadata["PoE Budget"];

    if (!poeBudgetStr) return;

    // Parse PoE budget (e.g., "740W" -> 740)
    const poeBudget = parsePowerConsumption(poeBudgetStr);

    if (poeBudget === 0) return;

    // Find all devices connected to this switch
    const connectedDevices = edges
      .filter(
        (edge) => edge.source === switchNode.id || edge.target === switchNode.id
      )
      .map((edge) => {
        const deviceId =
          edge.source === switchNode.id ? edge.target : edge.source;
        return nodes.find((n) => n.id === deviceId);
      })
      .filter((n) => n !== undefined) as Node[];

    // Calculate total PoE consumption
    let totalPoeConsumption = 0;
    const poeDevices: { id: string; label: string; power: number }[] = [];

    connectedDevices.forEach((device) => {
      const devicePower = parsePowerConsumption(device.data.powerConsumption);

      // Devices that typically use PoE
      const isPoeDevice =
        device.data.type === "ap" ||
        device.data.type === "camera" ||
        (device.data.metadata && device.data.metadata["PoE"]);

      if (devicePower > 0 && isPoeDevice) {
        totalPoeConsumption += devicePower;
        poeDevices.push({
          id: device.id,
          label: device.data.label || device.id,
          power: devicePower,
        });
      }
    });

    // Check if consumption exceeds budget
    if (totalPoeConsumption > poeBudget) {
      const overage = totalPoeConsumption - poeBudget;
      const percentOverage = ((overage / poeBudget) * 100).toFixed(1);

      issues.push({
        id: `poe-budget-exceeded-${switchNode.id}`,
        severity: "error",
        category: "Power",
        title: "PoE Budget Exceeded",
        description: `Switch "${
          switchNode.data.label || switchNode.id
        }" has a PoE budget of ${poeBudget}W but connected devices consume ${totalPoeConsumption}W (${percentOverage}% over budget). Connected PoE devices: ${poeDevices
          .map((d) => `${d.label} (${d.power}W)`)
          .join(", ")}`,
        affectedNodes: [switchNode.id, ...poeDevices.map((d) => d.id)],
        suggestion: `Reduce PoE load by ${overage}W. Options: 1) Remove or redistribute ${Math.ceil(
          overage / 30
        )} devices (assuming ~30W each), 2) Upgrade to a switch with higher PoE budget, 3) Use external PoE injectors for some devices.`,
      });
    } else if (totalPoeConsumption > poeBudget * 0.8) {
      // Warning if using more than 80% of budget
      const percentUsed = ((totalPoeConsumption / poeBudget) * 100).toFixed(1);

      issues.push({
        id: `poe-budget-high-${switchNode.id}`,
        severity: "warning",
        category: "Power",
        title: "PoE Budget Near Capacity",
        description: `Switch "${
          switchNode.data.label || switchNode.id
        }" is using ${percentUsed}% of its PoE budget (${totalPoeConsumption}W / ${poeBudget}W). ${
          poeDevices.length
        } PoE device(s) connected.`,
        affectedNodes: [switchNode.id, ...poeDevices.map((d) => d.id)],
        suggestion:
          "Monitor PoE usage carefully. Consider upgrading the switch or redistributing devices before adding more PoE devices.",
      });
    }
  });

  return issues;
}

/**
 * Validate rack space allocation
 * Checks if rack-mounted equipment exceeds standard rack capacity
 */
function validateRackSpace(nodes: Node[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Find devices with rack unit information
  const rackDevices = nodes.filter((node) => {
    const rackUnits = node.data.rackUnits || node.data.metadata?.["Rack Units"];
    return rackUnits && parseInt(rackUnits) > 0;
  });

  if (rackDevices.length === 0) return issues;

  // Calculate total rack units needed
  let totalRackUnits = 0;
  rackDevices.forEach((device) => {
    const rackUnits =
      device.data.rackUnits ||
      parseInt(device.data.metadata?.["Rack Units"] || "0");
    totalRackUnits += rackUnits;
  });

  // Standard rack is 42U
  const standardRackSize = 42;

  if (totalRackUnits > standardRackSize) {
    const racksNeeded = Math.ceil(totalRackUnits / standardRackSize);
    issues.push({
      id: "rack-space-exceeded",
      severity: "warning",
      category: "Physical Infrastructure",
      title: "Insufficient Rack Space",
      description: `Total rack space required: ${totalRackUnits}U across ${rackDevices.length} devices. This exceeds a standard 42U rack.`,
      affectedNodes: rackDevices.map((d) => d.id),
      suggestion: `You will need ${racksNeeded} standard racks to accommodate all equipment. Plan rack layout and cable management accordingly.`,
    });
  } else if (totalRackUnits > standardRackSize * 0.9) {
    const percentUsed = ((totalRackUnits / standardRackSize) * 100).toFixed(1);
    issues.push({
      id: "rack-space-high",
      severity: "info",
      category: "Physical Infrastructure",
      title: "Rack Space Near Capacity",
      description: `Using ${percentUsed}% of standard 42U rack (${totalRackUnits}U / ${standardRackSize}U).`,
      affectedNodes: rackDevices.map((d) => d.id),
      suggestion:
        "Limited space remaining for expansion. Consider planning for an additional rack if growth is expected.",
    });
  }

  return issues;
}

/**
 * Check for incompatible connection types
 * Validates that fiber/SFP connections are used appropriately
 */
function validateConnectionTypes(
  nodes: Node[],
  edges: Edge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  edges.forEach((edge) => {
    const connectionType = edge.data?.connectionType;
    const bandwidth = parseBandwidth(edge.data?.bandwidth || edge.label || "0");

    // Fiber optic should be used for high-bandwidth or long-distance connections
    if (connectionType === "fiber") {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      // Check if devices have SFP/SFP+ ports
      const sourceHasSFP =
        sourceNode?.data.metadata?.["SFP+ Ports"] ||
        sourceNode?.data.metadata?.["Uplinks"]?.includes("SFP") ||
        sourceNode?.data.type === "router" || // Routers typically have SFP capabilities
        sourceNode?.data.type === "firewall"; // Firewalls typically have SFP capabilities
      const targetHasSFP =
        targetNode?.data.metadata?.["SFP+ Ports"] ||
        targetNode?.data.metadata?.["Uplinks"]?.includes("SFP") ||
        targetNode?.data.type === "router" ||
        targetNode?.data.type === "firewall";

      if (!sourceHasSFP && sourceNode?.data.type !== "cloud") {
        issues.push({
          id: `fiber-no-sfp-${edge.id}-source`,
          severity: "warning",
          category: "Configuration",
          title: "Fiber Connection Without SFP Port",
          description: `Device "${
            sourceNode?.data.label || edge.source
          }" is configured with a fiber connection but doesn't appear to have SFP/SFP+ ports in its specifications.`,
          affectedNodes: [edge.source],
          affectedEdges: [edge.id],
          suggestion:
            "Verify that the device has the appropriate SFP/SFP+ module installed, or change the connection type to ethernet.",
        });
      }

      if (!targetHasSFP && targetNode?.data.type !== "cloud") {
        issues.push({
          id: `fiber-no-sfp-${edge.id}-target`,
          severity: "warning",
          category: "Configuration",
          title: "Fiber Connection Without SFP Port",
          description: `Device "${
            targetNode?.data.label || edge.target
          }" is configured with a fiber connection but doesn't appear to have SFP/SFP+ ports in its specifications.`,
          affectedNodes: [edge.target],
          affectedEdges: [edge.id],
          suggestion:
            "Verify that the device has the appropriate SFP/SFP+ module installed, or change the connection type to ethernet.",
        });
      }
    }

    // Recommend fiber for 10G+ connections
    if (bandwidth >= 10000 && connectionType === "ethernet") {
      issues.push({
        id: `high-bandwidth-ethernet-${edge.id}`,
        severity: "info",
        category: "Configuration",
        title: "High Bandwidth Over Ethernet",
        description: `Connection using ${formatBandwidth(
          bandwidth
        )} is configured as ethernet. Fiber optic is typically recommended for 10G+ connections.`,
        affectedEdges: [edge.id],
        suggestion:
          "Consider using fiber optic (SFP+/QSFP) for better performance and longer distance support at 10G+ speeds.",
      });
    }

    // Wireless shouldn't be used for critical high-bandwidth connections
    if (connectionType === "wireless" && bandwidth >= 1000) {
      issues.push({
        id: `wireless-high-bandwidth-${edge.id}`,
        severity: "warning",
        category: "Configuration",
        title: "High Bandwidth Over Wireless",
        description: `Connection configured for ${formatBandwidth(
          bandwidth
        )} over wireless. Wireless connections may not reliably sustain this bandwidth.`,
        affectedEdges: [edge.id],
        suggestion:
          "For critical or consistent high-bandwidth requirements, use wired connections (ethernet or fiber).",
      });
    }
  });

  return issues;
}

/**
 * Validate redundancy for critical infrastructure
 */
function validateRedundancy(nodes: Node[], edges: Edge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for single points of failure
  const criticalDeviceTypes = ["router", "firewall", "switch"];

  criticalDeviceTypes.forEach((deviceType) => {
    const devicesOfType = nodes.filter((n) => n.data.type === deviceType);

    if (devicesOfType.length === 1) {
      const device = devicesOfType[0];
      const connectedEdges = edges.filter(
        (e) => e.source === device.id || e.target === device.id
      );

      // If this device has multiple downstream connections, it's a single point of failure
      if (connectedEdges.length > 2) {
        issues.push({
          id: `single-point-failure-${device.id}`,
          severity: "warning",
          category: "Redundancy",
          title: `Single Point of Failure: ${deviceType}`,
          description: `Only one ${deviceType} detected ("${
            device.data.label || device.id
          }") with ${
            connectedEdges.length
          } connections. Failure of this device would affect multiple network segments.`,
          affectedNodes: [device.id],
          suggestion: `Consider adding a redundant ${deviceType} for high availability. Implement protocols like HSRP/VRRP (routers) or RSTP/MSTP (switches).`,
        });
      }
    }
  });

  // Check for servers without redundant uplinks
  const servers = nodes.filter((n) => n.data.type === "server");
  servers.forEach((server) => {
    const uplinks = edges.filter(
      (e) => e.source === server.id || e.target === server.id
    );

    if (uplinks.length === 1) {
      issues.push({
        id: `server-single-uplink-${server.id}`,
        severity: "info",
        category: "Redundancy",
        title: "Server With Single Uplink",
        description: `Server "${
          server.data.label || server.id
        }" has only one network connection. Consider adding redundant NICs for high availability.`,
        affectedNodes: [server.id],
        suggestion:
          "Add a second NIC and configure NIC teaming/bonding for redundancy and increased bandwidth.",
      });
    }
  });

  return issues;
}

/**
 * Validate port capacity on switches and routers
 * Ensures devices have enough physical ports for all connections
 */
function validatePortCapacity(nodes: Node[], edges: Edge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  nodes.forEach((node) => {
    const portCount = node.data.portCount;

    // Only check devices that have a defined port count
    if (!portCount || portCount <= 0) return;

    // Count connections to this device
    const connections = edges.filter(
      (e) => e.source === node.id || e.target === node.id
    );

    const connectionCount = connections.length;

    if (connectionCount > portCount) {
      const overage = connectionCount - portCount;
      issues.push({
        id: `port-capacity-exceeded-${node.id}`,
        severity: "error",
        category: "Physical Constraints",
        title: "Insufficient Ports",
        description: `Device "${
          node.data.label || node.id
        }" has ${portCount} port(s) but ${connectionCount} connection(s) configured (${overage} over capacity).`,
        affectedNodes: [node.id],
        affectedEdges: connections.map((e) => e.id),
        suggestion: `Options: 1) Remove ${overage} connection(s), 2) Upgrade to a device with more ports, 3) Add an additional switch to expand capacity.`,
      });
    } else if (connectionCount === portCount) {
      issues.push({
        id: `port-capacity-full-${node.id}`,
        severity: "warning",
        category: "Physical Constraints",
        title: "All Ports In Use",
        description: `Device "${
          node.data.label || node.id
        }" is using all ${portCount} available ports. No capacity for expansion.`,
        affectedNodes: [node.id],
        suggestion:
          "Consider planning for expansion. You may need an additional switch or device upgrade for future growth.",
      });
    } else if (connectionCount >= portCount * 0.9) {
      const percentUsed = ((connectionCount / portCount) * 100).toFixed(0);
      issues.push({
        id: `port-capacity-high-${node.id}`,
        severity: "info",
        category: "Physical Constraints",
        title: "Port Capacity Near Limit",
        description: `Device "${
          node.data.label || node.id
        }" is using ${percentUsed}% of available ports (${connectionCount}/${portCount}).`,
        affectedNodes: [node.id],
        suggestion:
          "Limited ports remaining. Plan ahead for any network expansion needs.",
      });
    }
  });

  return issues;
}

/**
 * Validate subnet and IP address configuration
 * Ensures IPs are in proper subnets and subnet masks are consistent
 */
function validateSubnetsAndIPs(
  nodes: Node[],
  edges: Edge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Helper to parse IP and subnet
  const parseIPAndSubnet = (
    ip: string
  ): { network: string; prefix: number } | null => {
    if (!ip) return null;

    // Match IP/CIDR format (e.g., "192.168.1.1/24")
    const cidrMatch = ip.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
    if (cidrMatch) {
      const [, ipAddr, prefix] = cidrMatch;
      const network = getNetworkAddress(ipAddr, parseInt(prefix));
      return { network, prefix: parseInt(prefix) };
    }

    // Plain IP without subnet - assume /24 for validation
    const plainMatch = ip.match(/^(\d+\.\d+\.\d+)\.\d+$/);
    if (plainMatch) {
      return { network: `${plainMatch[1]}.0`, prefix: 24 };
    }

    return null;
  };

  // Group nodes by VLAN
  const vlanGroups = new Map<string, Node[]>();
  nodes.forEach((node) => {
    if (node.data.ip && node.type !== "group") {
      const vlan = node.data.vlan || "default";
      if (!vlanGroups.has(vlan)) {
        vlanGroups.set(vlan, []);
      }
      vlanGroups.get(vlan)!.push(node);
    }
  });

  // Validate subnet consistency within each VLAN
  vlanGroups.forEach((vlanNodes, vlan) => {
    const subnetMap = new Map<string, Node[]>();

    vlanNodes.forEach((node) => {
      const parsed = parseIPAndSubnet(node.data.ip);
      if (parsed) {
        const key = `${parsed.network}/${parsed.prefix}`;
        if (!subnetMap.has(key)) {
          subnetMap.set(key, []);
        }
        subnetMap.get(key)!.push(node);
      }
    });

    // Warn if multiple subnets in same VLAN
    if (subnetMap.size > 1) {
      const subnets = Array.from(subnetMap.keys());
      issues.push({
        id: `multiple-subnets-vlan-${vlan}`,
        severity: "warning",
        category: "IP Configuration",
        title: `Multiple Subnets in VLAN ${vlan}`,
        description: `VLAN ${vlan} contains devices on different subnets: ${subnets.join(
          ", "
        )}. This may cause communication issues without proper routing.`,
        affectedNodes: vlanNodes.map((n) => n.id),
        suggestion:
          "Typically, one VLAN should map to one subnet. Consider reorganizing VLANs or ensuring proper Layer 3 routing is configured.",
      });
    }
  });

  // Check for devices trying to communicate across subnets without router
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode?.data.ip || !targetNode?.data.ip) return;

    // Skip if either end is a router or layer 3 switch
    if (
      sourceNode.data.type === "router" ||
      sourceNode.data.type === "firewall" ||
      targetNode.data.type === "router" ||
      targetNode.data.type === "firewall"
    ) {
      return;
    }

    const sourceParsed = parseIPAndSubnet(sourceNode.data.ip);
    const targetParsed = parseIPAndSubnet(targetNode.data.ip);

    if (
      sourceParsed &&
      targetParsed &&
      sourceParsed.network !== targetParsed.network
    ) {
      // Check if there's a router in the path
      const hasRouterInPath = edges.some((e) => {
        const node = nodes.find(
          (n) =>
            n.id === e.source ||
            (n.id === e.target &&
              (n.data.type === "router" || n.data.type === "firewall"))
        );
        return node !== undefined;
      });

      if (!hasRouterInPath) {
        issues.push({
          id: `cross-subnet-no-router-${edge.id}`,
          severity: "error",
          category: "IP Configuration",
          title: "Cross-Subnet Communication Without Router",
          description: `Direct connection between "${
            sourceNode.data.label || edge.source
          }" (${sourceParsed.network}/${sourceParsed.prefix}) and "${
            targetNode.data.label || edge.target
          }" (${targetParsed.network}/${
            targetParsed.prefix
          }) without a router. These devices cannot communicate.`,
          affectedNodes: [edge.source, edge.target],
          affectedEdges: [edge.id],
          suggestion:
            "Add a router/Layer 3 switch to route between subnets, or move devices to the same subnet.",
        });
      }
    }
  });

  return issues;
}

/**
 * Helper function to calculate network address from IP and prefix
 */
function getNetworkAddress(ip: string, prefix: number): string {
  const parts = ip.split(".").map(Number);
  const mask = (-1 << (32 - prefix)) >>> 0;

  const ipNum =
    (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
  const networkNum = (ipNum & mask) >>> 0;

  return [
    (networkNum >>> 24) & 255,
    (networkNum >>> 16) & 255,
    (networkNum >>> 8) & 255,
    networkNum & 255,
  ].join(".");
}

/**
 * Detect missing DNS and DHCP servers
 * Critical infrastructure services for operational networks
 */
function validateDNSAndDHCP(nodes: Node[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Look for DNS server
  const hasDNS = nodes.some((node) => {
    const label = (node.data.label || "").toLowerCase();
    const metadata = node.data.metadata || {};
    return (
      node.data.type === "server" &&
      (label.includes("dns") ||
        metadata["Service"]?.toLowerCase().includes("dns") ||
        metadata["Role"]?.toLowerCase().includes("dns"))
    );
  });

  // Look for DHCP server
  const hasDHCP = nodes.some((node) => {
    const label = (node.data.label || "").toLowerCase();
    const metadata = node.data.metadata || {};
    return (
      (node.data.type === "server" || node.data.type === "router") &&
      (label.includes("dhcp") ||
        metadata["Service"]?.toLowerCase().includes("dhcp") ||
        metadata["Role"]?.toLowerCase().includes("dhcp"))
    );
  });

  // Count client devices
  const clientDevices = nodes.filter(
    (n) => n.data.type === "client" || n.data.type === "ap"
  );

  // Recommend DNS for networks with clients
  if (!hasDNS && clientDevices.length > 0) {
    issues.push({
      id: "missing-dns-server",
      severity: "warning",
      category: "Network Services",
      title: "No DNS Server Detected",
      description: `Network has ${clientDevices.length} client device(s) but no DNS server identified. DNS is essential for name resolution.`,
      suggestion:
        'Add a DNS server or configure your router to provide DNS services. Label it with "DNS" or add metadata Role: "DNS" for detection.',
    });
  }

  // Recommend DHCP for networks with multiple clients
  if (!hasDHCP && clientDevices.length >= 5) {
    issues.push({
      id: "missing-dhcp-server",
      severity: "info",
      category: "Network Services",
      title: "No DHCP Server Detected",
      description: `Network has ${clientDevices.length} client devices but no DHCP server identified. DHCP simplifies IP management for larger networks.`,
      suggestion:
        'Add a DHCP server or enable DHCP on your router. Label it with "DHCP" or add metadata Role: "DHCP" for detection.',
    });
  }

  return issues;
}

/**
 * Validate inter-VLAN routing capability
 * Ensures Layer 3 device exists when multiple VLANs are configured
 */
function validateInterVLANRouting(
  nodes: Node[],
  edges: Edge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Find all unique VLANs
  const vlans = new Set<string>();
  nodes.forEach((node) => {
    if (node.data.vlan && node.type !== "group") {
      vlans.add(node.data.vlan);
    }
  });

  edges.forEach((edge) => {
    if (edge.data?.vlan) {
      vlans.add(edge.data.vlan);
    }
  });

  // If multiple VLANs exist, check for Layer 3 device
  if (vlans.size > 1) {
    const hasLayer3Device = nodes.some((node) => {
      const metadata = node.data.metadata || {};
      return (
        node.data.type === "router" ||
        node.data.type === "firewall" ||
        metadata["Layer"]?.includes("3") ||
        metadata["Capabilities"]?.toLowerCase().includes("routing") ||
        metadata["Type"]?.toLowerCase().includes("layer 3") ||
        metadata["Type"]?.toLowerCase().includes("l3")
      );
    });

    if (!hasLayer3Device) {
      const vlanList = Array.from(vlans).join(", ");
      issues.push({
        id: "inter-vlan-no-routing",
        severity: "error",
        category: "VLAN",
        title: "Inter-VLAN Routing Required",
        description: `Network has ${vlans.size} VLANs (${vlanList}) but no Layer 3 device detected for inter-VLAN routing. Devices on different VLANs cannot communicate.`,
        suggestion:
          'Add a router, Layer 3 switch, or firewall capable of inter-VLAN routing. For Layer 3 switches, add metadata like Type: "Layer 3" for detection.',
      });
    } else {
      // Info message about proper VLAN interface configuration
      issues.push({
        id: "inter-vlan-config-reminder",
        severity: "info",
        category: "VLAN",
        title: "Inter-VLAN Routing Detected",
        description: `Network has ${vlans.size} VLANs with Layer 3 routing capability. Ensure VLAN interfaces (SVIs) are properly configured.`,
        suggestion:
          "Verify that each VLAN has an interface configured on the Layer 3 device with the appropriate IP address as the default gateway for that VLAN.",
      });
    }
  }

  return issues;
}

/**
 * Validate network security layers
 * Ensures proper security segmentation and firewall placement
 */
function validateNetworkSecurity(
  nodes: Node[],
  edges: Edge[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for firewall presence
  const firewalls = nodes.filter((n) => n.data.type === "firewall");
  const routers = nodes.filter((n) => n.data.type === "router");

  // Check for WAN/Internet connection
  const hasWAN = edges.some((e) => e.data?.connectionType === "wan");
  const hasCloud = nodes.some((n) => n.data.type === "cloud");

  if ((hasWAN || hasCloud) && firewalls.length === 0) {
    issues.push({
      id: "wan-without-firewall",
      severity: "error",
      category: "Security",
      title: "WAN Connection Without Firewall",
      description:
        "Network has WAN/Internet connectivity but no firewall detected. This exposes internal network to security threats.",
      suggestion:
        "Add a firewall between your WAN connection and internal network. This is critical for security.",
    });
  }

  // Check for servers directly connected to internet/WAN
  const servers = nodes.filter((n) => n.data.type === "server");
  servers.forEach((server) => {
    const serverEdges = edges.filter(
      (e) => e.source === server.id || e.target === server.id
    );

    serverEdges.forEach((edge) => {
      const otherEndId = edge.source === server.id ? edge.target : edge.source;
      const otherEnd = nodes.find((n) => n.id === otherEndId);

      if (
        otherEnd?.data.type === "cloud" ||
        edge.data?.connectionType === "wan"
      ) {
        issues.push({
          id: `server-direct-wan-${server.id}`,
          severity: "error",
          category: "Security",
          title: "Server Directly Exposed to Internet",
          description: `Server "${
            server.data.label || server.id
          }" is directly connected to WAN/Internet without firewall protection.`,
          affectedNodes: [server.id],
          affectedEdges: [edge.id],
          suggestion:
            "Place a firewall between the server and internet. Consider using a DMZ for publicly accessible servers.",
        });
      }
    });
  });

  // Check for IoT/Camera network segmentation
  const iotDevices = nodes.filter(
    (n) => n.data.type === "camera" || n.data.type === "ap"
  );

  if (iotDevices.length >= 3) {
    // Check if IoT devices are on separate VLAN
    const iotVlans = new Set(
      iotDevices.map((n) => n.data.vlan).filter(Boolean)
    );
    const otherDeviceVlans = new Set(
      nodes
        .filter(
          (n) =>
            n.data.type !== "camera" &&
            n.data.type !== "ap" &&
            n.type !== "group" &&
            n.data.vlan
        )
        .map((n) => n.data.vlan)
    );

    const hasOverlap = Array.from(iotVlans).some((vlan) =>
      otherDeviceVlans.has(vlan)
    );

    if (hasOverlap || iotVlans.size === 0) {
      issues.push({
        id: "iot-not-segmented",
        severity: "warning",
        category: "Security",
        title: "IoT Devices Not Segmented",
        description: `Network has ${iotDevices.length} IoT devices (cameras/APs) that are not on a separate VLAN. IoT devices are common security vulnerabilities.`,
        affectedNodes: iotDevices.map((n) => n.id),
        suggestion:
          "Create a dedicated VLAN for IoT devices to isolate them from critical network resources. This follows security best practices.",
      });
    }
  }

  // Check for guest network separation
  const guestDevices = nodes.filter((n) => {
    const label = (n.data.label || "").toLowerCase();
    const vlan = (n.data.vlan || "").toLowerCase();
    return label.includes("guest") || vlan.includes("guest");
  });

  if (guestDevices.length > 0) {
    const guestVlans = new Set(
      guestDevices.map((n) => n.data.vlan).filter(Boolean)
    );
    const internalVlans = new Set(
      nodes
        .filter(
          (n) =>
            !n.data.label?.toLowerCase().includes("guest") &&
            n.type !== "group" &&
            n.data.vlan
        )
        .map((n) => n.data.vlan)
    );

    const hasOverlap = Array.from(guestVlans).some((vlan) =>
      internalVlans.has(vlan)
    );

    if (hasOverlap) {
      issues.push({
        id: "guest-network-overlap",
        severity: "warning",
        category: "Security",
        title: "Guest Network Not Isolated",
        description:
          "Guest devices share VLAN with internal network resources. This is a security risk.",
        affectedNodes: guestDevices.map((n) => n.id),
        suggestion:
          "Place guest devices on a dedicated VLAN with restricted access to internal resources.",
      });
    }
  }

  // Check for multiple security zones
  const hasMultipleZones =
    vlans.size > 2 || (firewalls.length > 0 && vlans.size > 1);

  if (hasMultipleZones && firewalls.length === 0) {
    issues.push({
      id: "security-zones-no-firewall",
      severity: "info",
      category: "Security",
      title: "Multiple Security Zones Without Firewall",
      description:
        "Network has multiple VLANs/segments but no firewall for zone-based security policies.",
      suggestion:
        "Consider adding a firewall to enforce security policies between different network zones (DMZ, internal, guest, etc.).",
    });
  }

  return issues;
}

// Helper to count VLANs (used in security validation)
const vlans = new Set<string>();

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
    ...validatePoEBudget(nodes, edges),
    ...validateRackSpace(nodes),
    ...validateConnectionTypes(nodes, edges),
    ...validateRedundancy(nodes, edges),
    ...validatePortCapacity(nodes, edges),
    ...validateSubnetsAndIPs(nodes, edges),
    ...validateDNSAndDHCP(nodes),
    ...validateInterVLANRouting(nodes, edges),
    ...validateNetworkSecurity(nodes, edges),
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
