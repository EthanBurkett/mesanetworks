import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DeviceTemplate,
  DEVICE_TEMPLATES,
  getTemplatesByCategory,
  getTemplatesByVendor,
  getTemplatesByTag,
  searchTemplates,
  getVendors,
  getTags,
  getTemplateCounts,
} from "@/lib/device-templates";
import {
  Router,
  Network,
  Shield,
  Server,
  HardDrive,
  Wifi,
  Camera,
  Monitor,
  Cloud,
  Search,
} from "lucide-react";

interface DeviceTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: DeviceTemplate) => void;
}

const categoryIcons = {
  router: Router,
  switch: Network,
  firewall: Shield,
  server: Server,
  nas: HardDrive,
  "access-point": Wifi,
  camera: Camera,
  client: Monitor,
  cloud: Cloud,
};

const categoryLabels = {
  router: "Routers",
  switch: "Switches",
  firewall: "Firewalls",
  server: "Servers",
  nas: "NAS/Storage",
  "access-point": "Access Points",
  camera: "Cameras",
  client: "Clients",
  cloud: "Cloud",
};

export function DeviceTemplatesDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: DeviceTemplatesDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const vendors = getVendors();
  const tags = getTags();
  const templateCounts = getTemplateCounts();

  // Filter templates based on search, vendor, and tag
  const getFilteredTemplates = (category?: DeviceTemplate["category"]) => {
    let templates = category
      ? getTemplatesByCategory(category)
      : DEVICE_TEMPLATES;

    if (searchQuery) {
      const searchResults = searchTemplates(searchQuery);
      templates = templates.filter((t) =>
        searchResults.find((r) => r.id === t.id)
      );
    }

    if (selectedVendor !== "all") {
      templates = templates.filter(
        (t) => t.vendor.toLowerCase() === selectedVendor.toLowerCase()
      );
    }

    if (selectedTag !== "all") {
      templates = templates.filter((t) => t.tags?.includes(selectedTag));
    }

    // Sort templates
    templates.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "vendor") {
        return a.vendor.localeCompare(b.vendor);
      }
      return 0;
    });

    return templates;
  };

  const handleSelectTemplate = (template: DeviceTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedVendor("all");
    setSelectedTag("all");
    setSortBy("name");
  };

  const TemplateCard = ({ template }: { template: DeviceTemplate }) => {
    const Icon = categoryIcons[template.category];

    return (
      <Card
        className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
        onClick={() => handleSelectTemplate(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.vendor}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>

          {/* Key Specifications */}
          <div className="space-y-1 text-xs">
            {template.portCount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ports:</span>
                <span className="font-medium">{template.portCount}</span>
              </div>
            )}
            {template.bandwidth && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bandwidth:</span>
                <span className="font-medium">{template.bandwidth}</span>
              </div>
            )}
            {template.powerConsumption && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Power:</span>
                <span className="font-medium">{template.powerConsumption}</span>
              </div>
            )}
            {template.rackUnits && template.rackUnits > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rack Units:</span>
                <span className="font-medium">{template.rackUnits}U</span>
              </div>
            )}
            {template.metadata?.Layer && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Layer:</span>
                <span className="font-medium">L{template.metadata.Layer}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {template.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const CategoryContent = ({
    category,
  }: {
    category: DeviceTemplate["category"];
  }) => {
    const templates = getFilteredTemplates(category);

    if (templates.length === 0) {
      return (
        <div className="flex h-[400px] items-center justify-center text-muted-foreground">
          No templates found matching your filters
        </div>
      );
    }

    return (
      <ScrollArea className="h-[600px] pr-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </ScrollArea>
    );
  };

  const AllTemplatesContent = () => {
    const templates = getFilteredTemplates();

    if (templates.length === 0) {
      return (
        <div className="flex h-[400px] items-center justify-center text-muted-foreground">
          No templates found matching your filters
        </div>
      );
    }

    // Group by category
    const groupedTemplates = templates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<DeviceTemplate["category"], DeviceTemplate[]>);

    return (
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([category, templates]) => {
            const Icon = categoryIcons[category as DeviceTemplate["category"]];
            return (
              <div key={category}>
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {categoryLabels[category as DeviceTemplate["category"]]}
                  </h3>
                  <Badge variant="outline">{templates.length}</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[75vw] !w-[75vw] !max-h-[95vh] !h-[95vh]">
        <DialogHeader>
          <DialogTitle>Device Templates Library</DialogTitle>
          <DialogDescription>
            Select a pre-configured device template to add to your network
            design
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filter Bar */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, vendor, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[140px]"
            >
              <option value="all">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor} value={vendor.toLowerCase()}>
                  {vendor}
                </option>
              ))}
            </select>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[140px]"
            >
              <option value="all">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[120px]"
            >
              <option value="name">Sort by Name</option>
              <option value="vendor">Sort by Vendor</option>
            </select>
          </div>
        </div>

        {/* Tabs for Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All ({DEVICE_TEMPLATES.length})
            </TabsTrigger>
            <TabsTrigger value="router">
              Routers ({templateCounts.router || 0})
            </TabsTrigger>
            <TabsTrigger value="switch">
              Switches ({templateCounts.switch || 0})
            </TabsTrigger>
            <TabsTrigger value="firewall">
              Firewalls ({templateCounts.firewall || 0})
            </TabsTrigger>
            <TabsTrigger value="server">
              Servers ({templateCounts.server || 0})
            </TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-4 mt-2">
            <TabsTrigger value="access-point">
              Access Points ({templateCounts["access-point"] || 0})
            </TabsTrigger>
            <TabsTrigger value="nas">
              Storage ({templateCounts.nas || 0})
            </TabsTrigger>
            <TabsTrigger value="camera">
              Cameras ({templateCounts.camera || 0})
            </TabsTrigger>
            <TabsTrigger value="cloud">
              Cloud ({templateCounts.cloud || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <AllTemplatesContent />
          </TabsContent>
          <TabsContent value="router" className="mt-4">
            <CategoryContent category="router" />
          </TabsContent>
          <TabsContent value="switch" className="mt-4">
            <CategoryContent category="switch" />
          </TabsContent>
          <TabsContent value="firewall" className="mt-4">
            <CategoryContent category="firewall" />
          </TabsContent>
          <TabsContent value="server" className="mt-4">
            <CategoryContent category="server" />
          </TabsContent>
          <TabsContent value="access-point" className="mt-4">
            <CategoryContent category="access-point" />
          </TabsContent>
          <TabsContent value="nas" className="mt-4">
            <CategoryContent category="nas" />
          </TabsContent>
          <TabsContent value="camera" className="mt-4">
            <CategoryContent category="camera" />
          </TabsContent>
          <TabsContent value="cloud" className="mt-4">
            <CategoryContent category="cloud" />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
