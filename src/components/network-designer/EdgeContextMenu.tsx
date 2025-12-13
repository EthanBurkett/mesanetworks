import type { Edge } from "reactflow";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface EdgeContextMenuProps {
  edge: Edge | null;
  position: { x: number; y: number } | null;
  onEdit: (edge: Edge) => void;
  onDelete: (edgeId: string) => void;
  onClose: () => void;
}

export function EdgeContextMenu({
  edge,
  position,
  onEdit,
  onDelete,
  onClose,
}: EdgeContextMenuProps) {
  if (!edge || !position) return null;

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
            onEdit(edge);
            onClose();
          }}
        >
          Edit Properties
        </button>
        <div className="h-px bg-border" />
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors text-left w-full"
          onClick={() => {
            onDelete(edge.id);
            onClose();
          }}
        >
          <Trash2 className="w-4 h-4" />
          Delete Connection
        </button>
      </Card>
    </div>
  );
}
