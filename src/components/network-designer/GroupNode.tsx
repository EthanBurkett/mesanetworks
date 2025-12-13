import { useState } from "react";
import { NodeResizer } from "reactflow";
import { Input } from "@/components/ui/input";
import { Layers } from "lucide-react";

interface GroupNodeProps {
  data: any;
}

export function GroupNode({ data }: GroupNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(data.label || "Group");

  const handleNameChange = (newName: string) => {
    setGroupName(newName);
    if (data.onNameChange) {
      data.onNameChange(newName);
    }
  };

  return (
    <>
      <NodeResizer
        minWidth={300}
        minHeight={200}
        lineClassName="border-amber-500"
        handleClassName="bg-amber-500 w-2 h-2 border border-amber-600"
      />
      <div
        className="border-2 border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-950/10 rounded-lg"
        style={{
          width: "100%",
          height: "100%",
          padding: "40px 20px 20px 20px",
        }}
      >
        <div className="absolute -top-3 left-4 bg-background px-2">
          {isEditing ? (
            <Input
              value={groupName}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setIsEditing(false);
              }}
              className="h-6 text-xs font-semibold w-32"
              autoFocus
            />
          ) : (
            <div
              className="flex items-center gap-1 cursor-pointer text-xs font-semibold text-amber-700 dark:text-amber-400"
              onClick={() => setIsEditing(true)}
            >
              <Layers className="w-3 h-3" />
              {groupName}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
