import { Panel } from "reactflow";
import { Card } from "@/components/ui/card";
import { Cable, Wifi, Router, Globe } from "lucide-react";

interface ConnectionLegendProps {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const connectionTypes = [
  {
    type: "ethernet",
    label: "Ethernet",
    color: "#3b82f6",
    icon: Cable,
    description: "1-100 Gbps wired",
  },
  {
    type: "fiber",
    label: "Fiber Optic",
    color: "#ef4444",
    icon: Router,
    description: "10-100 Gbps fiber",
  },
  {
    type: "wireless",
    label: "Wireless",
    color: "#10b981",
    icon: Wifi,
    description: "WiFi connections",
  },
  {
    type: "wan",
    label: "WAN/Internet",
    color: "#8b5cf6",
    icon: Globe,
    description: "External connections",
  },
];

export function ConnectionLegend({ position }: ConnectionLegendProps) {
  const panelPosition = position.split("-") as [
    "top" | "bottom",
    "left" | "right"
  ];

  return (
    <Panel position={`${panelPosition[0]}-${panelPosition[1]}`}>
      <Card className="p-3 bg-background/95 backdrop-blur-sm shadow-lg border">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Connection Types
          </h4>
          <div className="space-y-1.5">
            {connectionTypes.map((conn) => (
              <div
                key={conn.type}
                className="flex items-center gap-2 text-sm group"
              >
                <div
                  className="h-0.5 w-6 rounded-full"
                  style={{ backgroundColor: conn.color }}
                />
                <conn.icon className="w-3 h-3 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{conn.label}</span>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                    {conn.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </Panel>
  );
}
