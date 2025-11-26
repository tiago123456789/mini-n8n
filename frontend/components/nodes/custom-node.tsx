import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Copy, Globe, Trash2 } from "lucide-react";

interface CustomNodeProps {
  data: any;
  isConnectable: boolean;
}

let name = "CustomNode"

export const CustomNode = memo(({ data, isConnectable }: CustomNodeProps) => {
  name = data.name;
  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
      <button
        className="absolute top-2 left-2 text-gray-400 hover:text-red-500 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          data.duplicateNode();
        }}
        aria-label="Delete node"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          data.deleteNode();
        }}
        aria-label="Delete node"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-blue-500" />
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground">
        {data.name || "Unnamed Step"}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-blue-500"
      />
    </div>
  );
});

CustomNode.displayName = name;
