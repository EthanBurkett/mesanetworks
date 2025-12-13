"use client";

import {
  NetworkTopologyChart,
  NetworkTopologyData,
} from "@/components/network-topology-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

// Example network topologies
const exampleNetworks: Record<string, NetworkTopologyData> = {
  smallOffice: {
    title: "Small Office Network",
    description: "Basic office setup with router, switch, and endpoints",
    devices: [
      {
        id: "isp-1",
        type: "cloud",
        label: "ISP",
        ip: "WAN",
        status: "online",
        location: "External",
      },
      {
        id: "firewall-1",
        type: "firewall",
        label: "Firewall",
        ip: "192.168.1.1",
        status: "online",
        location: "Server Room",
        metadata: { Model: "SonicWall TZ400" },
      },
      {
        id: "router-1",
        type: "router",
        label: "Main Router",
        ip: "192.168.1.2",
        status: "online",
        location: "Server Room",
        vlan: "1",
        metadata: { Model: "Ubiquiti ER-X" },
      },
      {
        id: "switch-1",
        type: "switch",
        label: "Core Switch",
        ip: "192.168.1.10",
        status: "online",
        location: "Server Room",
        vlan: "1",
        metadata: { Ports: "24", Model: "UniFi Switch 24" },
      },
      {
        id: "server-1",
        type: "server",
        label: "File Server",
        ip: "192.168.1.100",
        status: "online",
        location: "Server Room",
        vlan: "10",
        metadata: { OS: "Windows Server 2022" },
      },
      {
        id: "nas-1",
        type: "nas",
        label: "NAS Storage",
        ip: "192.168.1.101",
        status: "online",
        location: "Server Room",
        vlan: "10",
        metadata: { Capacity: "8TB" },
      },
      {
        id: "ap-1",
        type: "ap",
        label: "Office AP",
        ip: "192.168.1.50",
        status: "online",
        location: "Main Office",
        vlan: "20",
        metadata: { SSID: "OfficeWiFi" },
      },
      {
        id: "client-1",
        type: "client",
        label: "Workstation 1",
        ip: "192.168.1.201",
        status: "online",
        location: "Desk 1",
        vlan: "20",
      },
      {
        id: "client-2",
        type: "client",
        label: "Workstation 2",
        ip: "192.168.1.202",
        status: "online",
        location: "Desk 2",
        vlan: "20",
      },
      {
        id: "mobile-1",
        type: "mobile",
        label: "Mobile Device",
        status: "online",
        location: "Wireless",
        vlan: "20",
      },
    ],
    connections: [
      {
        id: "e1",
        source: "isp-1",
        target: "firewall-1",
        type: "wan",
        bandwidth: "1 Gbps",
      },
      {
        id: "e2",
        source: "firewall-1",
        target: "router-1",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },
      {
        id: "e3",
        source: "router-1",
        target: "switch-1",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },
      {
        id: "e4",
        source: "switch-1",
        target: "server-1",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },
      {
        id: "e5",
        source: "switch-1",
        target: "nas-1",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },
      {
        id: "e6",
        source: "switch-1",
        target: "ap-1",
        type: "ethernet",
        label: "PoE",
      },
      { id: "e7", source: "switch-1", target: "client-1", type: "ethernet" },
      { id: "e8", source: "switch-1", target: "client-2", type: "ethernet" },
      {
        id: "e9",
        source: "ap-1",
        target: "mobile-1",
        type: "wireless",
        label: "WiFi",
      },
    ],
  },

  surveillance: {
    title: "Security Camera Network",
    description: "IP camera surveillance system with NVR and PoE switches",
    devices: [
      {
        id: "nvr-1",
        type: "server",
        label: "NVR",
        ip: "192.168.2.10",
        status: "online",
        location: "Security Room",
        vlan: "30",
        metadata: { Storage: "16TB RAID", Channels: "16" },
      },
      {
        id: "switch-poe-1",
        type: "switch",
        label: "PoE Switch 1",
        ip: "192.168.2.20",
        status: "online",
        location: "Building A",
        vlan: "30",
        metadata: { PoE: "240W", Ports: "8" },
      },
      {
        id: "switch-poe-2",
        type: "switch",
        label: "PoE Switch 2",
        ip: "192.168.2.21",
        status: "warning",
        location: "Building B",
        vlan: "30",
        metadata: { PoE: "240W", Ports: "8" },
      },
      {
        id: "cam-1",
        type: "camera",
        label: "Front Entrance",
        ip: "192.168.2.101",
        status: "online",
        location: "Building A - Front",
        vlan: "30",
        metadata: { Resolution: "4MP", Type: "Dome" },
      },
      {
        id: "cam-2",
        type: "camera",
        label: "Parking Lot",
        ip: "192.168.2.102",
        status: "online",
        location: "Building A - Parking",
        vlan: "30",
        metadata: { Resolution: "4MP", Type: "Bullet" },
      },
      {
        id: "cam-3",
        type: "camera",
        label: "Rear Exit",
        ip: "192.168.2.103",
        status: "online",
        location: "Building A - Rear",
        vlan: "30",
      },
      {
        id: "cam-4",
        type: "camera",
        label: "Warehouse",
        ip: "192.168.2.104",
        status: "online",
        location: "Building B - Interior",
        vlan: "30",
      },
      {
        id: "cam-5",
        type: "camera",
        label: "Loading Dock",
        ip: "192.168.2.105",
        status: "offline",
        location: "Building B - Dock",
        vlan: "30",
      },
      {
        id: "cam-6",
        type: "camera",
        label: "Side Entry",
        ip: "192.168.2.106",
        status: "online",
        location: "Building B - Side",
        vlan: "30",
      },
    ],
    connections: [
      {
        id: "c1",
        source: "nvr-1",
        target: "switch-poe-1",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },
      {
        id: "c2",
        source: "nvr-1",
        target: "switch-poe-2",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },
      {
        id: "c3",
        source: "switch-poe-1",
        target: "cam-1",
        type: "ethernet",
        label: "PoE",
      },
      {
        id: "c4",
        source: "switch-poe-1",
        target: "cam-2",
        type: "ethernet",
        label: "PoE",
      },
      {
        id: "c5",
        source: "switch-poe-1",
        target: "cam-3",
        type: "ethernet",
        label: "PoE",
      },
      {
        id: "c6",
        source: "switch-poe-2",
        target: "cam-4",
        type: "ethernet",
        label: "PoE",
      },
      {
        id: "c7",
        source: "switch-poe-2",
        target: "cam-5",
        type: "ethernet",
        label: "PoE",
      },
      {
        id: "c8",
        source: "switch-poe-2",
        target: "cam-6",
        type: "ethernet",
        label: "PoE",
      },
    ],
  },

  enterprise: {
    title: "Enterprise Network Infrastructure",
    description: "Multi-site corporate network with redundancy and VLANs",
    devices: [
      {
        id: "inet",
        type: "cloud",
        label: "Internet",
        status: "online",
      },
      {
        id: "fw-primary",
        type: "firewall",
        label: "Primary Firewall",
        ip: "10.0.0.1",
        status: "online",
        location: "Data Center",
        metadata: { HA: "Active" },
      },
      {
        id: "fw-secondary",
        type: "firewall",
        label: "Secondary Firewall",
        ip: "10.0.0.2",
        status: "online",
        location: "Data Center",
        metadata: { HA: "Standby" },
      },
      {
        id: "core-sw-1",
        type: "switch",
        label: "Core Switch 1",
        ip: "10.0.1.1",
        status: "online",
        location: "Data Center",
        vlan: "1",
        metadata: { Layer: "3", Ports: "48" },
      },
      {
        id: "core-sw-2",
        type: "switch",
        label: "Core Switch 2",
        ip: "10.0.1.2",
        status: "online",
        location: "Data Center",
        vlan: "1",
        metadata: { Layer: "3", Ports: "48" },
      },
      {
        id: "dist-sw-1",
        type: "switch",
        label: "Distribution SW 1",
        ip: "10.10.1.1",
        status: "online",
        location: "Floor 1",
        vlan: "10",
      },
      {
        id: "dist-sw-2",
        type: "switch",
        label: "Distribution SW 2",
        ip: "10.20.1.1",
        status: "online",
        location: "Floor 2",
        vlan: "20",
      },
      {
        id: "server-web",
        type: "server",
        label: "Web Server",
        ip: "10.0.10.100",
        status: "online",
        location: "Data Center",
        vlan: "100",
        metadata: { Role: "Web/App" },
      },
      {
        id: "server-db",
        type: "server",
        label: "Database Server",
        ip: "10.0.10.101",
        status: "online",
        location: "Data Center",
        vlan: "100",
        metadata: { Role: "SQL Server" },
      },
      {
        id: "server-file",
        type: "server",
        label: "File Server",
        ip: "10.0.10.102",
        status: "online",
        location: "Data Center",
        vlan: "100",
      },
      {
        id: "ap-floor1",
        type: "ap",
        label: "Floor 1 APs",
        ip: "10.10.1.50-55",
        status: "online",
        location: "Floor 1",
        vlan: "10",
        metadata: { Count: "6 APs" },
      },
      {
        id: "ap-floor2",
        type: "ap",
        label: "Floor 2 APs",
        ip: "10.20.1.50-55",
        status: "online",
        location: "Floor 2",
        vlan: "20",
        metadata: { Count: "6 APs" },
      },
      {
        id: "clients-1",
        type: "client",
        label: "Floor 1 Workstations",
        ip: "10.10.2.x",
        status: "online",
        location: "Floor 1",
        vlan: "10",
        metadata: { Count: "~50 devices" },
      },
      {
        id: "clients-2",
        type: "client",
        label: "Floor 2 Workstations",
        ip: "10.20.2.x",
        status: "online",
        location: "Floor 2",
        vlan: "20",
        metadata: { Count: "~50 devices" },
      },
    ],
    connections: [
      {
        id: "ent1",
        source: "inet",
        target: "fw-primary",
        type: "wan",
        bandwidth: "10 Gbps",
      },
      {
        id: "ent2",
        source: "inet",
        target: "fw-secondary",
        type: "wan",
        bandwidth: "10 Gbps",
      },
      {
        id: "ent3",
        source: "fw-primary",
        target: "core-sw-1",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "ent4",
        source: "fw-secondary",
        target: "core-sw-2",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "ent5",
        source: "core-sw-1",
        target: "core-sw-2",
        type: "fiber",
        bandwidth: "10 Gbps",
        label: "Stack",
      },
      {
        id: "ent6",
        source: "core-sw-1",
        target: "server-web",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "ent7",
        source: "core-sw-1",
        target: "server-db",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "ent8",
        source: "core-sw-2",
        target: "server-file",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "ent9",
        source: "core-sw-1",
        target: "dist-sw-1",
        type: "fiber",
        bandwidth: "1 Gbps",
      },
      {
        id: "ent10",
        source: "core-sw-2",
        target: "dist-sw-2",
        type: "fiber",
        bandwidth: "1 Gbps",
      },
      {
        id: "ent11",
        source: "dist-sw-1",
        target: "ap-floor1",
        type: "ethernet",
        label: "PoE",
      },
      {
        id: "ent12",
        source: "dist-sw-2",
        target: "ap-floor2",
        type: "ethernet",
        label: "PoE",
      },
      {
        id: "ent13",
        source: "dist-sw-1",
        target: "clients-1",
        type: "ethernet",
      },
      {
        id: "ent14",
        source: "dist-sw-2",
        target: "clients-2",
        type: "ethernet",
      },
    ],
  },
};

export default function NetworkTopologyDemo() {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("smallOffice");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Network Topology Visualizer
          </h1>
          <p className="text-lg text-muted-foreground">
            Interactive, auto-formatted network diagrams with device details and
            connection types
          </p>
        </div>

        {/* Network Selector */}
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold">Select Network:</span>
            <div className="flex gap-2">
              <Button
                variant={
                  selectedNetwork === "smallOffice" ? "default" : "outline"
                }
                onClick={() => setSelectedNetwork("smallOffice")}
              >
                Small Office
              </Button>
              <Button
                variant={
                  selectedNetwork === "surveillance" ? "default" : "outline"
                }
                onClick={() => setSelectedNetwork("surveillance")}
              >
                Surveillance System
              </Button>
              <Button
                variant={
                  selectedNetwork === "enterprise" ? "default" : "outline"
                }
                onClick={() => setSelectedNetwork("enterprise")}
              >
                Enterprise Network
              </Button>
            </div>
          </div>
        </Card>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="font-semibold mb-1">🎨 Auto-Layout</div>
            <p className="text-sm text-muted-foreground">
              Multiple layout algorithms: Auto, Hierarchical, and Radial
            </p>
          </Card>
          <Card className="p-4">
            <div className="font-semibold mb-1">🔍 Interactive</div>
            <p className="text-sm text-muted-foreground">
              Zoom, pan, drag nodes, and click for device details
            </p>
          </Card>
          <Card className="p-4">
            <div className="font-semibold mb-1">📊 Real-time Stats</div>
            <p className="text-sm text-muted-foreground">
              Device counts, online status, VLANs, and connections
            </p>
          </Card>
          <Card className="p-4">
            <div className="font-semibold mb-1">🎯 Type-aware</div>
            <p className="text-sm text-muted-foreground">
              10 device types with color coding and icons
            </p>
          </Card>
        </div>

        {/* Main Topology Chart */}
        <NetworkTopologyChart
          data={exampleNetworks[selectedNetwork]}
          height="700px"
          onNodeClick={(device) => {
            setSelectedDevice(device);
          }}
        />

        {/* Selected Device Details */}
        {selectedDevice && (
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Selected Device Details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click on any node to view details
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDevice(null)}
              >
                Close
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Device Name
                </div>
                <div className="font-semibold text-lg">
                  {selectedDevice.label}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Type</div>
                <Badge>{selectedDevice.type.toUpperCase()}</Badge>
              </div>
              {selectedDevice.ip && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    IP Address
                  </div>
                  <div className="font-mono">{selectedDevice.ip}</div>
                </div>
              )}
              {selectedDevice.location && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Location
                  </div>
                  <div>{selectedDevice.location}</div>
                </div>
              )}
              {selectedDevice.vlan && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">VLAN</div>
                  <Badge variant="secondary">VLAN {selectedDevice.vlan}</Badge>
                </div>
              )}
              {selectedDevice.status && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Status
                  </div>
                  <Badge
                    variant={
                      selectedDevice.status === "online"
                        ? "default"
                        : selectedDevice.status === "offline"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedDevice.status.toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
            {selectedDevice.metadata &&
              Object.keys(selectedDevice.metadata).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">
                    Additional Information
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedDevice.metadata).map(
                      ([key, value]) => (
                        <div key={key}>
                          <span className="text-sm font-medium">{key}:</span>{" "}
                          <span className="text-sm text-muted-foreground">
                            {value as string}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </Card>
        )}

        {/* Usage Example */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-3">Usage Example</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            {`import { NetworkTopologyChart } from "@/components/network-topology-chart";

const networkData = {
  title: "My Network",
  description: "Office network topology",
  devices: [
    {
      id: "router-1",
      type: "router",
      label: "Main Router",
      ip: "192.168.1.1",
      status: "online",
      location: "Server Room",
      metadata: { Model: "Ubiquiti ER-X" }
    },
    // ... more devices
  ],
  connections: [
    {
      id: "c1",
      source: "router-1",
      target: "switch-1",
      type: "ethernet",
      bandwidth: "1 Gbps"
    },
    // ... more connections
  ]
};

<NetworkTopologyChart 
  data={networkData} 
  onNodeClick={(device) => console.log(device)}
/>`}
          </pre>
        </Card>
      </div>
    </div>
  );
}
