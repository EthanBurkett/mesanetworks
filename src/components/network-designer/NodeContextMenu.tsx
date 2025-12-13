import type { Node } from "reactflow";
import { Card } from "@/components/ui/card";
import { Copy, Trash2, Layers } from "lucide-react";

interface NodeContextMenuProps {
  node: Node | null;
  position: { x: number; y: number } | null;
  onDuplicate: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onGroupToggle: (nodeId: string, groupId: string | undefined) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export function NodeContextMenu({
  node,
  position,
  onDuplicate,
  onSelect,
  onGroupToggle,
  onDelete,
  onClose,
}: NodeContextMenuProps) {
  if (!node || !position) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <Card
        className="absolute w-56 p-0 shadow-lg overflow-hidden flex flex-col gap-0"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left w-full"
          onClick={() => {
            onDuplicate(node.id);
            onClose();
          }}
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left w-full"
          onClick={() => {
            onSelect(node.id);
            onClose();
          }}
        >
          Select
        </button>
        <div className="h-px bg-border" />
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left w-full"
          onClick={() => {
            onGroupToggle(node.id, node.data?.groupId);
            onClose();
          }}
        >
          <Layers className="w-4 h-4" />
          {node.data?.groupId ? "Ungroup" : "Group Selected"}
        </button>
        <div className="h-px bg-border" />
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left w-full"
          onClick={() => {
            onDelete(node.id);
            onClose();
          }}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </Card>
    </div>
  );
}
