import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
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
import { DevicePaletteItem } from "./DevicePaletteItem";
import type { DeviceType } from "@/components/network-topology-chart";

interface DevicePaletteSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const deviceTypes = [
  {
    type: "router" as DeviceType,
    label: "Router",
    icon: <Router className="w-5 h-5" />,
  },
  {
    type: "switch" as DeviceType,
    label: "Switch",
    icon: <Network className="w-5 h-5" />,
  },
  {
    type: "firewall" as DeviceType,
    label: "Firewall",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    type: "server" as DeviceType,
    label: "Server",
    icon: <Server className="w-5 h-5" />,
  },
  {
    type: "nas" as DeviceType,
    label: "NAS",
    icon: <HardDrive className="w-5 h-5" />,
  },
  {
    type: "ap" as DeviceType,
    label: "Access Point",
    icon: <Wifi className="w-5 h-5" />,
  },
  {
    type: "camera" as DeviceType,
    label: "Camera",
    icon: <Camera className="w-5 h-5" />,
  },
  {
    type: "cloud" as DeviceType,
    label: "Cloud/ISP",
    icon: <Cloud className="w-5 h-5" />,
  },
];

export function DevicePaletteSidebar({
  searchQuery,
  onSearchChange,
}: DevicePaletteSidebarProps) {
  const filteredDeviceTypes = deviceTypes.filter((device) =>
    device.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 border-r bg-background p-4 overflow-y-auto">
      <h2 className="font-semibold text-lg mb-4">Device Palette</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Drag devices onto the canvas
      </p>

      {/* Search Input */}
      <div className="relative mb-4 flex flex-row justify-center">
        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search devices..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="space-y-2">
        {filteredDeviceTypes.map((device) => (
          <DevicePaletteItem key={device.type} {...device} />
        ))}
        {filteredDeviceTypes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No devices found
          </div>
        )}
      </div>
    </div>
  );
}
