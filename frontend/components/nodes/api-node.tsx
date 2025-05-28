import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Globe, Trash2 } from "lucide-react";

export const ApiNode = memo(({ data, isConnectable }) => {
  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
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
        <Globe className="h-5 w-5 text-green-500" />
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground">
        {data.name || "Unnamed Step"}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {data.endpoint
          ? `${data.method}: ${data.endpoint}`
          : "Configure API..."}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-green-500"
      />
    </div>
  );
});

ApiNode.displayName = "ApiNode";
