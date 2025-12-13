"use client";

import { NetworkTopologyChart } from "@/components/network-topology-chart";
import type { NetworkTopologyData } from "@/components/network-topology-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NetworkShowcaseSection() {
  // Small Business Network (5-20 employees)
  const smallBusinessNetwork: NetworkTopologyData = {
    title: "Small Business Network",
    description:
      "Simple, cost-effective network for small offices with 5-20 employees",
    devices: [
      {
        id: "isp-1",
        type: "cloud",
        label: "Internet Provider",
        status: "online",
        location: "External",
      },
      {
        id: "router-1",
        type: "router",
        label: "Gateway Router",
        ip: "192.168.1.1",
        location: "Main Office",
        status: "online",
        metadata: { Model: "UniFi Dream Machine", Ports: "8" },
      },
      {
        id: "switch-1",
        type: "switch",
        label: "Office Switch",
        ip: "192.168.1.2",
        location: "Main Office",
        vlan: "10, 20",
        status: "online",
        metadata: { Model: "UniFi Switch 24", Ports: "24" },
      },
      {
        id: "ap-1",
        type: "ap",
        label: "Office WiFi",
        ip: "192.168.1.10",
        location: "Main Office",
        vlan: "10",
        status: "online",
        metadata: { Model: "UniFi U6 Pro", Coverage: "2000 sq ft" },
      },
      {
        id: "server-1",
        type: "server",
        label: "File Server",
        ip: "192.168.1.100",
        location: "Main Office",
        vlan: "20",
        status: "online",
        metadata: { OS: "Windows Server", Storage: "4TB" },
      },
      {
        id: "nas-1",
        type: "nas",
        label: "Backup NAS",
        ip: "192.168.1.101",
        location: "Main Office",
        vlan: "20",
        status: "online",
        metadata: { Model: "Synology DS920+", Capacity: "16TB" },
      },
    ],
    connections: [
      {
        id: "e1",
        source: "isp-1",
        target: "router-1",
        bandwidth: "500 Mbps",
        type: "wan",
        label: "500 Mbps",
      },
      {
        id: "e2",
        source: "router-1",
        target: "switch-1",
        bandwidth: "1 Gbps",
        type: "ethernet",
        label: "1 Gbps",
      },
      {
        id: "e3",
        source: "switch-1",
        target: "ap-1",
        bandwidth: "1 Gbps",
        type: "ethernet",
        label: "1 Gbps",
        vlan: "10",
      },
      {
        id: "e4",
        source: "switch-1",
        target: "server-1",
        bandwidth: "1 Gbps",
        type: "ethernet",
        label: "1 Gbps",
        vlan: "20",
      },
      {
        id: "e5",
        source: "switch-1",
        target: "nas-1",
        bandwidth: "1 Gbps",
        type: "ethernet",
        label: "1 Gbps",
        vlan: "20",
      },
    ],
  };

  // Medium Business Network (50-200 employees)
  const mediumBusinessNetwork: NetworkTopologyData = {
    title: "Medium Business Network",
    description:
      "Scalable network infrastructure for growing businesses with 50-200 employees",
    devices: [
      {
        id: "isp-1",
        type: "cloud",
        label: "ISP Primary",
        status: "online",
        location: "External",
      },
      {
        id: "fw-1",
        type: "firewall",
        label: "Firewall",
        ip: "10.0.0.1",
        location: "Main Office",
        status: "online",
        metadata: { Model: "Fortinet FortiGate 60F" },
      },
      {
        id: "core-1",
        type: "switch",
        label: "Core Switch",
        ip: "10.0.1.1",
        location: "Server Room",
        vlan: "ALL",
        status: "online",
        metadata: { Model: "Cisco Catalyst 9300", Ports: "48" },
      },
      {
        id: "dist-floor1",
        type: "switch",
        label: "Floor 1 Switch",
        ip: "10.0.10.1",
        location: "Floor 1",
        vlan: "10",
        status: "online",
        metadata: { Model: "UniFi Switch 48", Ports: "48" },
      },
      {
        id: "dist-floor2",
        type: "switch",
        label: "Floor 2 Switch",
        ip: "10.0.20.1",
        location: "Floor 2",
        vlan: "20",
        status: "online",
        metadata: { Model: "UniFi Switch 48", Ports: "48" },
      },
      {
        id: "dist-server",
        type: "switch",
        label: "Server Switch",
        ip: "10.0.100.1",
        location: "Server Room",
        vlan: "100",
        status: "online",
        metadata: { Model: "Cisco Catalyst 3850", Ports: "24" },
      },
      {
        id: "ap-1",
        type: "ap",
        label: "Floor 1 WiFi",
        ip: "10.0.10.10",
        location: "Floor 1",
        vlan: "10",
        status: "online",
        metadata: { Model: "UniFi U6 Enterprise" },
      },
      {
        id: "ap-2",
        type: "ap",
        label: "Floor 2 WiFi",
        ip: "10.0.20.10",
        location: "Floor 2",
        vlan: "20",
        status: "online",
        metadata: { Model: "UniFi U6 Enterprise" },
      },
      {
        id: "server-db",
        type: "server",
        label: "Database Server",
        ip: "10.0.100.10",
        location: "Server Room",
        vlan: "100",
        status: "online",
        metadata: { OS: "Linux", RAM: "128GB" },
      },
      {
        id: "server-app",
        type: "server",
        label: "App Server",
        ip: "10.0.100.11",
        location: "Server Room",
        vlan: "100",
        status: "online",
        metadata: { OS: "Linux", RAM: "64GB" },
      },
      {
        id: "nas-1",
        type: "nas",
        label: "Storage NAS",
        ip: "10.0.100.20",
        location: "Server Room",
        vlan: "100",
        status: "online",
        metadata: { Model: "QNAP TS-873A", Capacity: "48TB" },
      },
    ],
    connections: [
      {
        id: "e1",
        source: "isp-1",
        target: "fw-1",
        bandwidth: "1 Gbps",
        type: "wan",
        label: "1 Gbps",
      },
      {
        id: "e2",
        source: "fw-1",
        target: "core-1",
        bandwidth: "10 Gbps",
        type: "fiber",
        label: "10 Gbps",
      },
      {
        id: "e3",
        source: "core-1",
        target: "dist-floor1",
        bandwidth: "10 Gbps",
        type: "fiber",
        label: "10 Gbps",
      },
      {
        id: "e4",
        source: "core-1",
        target: "dist-floor2",
        bandwidth: "10 Gbps",
        type: "fiber",
        label: "10 Gbps",
      },
      {
        id: "e5",
        source: "core-1",
        target: "dist-server",
        bandwidth: "10 Gbps",
        type: "fiber",
        label: "10 Gbps",
      },
      {
        id: "e6",
        source: "dist-floor1",
        target: "ap-1",
        bandwidth: "1 Gbps",
        type: "ethernet",
        label: "1 Gbps",
      },
      {
        id: "e7",
        source: "dist-floor2",
        target: "ap-2",
        bandwidth: "1 Gbps",
        type: "ethernet",
        label: "1 Gbps",
      },
      {
        id: "e8",
        source: "dist-server",
        target: "server-db",
        bandwidth: "10 Gbps",
        type: "fiber",
        label: "10 Gbps",
      },
      {
        id: "e9",
        source: "dist-server",
        target: "server-app",
        bandwidth: "10 Gbps",
        type: "fiber",
        label: "10 Gbps",
      },
      {
        id: "e10",
        source: "dist-server",
        target: "nas-1",
        bandwidth: "10 Gbps",
        type: "fiber",
        label: "10 Gbps",
      },
    ],
  };

  // Enterprise Network (existing)
  const enterpriseNetwork: NetworkTopologyData = {
    title: "Enterprise Network Infrastructure",
    description:
      "Real-world enterprise network design with multi-site connectivity, VLANs, and redundancy",
    devices: [
      // Internet & Edge
      {
        id: "isp-1",
        type: "cloud",
        label: "ISP Primary",
        status: "online",
        location: "External",
      },
      {
        id: "isp-2",
        type: "cloud",
        label: "ISP Backup",
        status: "online",
        location: "External",
      },
      // Main Site - Edge & Core
      {
        id: "fw-1",
        type: "firewall",
        label: "Firewall Primary",
        ip: "10.0.0.1",
        location: "Main Site",
        status: "online",
        metadata: { Model: "Fortinet FortiGate 600E" },
      },
      {
        id: "fw-2",
        type: "firewall",
        label: "Firewall Backup",
        ip: "10.0.0.2",
        location: "Main Site",
        status: "online",
        metadata: { Model: "Fortinet FortiGate 600E" },
      },
      {
        id: "core-1",
        type: "switch",
        label: "Core Switch 1",
        ip: "10.0.1.1",
        location: "Main DC",
        vlan: "ALL",
        status: "online",
        metadata: { Model: "Cisco Catalyst 9500", Ports: "48" },
      },
      {
        id: "core-2",
        type: "switch",
        label: "Core Switch 2",
        ip: "10.0.1.2",
        location: "Main DC",
        vlan: "ALL",
        status: "online",
        metadata: { Model: "Cisco Catalyst 9500", Ports: "48" },
      },
      // Distribution Layer
      {
        id: "dist-office",
        type: "switch",
        label: "Office Distribution",
        ip: "10.0.10.1",
        location: "Main Site",
        vlan: "10, 20, 30",
        status: "online",
        metadata: { Model: "UniFi Switch 24", Ports: "24" },
      },
      {
        id: "dist-server",
        type: "switch",
        label: "Server Distribution",
        ip: "10.0.100.1",
        location: "Main DC",
        vlan: "100",
        status: "online",
        metadata: { Model: "UniFi Switch Pro 24", Ports: "24" },
      },
      {
        id: "dist-guest",
        type: "switch",
        label: "Guest Distribution",
        ip: "10.0.200.1",
        location: "Main Site",
        vlan: "200",
        status: "online",
        metadata: { Model: "UniFi Switch 24", Ports: "24" },
      },
      // Servers & Infrastructure
      {
        id: "server-db",
        type: "server",
        label: "Database Server",
        ip: "10.0.100.10",
        location: "Main DC",
        vlan: "100",
        status: "online",
        metadata: { OS: "Ubuntu Server 22.04", RAM: "128GB" },
      },
      {
        id: "server-app",
        type: "server",
        label: "Application Server",
        ip: "10.0.100.11",
        location: "Main DC",
        vlan: "100",
        status: "online",
        metadata: { OS: "Ubuntu Server 22.04", RAM: "64GB" },
      },
      {
        id: "server-backup",
        type: "nas",
        label: "Backup NAS",
        ip: "10.0.100.20",
        location: "Main DC",
        vlan: "100",
        status: "online",
        metadata: { Capacity: "100TB", Model: "Synology RS4021xs+" },
      },
      // Access Layer - Office
      {
        id: "sw-floor1",
        type: "switch",
        label: "Floor 1 Switch",
        ip: "10.0.10.10",
        location: "Floor 1",
        vlan: "10",
        status: "online",
        metadata: { Model: "UniFi Switch 16 PoE", Ports: "16" },
      },
      {
        id: "sw-floor2",
        type: "switch",
        label: "Floor 2 Switch",
        ip: "10.0.10.20",
        location: "Floor 2",
        vlan: "20",
        status: "online",
        metadata: { Model: "UniFi Switch 16 PoE", Ports: "16" },
      },
      {
        id: "sw-floor3",
        type: "switch",
        label: "Floor 3 Switch",
        ip: "10.0.10.30",
        location: "Floor 3",
        vlan: "30",
        status: "online",
        metadata: { Model: "UniFi Switch 16 PoE", Ports: "16" },
      },
      // Wireless
      {
        id: "ap-floor1",
        type: "ap",
        label: "Floor 1 AP",
        ip: "10.0.10.51",
        location: "Floor 1",
        vlan: "10",
        status: "online",
        metadata: { Model: "UniFi U6 Enterprise", SSID: "Mesa-Corp" },
      },
      {
        id: "ap-floor2",
        type: "ap",
        label: "Floor 2 AP",
        ip: "10.0.10.52",
        location: "Floor 2",
        vlan: "20",
        status: "online",
        metadata: { Model: "UniFi U6 Enterprise", SSID: "Mesa-Corp" },
      },
      {
        id: "ap-floor3",
        type: "ap",
        label: "Floor 3 AP",
        ip: "10.0.10.53",
        location: "Floor 3",
        vlan: "30",
        status: "online",
        metadata: { Model: "UniFi U6 Enterprise", SSID: "Mesa-Corp" },
      },
      {
        id: "ap-guest",
        type: "ap",
        label: "Guest WiFi",
        ip: "10.0.200.50",
        location: "Lobby",
        vlan: "200",
        status: "online",
        metadata: { Model: "UniFi U6 Lite", SSID: "Mesa-Guest" },
      },
      // Branch Office
      {
        id: "router-branch",
        type: "router",
        label: "Branch Router",
        ip: "10.1.0.1",
        location: "Branch Office",
        status: "online",
        metadata: { Model: "Ubiquiti EdgeRouter 12", WAN: "100 Mbps" },
      },
      {
        id: "sw-branch",
        type: "switch",
        label: "Branch Switch",
        ip: "10.1.1.1",
        location: "Branch Office",
        vlan: "50",
        status: "online",
        metadata: { Model: "UniFi Switch 24 PoE", Ports: "24" },
      },
      {
        id: "ap-branch",
        type: "ap",
        label: "Branch AP",
        ip: "10.1.1.50",
        location: "Branch Office",
        vlan: "50",
        status: "online",
        metadata: { Model: "UniFi U6 Pro", SSID: "Mesa-Branch" },
      },
      // Security & Surveillance
      {
        id: "nvr-main",
        type: "nas",
        label: "NVR Storage",
        ip: "10.0.100.30",
        location: "Main DC",
        vlan: "100",
        status: "online",
        metadata: { Capacity: "50TB", Retention: "90 days" },
      },
      {
        id: "cam-entrance",
        type: "camera",
        label: "Entrance Camera",
        ip: "10.0.100.101",
        location: "Entrance",
        vlan: "100",
        status: "online",
        metadata: { Model: "UniFi G4 Pro", Resolution: "4K" },
      },
      {
        id: "cam-parking",
        type: "camera",
        label: "Parking Camera",
        ip: "10.0.100.102",
        location: "Parking Lot",
        vlan: "100",
        status: "online",
        metadata: { Model: "UniFi G4 Bullet", Resolution: "4K" },
      },
    ],
    connections: [
      // ISP to Firewalls
      {
        id: "e1",
        source: "isp-1",
        target: "fw-1",
        type: "wan",
        bandwidth: "1 Gbps",
      },
      {
        id: "e2",
        source: "isp-2",
        target: "fw-2",
        type: "wan",
        bandwidth: "1 Gbps",
      },

      // Firewall to Core (Redundant)
      {
        id: "e3",
        source: "fw-1",
        target: "core-1",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "e4",
        source: "fw-1",
        target: "core-2",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "e5",
        source: "fw-2",
        target: "core-1",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "e6",
        source: "fw-2",
        target: "core-2",
        type: "fiber",
        bandwidth: "10 Gbps",
      },

      // Core to Distribution
      {
        id: "e7",
        source: "core-1",
        target: "dist-office",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "e8",
        source: "core-2",
        target: "dist-office",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "e9",
        source: "core-1",
        target: "dist-server",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "e10",
        source: "core-2",
        target: "dist-server",
        type: "fiber",
        bandwidth: "10 Gbps",
      },
      {
        id: "e11",
        source: "core-1",
        target: "dist-guest",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },

      // Distribution to Servers
      {
        id: "e12",
        source: "dist-server",
        target: "server-db",
        type: "ethernet",
        bandwidth: "10 Gbps",
      },
      {
        id: "e13",
        source: "dist-server",
        target: "server-app",
        type: "ethernet",
        bandwidth: "10 Gbps",
      },
      {
        id: "e14",
        source: "dist-server",
        target: "server-backup",
        type: "ethernet",
        bandwidth: "10 Gbps",
      },
      {
        id: "e15",
        source: "dist-server",
        target: "nvr-main",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },

      // Distribution to Access Switches
      {
        id: "e16",
        source: "dist-office",
        target: "sw-floor1",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },
      {
        id: "e17",
        source: "dist-office",
        target: "sw-floor2",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },
      {
        id: "e18",
        source: "dist-office",
        target: "sw-floor3",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },

      // Access Switches to APs
      {
        id: "e19",
        source: "sw-floor1",
        target: "ap-floor1",
        type: "ethernet",
        bandwidth: "1 Gbps PoE",
      },
      {
        id: "e20",
        source: "sw-floor2",
        target: "ap-floor2",
        type: "ethernet",
        bandwidth: "1 Gbps PoE",
      },
      {
        id: "e21",
        source: "sw-floor3",
        target: "ap-floor3",
        type: "ethernet",
        bandwidth: "1 Gbps PoE",
      },

      // Guest WiFi
      {
        id: "e22",
        source: "dist-guest",
        target: "ap-guest",
        type: "ethernet",
        bandwidth: "1 Gbps PoE",
      },

      // Branch Office WAN
      {
        id: "e23",
        source: "fw-1",
        target: "router-branch",
        type: "wan",
        bandwidth: "100 Mbps VPN",
      },
      {
        id: "e24",
        source: "router-branch",
        target: "sw-branch",
        type: "ethernet",
        bandwidth: "1 Gbps",
      },
      {
        id: "e25",
        source: "sw-branch",
        target: "ap-branch",
        type: "ethernet",
        bandwidth: "1 Gbps PoE",
      },

      // Surveillance
      {
        id: "e26",
        source: "nvr-main",
        target: "cam-entrance",
        type: "ethernet",
        bandwidth: "PoE",
      },
      {
        id: "e27",
        source: "nvr-main",
        target: "cam-parking",
        type: "ethernet",
        bandwidth: "PoE",
      },
    ],
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Network Design Showcase</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our interactive network topology visualizations tailored for
            different business sizes. From small startups to large enterprises,
            see how we design scalable, secure infrastructure.
          </p>
        </div>

        <Tabs defaultValue="enterprise" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="small">Small Business</TabsTrigger>
            <TabsTrigger value="medium">Medium Business</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
          </TabsList>

          <TabsContent value="small">
            <div className="bg-card rounded-lg border shadow-lg p-6">
              <NetworkTopologyChart
                data={smallBusinessNetwork}
                className="min-h-[600px]"
              />
            </div>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Cost-Effective</h3>
                <p className="text-muted-foreground text-sm">
                  Simple topology with essential components keeps costs low
                  while delivering reliable performance.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Easy Management</h3>
                <p className="text-muted-foreground text-sm">
                  Unified controller simplifies network management and
                  monitoring for small IT teams.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Room to Grow</h3>
                <p className="text-muted-foreground text-sm">
                  Designed with scalability in mind to support business growth
                  without major overhauls.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="medium">
            <div className="bg-card rounded-lg border shadow-lg p-6">
              <NetworkTopologyChart
                data={mediumBusinessNetwork}
                className="min-h-[700px]"
              />
            </div>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Layer 3 Core</h3>
                <p className="text-muted-foreground text-sm">
                  Advanced routing capabilities with 10 Gbps fiber backbone for
                  high-performance inter-VLAN traffic.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">
                  VLAN Segmentation
                </h3>
                <p className="text-muted-foreground text-sm">
                  Separate VLANs for each floor and servers enhance security and
                  optimize network performance.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Scalable Design</h3>
                <p className="text-muted-foreground text-sm">
                  Hierarchical architecture supports growth from 50 to 500
                  employees with minimal changes.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="enterprise">
            <div className="bg-card rounded-lg border shadow-lg p-6">
              <NetworkTopologyChart
                data={enterpriseNetwork}
                className="min-h-[800px]"
              />
            </div>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">
                  High Availability
                </h3>
                <p className="text-muted-foreground text-sm">
                  Dual ISPs, redundant firewalls, and core switches ensure
                  99.99% uptime for critical operations.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">
                  Secure Segmentation
                </h3>
                <p className="text-muted-foreground text-sm">
                  VLANs separate traffic between servers, offices, guests, and
                  surveillance for enhanced security.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Multi-Site Ready</h3>
                <p className="text-muted-foreground text-sm">
                  Branch office connectivity with VPN and dedicated WAN links
                  supports distributed teams seamlessly.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
