/**
 * Device Templates Library
 * Pre-configured device templates for common network equipment
 */

export interface DeviceTemplate {
  id: string;
  name: string;
  vendor: string;
  category:
    | "router"
    | "switch"
    | "firewall"
    | "server"
    | "nas"
    | "ap"
    | "camera"
    | "cloud"
    | "client";
  model: string;
  description: string;
  defaultProperties: {
    portCount?: number;
    bandwidth?: string;
    powerConsumption?: string;
    rackUnits?: number;
    status?: "online" | "offline" | "warning";
    vlan?: string;
    metadata?: Record<string, string>;
  };
  icon?: string;
  tags: string[];
}

export const DEVICE_TEMPLATES: DeviceTemplate[] = [
  // === ROUTERS ===
  {
    id: "cisco-isr-4331",
    name: "Cisco ISR 4331",
    vendor: "Cisco",
    category: "router",
    model: "ISR 4331",
    description: "Integrated Services Router with 3 Gigabit Ethernet ports",
    defaultProperties: {
      portCount: 3,
      bandwidth: "1 Gbps",
      powerConsumption: "75W",
      rackUnits: 1,
      status: "online",
      metadata: {
        CPU: "Quad-core",
        RAM: "4GB",
        Flash: "4GB",
      },
    },
    tags: ["enterprise", "wan", "branch"],
  },
  {
    id: "ubiquiti-udm-pro",
    name: "UniFi Dream Machine Pro",
    vendor: "Ubiquiti",
    category: "router",
    model: "UDM-Pro",
    description: "All-in-one router, switch, and network video recorder",
    defaultProperties: {
      portCount: 8,
      bandwidth: "1 Gbps",
      powerConsumption: "35W",
      rackUnits: 1,
      status: "online",
      metadata: {
        "SFP+": "2",
        "PoE Ports": "0",
        "HDD Bays": "1",
      },
    },
    tags: ["prosumer", "all-in-one", "security"],
  },
  {
    id: "mikrotik-rb5009",
    name: "MikroTik RB5009UG+S+IN",
    vendor: "MikroTik",
    category: "router",
    model: "RB5009UG+S+IN",
    description: "RouterBoard with 7x Gigabit Ethernet, 1x 2.5G, 1x SFP+",
    defaultProperties: {
      portCount: 9,
      bandwidth: "2.5 Gbps",
      powerConsumption: "28W",
      status: "online",
      metadata: {
        CPU: "ARM Cortex-A53",
        RAM: "1GB",
        Storage: "512MB NAND",
      },
    },
    tags: ["budget", "versatile", "routeros"],
  },
  {
    id: "pfsense-vm",
    name: "pfSense Virtual Router",
    vendor: "Netgate",
    category: "firewall",
    model: "pfSense VM",
    description: "Software-based firewall and router",
    defaultProperties: {
      portCount: 4,
      bandwidth: "10 Gbps",
      powerConsumption: "Varies",
      status: "online",
      metadata: {
        Type: "Virtual",
        OS: "FreeBSD",
      },
    },
    tags: ["virtual", "open-source", "firewall"],
  },

  // === SWITCHES ===
  {
    id: "cisco-catalyst-2960x",
    name: "Cisco Catalyst 2960-X",
    vendor: "Cisco",
    category: "switch",
    model: "WS-C2960X-48FPD-L",
    description: "48-port PoE+ Gigabit switch with 2x 10G uplinks",
    defaultProperties: {
      portCount: 48,
      bandwidth: "1 Gbps",
      powerConsumption: "740W",
      rackUnits: 1,
      status: "online",
      metadata: {
        "PoE Budget": "740W",
        Uplinks: "2x 10G SFP+",
        "Switching Capacity": "176 Gbps",
      },
    },
    tags: ["enterprise", "poe", "layer3"],
  },
  {
    id: "ubiquiti-us-48-poe",
    name: "UniFi Switch 48 PoE",
    vendor: "Ubiquiti",
    category: "switch",
    model: "US-48-500W",
    description: "48-port Gigabit switch with PoE+",
    defaultProperties: {
      portCount: 48,
      bandwidth: "1 Gbps",
      powerConsumption: "500W",
      rackUnits: 1,
      status: "online",
      metadata: {
        "PoE Budget": "500W",
        Uplinks: "2x SFP, 2x SFP+",
        "Total Power": "750W max",
      },
    },
    tags: ["prosumer", "poe", "unifi"],
  },
  {
    id: "meraki-ms120-24p",
    name: "Cisco Meraki MS120-24P",
    vendor: "Cisco Meraki",
    category: "switch",
    model: "MS120-24P",
    description: "Cloud-managed 24-port PoE+ Gigabit switch",
    defaultProperties: {
      portCount: 24,
      bandwidth: "1 Gbps",
      powerConsumption: "370W",
      rackUnits: 1,
      status: "online",
      metadata: {
        "PoE Budget": "370W",
        Uplinks: "4x 1G SFP",
        Management: "Cloud",
      },
    },
    tags: ["cloud-managed", "poe", "enterprise"],
  },
  {
    id: "netgear-gs724t",
    name: "Netgear GS724T",
    vendor: "Netgear",
    category: "switch",
    model: "GS724T-400",
    description: "24-port Gigabit smart switch",
    defaultProperties: {
      portCount: 24,
      bandwidth: "1 Gbps",
      powerConsumption: "30W",
      rackUnits: 1,
      status: "online",
      metadata: {
        Type: "Smart Managed",
        VLANs: "64",
      },
    },
    tags: ["budget", "small-business", "managed"],
  },

  // === FIREWALLS ===
  {
    id: "palo-alto-pa-220",
    name: "Palo Alto PA-220",
    vendor: "Palo Alto Networks",
    category: "firewall",
    model: "PA-220",
    description: "Next-generation firewall for small businesses",
    defaultProperties: {
      portCount: 8,
      bandwidth: "500 Mbps",
      powerConsumption: "40W",
      rackUnits: 1,
      status: "online",
      metadata: {
        Throughput: "500 Mbps",
        "Threat Prevention": "200 Mbps",
        VPN: "100 Mbps",
      },
    },
    tags: ["enterprise", "ngfw", "security"],
  },
  {
    id: "fortinet-fg-60e",
    name: "FortiGate 60E",
    vendor: "Fortinet",
    category: "firewall",
    model: "FG-60E",
    description: "Entry-level enterprise firewall",
    defaultProperties: {
      portCount: 10,
      bandwidth: "1 Gbps",
      powerConsumption: "20W",
      rackUnits: 0,
      status: "online",
      metadata: {
        "Firewall Throughput": "1 Gbps",
        "IPS Throughput": "600 Mbps",
        "VPN Throughput": "500 Mbps",
      },
    },
    tags: ["enterprise", "utm", "vpn"],
  },
  {
    id: "sophos-xg-85",
    name: "Sophos XG 85",
    vendor: "Sophos",
    category: "firewall",
    model: "XG 85",
    description: "Next-gen firewall with deep packet inspection",
    defaultProperties: {
      portCount: 6,
      bandwidth: "450 Mbps",
      powerConsumption: "25W",
      status: "online",
      metadata: {
        "Firewall Throughput": "450 Mbps",
        "IPS Throughput": "250 Mbps",
      },
    },
    tags: ["enterprise", "ngfw", "cloud-managed"],
  },

  // === ACCESS POINTS ===
  {
    id: "ubiquiti-u6-pro",
    name: "UniFi 6 Professional",
    vendor: "Ubiquiti",
    category: "ap",
    model: "U6-Pro",
    description: "WiFi 6 access point with 5.3 Gbps aggregate throughput",
    defaultProperties: {
      portCount: 1,
      bandwidth: "2.5 Gbps",
      powerConsumption: "16W",
      status: "online",
      metadata: {
        "WiFi Standard": "WiFi 6 (802.11ax)",
        "2.4GHz": "573 Mbps",
        "5GHz": "4800 Mbps",
        PoE: "802.3at",
      },
    },
    tags: ["wifi6", "prosumer", "unifi"],
  },
  {
    id: "cisco-9120axi",
    name: "Cisco Catalyst 9120AXI",
    vendor: "Cisco",
    category: "ap",
    model: "C9120AXI-E",
    description: "Enterprise WiFi 6 access point",
    defaultProperties: {
      portCount: 1,
      bandwidth: "2.5 Gbps",
      powerConsumption: "30W",
      status: "online",
      metadata: {
        "WiFi Standard": "WiFi 6 (802.11ax)",
        "Spatial Streams": "4x4:4",
        "Internal Antennas": "Yes",
      },
    },
    tags: ["enterprise", "wifi6", "high-density"],
  },
  {
    id: "aruba-ap-515",
    name: "Aruba AP-515",
    vendor: "Aruba",
    category: "ap",
    model: "AP-515",
    description: "802.11ax access point with max 5.4 Gbps data rate",
    defaultProperties: {
      portCount: 1,
      bandwidth: "2.5 Gbps",
      powerConsumption: "22W",
      status: "online",
      metadata: {
        "WiFi Standard": "WiFi 6 (802.11ax)",
        "2.4GHz": "574 Mbps",
        "5GHz": "4800 Mbps",
      },
    },
    tags: ["enterprise", "wifi6", "aruba"],
  },

  // === SERVERS ===
  {
    id: "dell-r640",
    name: "Dell PowerEdge R640",
    vendor: "Dell",
    category: "server",
    model: "R640",
    description: "1U rack server with dual socket support",
    defaultProperties: {
      portCount: 4,
      bandwidth: "10 Gbps",
      powerConsumption: "750W",
      rackUnits: 1,
      status: "online",
      metadata: {
        CPU: "Dual Xeon Scalable",
        RAM: "Up to 3TB",
        Storage: '10x 2.5" bays',
      },
    },
    tags: ["enterprise", "rack", "virtualization"],
  },
  {
    id: "hp-dl360-gen10",
    name: "HPE ProLiant DL360 Gen10",
    vendor: "HPE",
    category: "server",
    model: "DL360 Gen10",
    description: "2-socket 1U rack server for various workloads",
    defaultProperties: {
      portCount: 4,
      bandwidth: "10 Gbps",
      powerConsumption: "800W",
      rackUnits: 1,
      status: "online",
      metadata: {
        CPU: "Dual Xeon Scalable",
        RAM: "Up to 3TB",
        iLO: "iLO 5",
      },
    },
    tags: ["enterprise", "rack", "hpe"],
  },
  {
    id: "supermicro-sys-1029u",
    name: "Supermicro 1029U-TR4",
    vendor: "Supermicro",
    category: "server",
    model: "SYS-1029U-TR4",
    description: "Ultra server with 1U height",
    defaultProperties: {
      portCount: 2,
      bandwidth: "10 Gbps",
      powerConsumption: "600W",
      rackUnits: 1,
      status: "online",
      metadata: {
        CPU: "Dual Xeon Scalable",
        RAM: "Up to 2TB",
      },
    },
    tags: ["budget", "rack", "datacenter"],
  },

  // === NAS ===
  {
    id: "synology-rs2421+",
    name: "Synology RS2421+",
    vendor: "Synology",
    category: "nas",
    model: "RS2421+",
    description: "12-bay rackmount NAS with scalability",
    defaultProperties: {
      portCount: 4,
      bandwidth: "1 Gbps",
      powerConsumption: "150W",
      rackUnits: 2,
      status: "online",
      metadata: {
        Bays: "12",
        RAM: "4GB (expandable to 32GB)",
        "Hot-swappable": "Yes",
      },
    },
    tags: ["storage", "rack", "smb"],
  },
  {
    id: "qnap-ts-h1283xu",
    name: "QNAP TS-h1283XU-RP",
    vendor: "QNAP",
    category: "nas",
    model: "TS-h1283XU-RP",
    description: "12-bay rackmount NAS with redundant PSU",
    defaultProperties: {
      portCount: 2,
      bandwidth: "10 Gbps",
      powerConsumption: "200W",
      rackUnits: 2,
      status: "online",
      metadata: {
        Bays: "12",
        "10GbE": "2 ports",
        "Redundant PSU": "Yes",
      },
    },
    tags: ["storage", "rack", "enterprise"],
  },

  // === CAMERAS ===
  {
    id: "ubiquiti-g4-pro",
    name: "UniFi Protect G4 Pro",
    vendor: "Ubiquiti",
    category: "camera",
    model: "UVC-G4-PRO",
    description: "4K PoE security camera with 3x optical zoom",
    defaultProperties: {
      portCount: 1,
      bandwidth: "100 Mbps",
      powerConsumption: "12W",
      status: "online",
      metadata: {
        Resolution: "4K (3840x2160)",
        Zoom: "3x optical",
        PoE: "802.3af",
        IR: "Yes",
      },
    },
    tags: ["security", "poe", "4k"],
  },
  {
    id: "axis-m3065-v",
    name: "Axis M3065-V",
    vendor: "Axis",
    category: "camera",
    model: "M3065-V",
    description: "Fixed dome camera with 1080p resolution",
    defaultProperties: {
      portCount: 1,
      bandwidth: "100 Mbps",
      powerConsumption: "8W",
      status: "online",
      metadata: {
        Resolution: "1080p",
        PoE: "802.3af",
        WDR: "Wide Dynamic Range",
      },
    },
    tags: ["security", "poe", "indoor"],
  },

  // === CLIENTS ===
  {
    id: "desktop-workstation",
    name: "Desktop Workstation",
    vendor: "Generic",
    category: "client",
    model: "Workstation",
    description: "Standard desktop computer",
    defaultProperties: {
      portCount: 1,
      bandwidth: "1 Gbps",
      powerConsumption: "200W",
      status: "online",
      metadata: {
        Type: "Desktop",
        OS: "Windows/Linux/macOS",
      },
    },
    tags: ["endpoint", "desktop"],
  },
  {
    id: "laptop",
    name: "Laptop",
    vendor: "Generic",
    category: "client",
    model: "Laptop",
    description: "Mobile workstation",
    defaultProperties: {
      portCount: 1,
      bandwidth: "1 Gbps",
      powerConsumption: "65W",
      status: "online",
      metadata: {
        Type: "Laptop",
        Wireless: "Yes",
      },
    },
    tags: ["endpoint", "mobile"],
  },

  // === CLOUD ===
  {
    id: "aws-vpc",
    name: "AWS VPC",
    vendor: "Amazon",
    category: "cloud",
    model: "Virtual Private Cloud",
    description: "Amazon Web Services Virtual Private Cloud",
    defaultProperties: {
      status: "online",
      metadata: {
        Provider: "AWS",
        Type: "VPC",
      },
    },
    tags: ["cloud", "aws", "virtual"],
  },
  {
    id: "azure-vnet",
    name: "Azure VNet",
    vendor: "Microsoft",
    category: "cloud",
    model: "Virtual Network",
    description: "Microsoft Azure Virtual Network",
    defaultProperties: {
      status: "online",
      metadata: {
        Provider: "Azure",
        Type: "VNet",
      },
    },
    tags: ["cloud", "azure", "virtual"],
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: DeviceTemplate["category"]
): DeviceTemplate[] {
  return DEVICE_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get templates by vendor
 */
export function getTemplatesByVendor(vendor: string): DeviceTemplate[] {
  return DEVICE_TEMPLATES.filter(
    (t) => t.vendor.toLowerCase() === vendor.toLowerCase()
  );
}

/**
 * Search templates by name, model, or tags
 */
export function searchTemplates(query: string): DeviceTemplate[] {
  const lowerQuery = query.toLowerCase();
  return DEVICE_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.model.toLowerCase().includes(lowerQuery) ||
      t.vendor.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all unique vendors
 */
export function getVendors(): string[] {
  const vendors = new Set(DEVICE_TEMPLATES.map((t) => t.vendor));
  return Array.from(vendors).sort();
}

/**
 * Get all unique tags
 */
export function getTags(): string[] {
  const tags = new Set(DEVICE_TEMPLATES.flatMap((t) => t.tags));
  return Array.from(tags).sort();
}
