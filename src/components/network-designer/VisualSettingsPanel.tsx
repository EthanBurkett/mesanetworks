import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BackgroundVariant } from "reactflow";
import { Palette, Zap, Grid3x3, Map, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface VisualSettings {
  // Theme & Colors
  nodeColorScheme: "default" | "professional" | "vibrant" | "pastel" | "custom";
  customNodeColors: {
    router: string;
    switch: string;
    firewall: string;
    server: string;
    nas: string;
    ap: string;
    camera: string;
    cloud: string;
    client: string;
  };

  // Animations
  connectionAnimation: boolean;
  animationSpeed: number;
  animationType: "flow" | "pulse" | "dash";

  // Background
  backgroundPattern: BackgroundVariant;
  backgroundGap: number;
  backgroundSize: number;
  backgroundOpacity: number;

  // Minimap
  minimapEnabled: boolean;
  minimapPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  minimapSize: number;

  // Legend
  showLegend: boolean;
  legendPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const defaultVisualSettings: VisualSettings = {
  nodeColorScheme: "default",
  customNodeColors: {
    router: "#3b82f6",
    switch: "#10b981",
    firewall: "#ef4444",
    server: "#8b5cf6",
    nas: "#f59e0b",
    ap: "#06b6d4",
    camera: "#ec4899",
    cloud: "#6366f1",
    client: "#64748b",
  },
  connectionAnimation: false,
  animationSpeed: 1,
  animationType: "flow",
  backgroundPattern: BackgroundVariant.Dots,
  backgroundGap: 16,
  backgroundSize: 1,
  backgroundOpacity: 0.5,
  minimapEnabled: true,
  minimapPosition: "bottom-right",
  minimapSize: 1,
  showLegend: true,
  legendPosition: "top-right",
};

const colorSchemes = {
  default: {
    router: "#3b82f6",
    switch: "#10b981",
    firewall: "#ef4444",
    server: "#8b5cf6",
    nas: "#f59e0b",
    ap: "#06b6d4",
    camera: "#ec4899",
    cloud: "#6366f1",
    client: "#64748b",
  },
  professional: {
    router: "#1e40af",
    switch: "#065f46",
    firewall: "#991b1b",
    server: "#5b21b6",
    nas: "#92400e",
    ap: "#155e75",
    camera: "#9f1239",
    cloud: "#4338ca",
    client: "#475569",
  },
  vibrant: {
    router: "#2563eb",
    switch: "#059669",
    firewall: "#dc2626",
    server: "#7c3aed",
    nas: "#d97706",
    ap: "#0891b2",
    camera: "#db2777",
    cloud: "#4f46e5",
    client: "#64748b",
  },
  pastel: {
    router: "#93c5fd",
    switch: "#6ee7b7",
    firewall: "#fca5a5",
    server: "#c4b5fd",
    nas: "#fcd34d",
    ap: "#67e8f9",
    camera: "#f9a8d4",
    cloud: "#a5b4fc",
    client: "#cbd5e1",
  },
};

interface VisualSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: VisualSettings;
  onSettingsChange: (settings: VisualSettings) => void;
}

export function VisualSettingsPanel({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: VisualSettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const updateSettings = (updates: Partial<VisualSettings>) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const applyColorScheme = (scheme: keyof typeof colorSchemes) => {
    updateSettings({
      nodeColorScheme: scheme,
      customNodeColors: colorSchemes[scheme],
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Visual Settings</SheetTitle>
          <SheetDescription>
            Customize the appearance and behavior of your network diagram
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="colors" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors" className="text-xs">
              <Palette className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="animations" className="text-xs">
              <Zap className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="background" className="text-xs">
              <Grid3x3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="display" className="text-xs">
              <Map className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* Colors & Themes Tab */}
          <TabsContent value="colors" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <Select
                value={localSettings.nodeColorScheme}
                onValueChange={(value) =>
                  applyColorScheme(value as keyof typeof colorSchemes)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                  <SelectItem value="pastel">Pastel</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Device Colors</Label>
              {Object.entries(localSettings.customNodeColors).map(
                ([type, color]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between gap-2"
                  >
                    <Label className="text-sm capitalize">{type}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          updateSettings({
                            nodeColorScheme: "custom",
                            customNodeColors: {
                              ...localSettings.customNodeColors,
                              [type]: e.target.value,
                            },
                          });
                        }}
                        className="h-8 w-16 rounded border cursor-pointer"
                      />
                      <span className="text-xs text-muted-foreground font-mono">
                        {color}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => applyColorScheme("default")}
              className="w-full"
            >
              Reset to Default
            </Button>
          </TabsContent>

          {/* Animations Tab */}
          <TabsContent value="animations" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Connection Animation</Label>
                <p className="text-sm text-muted-foreground">
                  Animate connection flows
                </p>
              </div>
              <Switch
                checked={localSettings.connectionAnimation}
                onCheckedChange={(checked) =>
                  updateSettings({ connectionAnimation: checked })
                }
              />
            </div>

            {localSettings.connectionAnimation && (
              <>
                <div className="space-y-2">
                  <Label>Animation Type</Label>
                  <Select
                    value={localSettings.animationType}
                    onValueChange={(value) =>
                      updateSettings({
                        animationType: value as "flow" | "pulse" | "dash",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flow">Flow</SelectItem>
                      <SelectItem value="pulse">Pulse</SelectItem>
                      <SelectItem value="dash">Dashed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Animation Speed</Label>
                    <span className="text-sm text-muted-foreground">
                      {localSettings.animationSpeed}x
                    </span>
                  </div>
                  <Slider
                    value={[localSettings.animationSpeed]}
                    onValueChange={([value]) =>
                      updateSettings({ animationSpeed: value })
                    }
                    min={0.5}
                    max={3}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </>
            )}

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Animations may impact performance on large networks with many
                  connections
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Pattern</Label>
              <Select
                value={localSettings.backgroundPattern}
                onValueChange={(value) =>
                  updateSettings({
                    backgroundPattern: value as BackgroundVariant,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BackgroundVariant.Dots}>Dots</SelectItem>
                  <SelectItem value={BackgroundVariant.Lines}>Lines</SelectItem>
                  <SelectItem value={BackgroundVariant.Cross}>Cross</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Gap Size</Label>
                <span className="text-sm text-muted-foreground">
                  {localSettings.backgroundGap}px
                </span>
              </div>
              <Slider
                value={[localSettings.backgroundGap]}
                onValueChange={([value]) =>
                  updateSettings({ backgroundGap: value })
                }
                min={8}
                max={32}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Dot/Line Size</Label>
                <span className="text-sm text-muted-foreground">
                  {localSettings.backgroundSize}px
                </span>
              </div>
              <Slider
                value={[localSettings.backgroundSize]}
                onValueChange={([value]) =>
                  updateSettings({ backgroundSize: value })
                }
                min={0.5}
                max={3}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opacity</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(localSettings.backgroundOpacity * 100)}%
                </span>
              </div>
              <Slider
                value={[localSettings.backgroundOpacity]}
                onValueChange={([value]) =>
                  updateSettings({ backgroundOpacity: value })
                }
                min={0.1}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Minimap</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Minimap</Label>
                  <p className="text-sm text-muted-foreground">
                    Display navigation minimap
                  </p>
                </div>
                <Switch
                  checked={localSettings.minimapEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings({ minimapEnabled: checked })
                  }
                />
              </div>

              {localSettings.minimapEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select
                      value={localSettings.minimapPosition}
                      onValueChange={(value) =>
                        updateSettings({
                          minimapPosition: value as any,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">
                          Bottom Right
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Size</Label>
                      <span className="text-sm text-muted-foreground">
                        {localSettings.minimapSize}x
                      </span>
                    </div>
                    <Slider
                      value={[localSettings.minimapSize]}
                      onValueChange={([value]) =>
                        updateSettings({ minimapSize: value })
                      }
                      min={0.5}
                      max={2}
                      step={0.25}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-sm font-semibold">Legend</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Legend</Label>
                  <p className="text-sm text-muted-foreground">
                    Display connection types key
                  </p>
                </div>
                <Switch
                  checked={localSettings.showLegend}
                  onCheckedChange={(checked) =>
                    updateSettings({ showLegend: checked })
                  }
                />
              </div>

              {localSettings.showLegend && (
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={localSettings.legendPosition}
                    onValueChange={(value) =>
                      updateSettings({
                        legendPosition: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
