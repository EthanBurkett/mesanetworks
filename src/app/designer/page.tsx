import { NetworkDesigner } from "@/components/network-designer";

export default function DesignerPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Network Designer</h1>
            <p className="text-sm text-muted-foreground">
              Design and visualize your network infrastructure
            </p>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <NetworkDesigner />
      </div>
    </div>
  );
}
