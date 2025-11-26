"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Copy, Repeat, Trash2 } from "lucide-react";

interface LoopNodeProps {
  data: any;
  isConnectable: boolean;
}

export const LoopNode = memo<LoopNodeProps>(({ data, isConnectable }) => {
  return (
    <div className="rounded-md border bg-white p-3 shadow-sm relative">
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
        <Repeat className="h-5 w-5 text-blue-500" />
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground">
        {data.name || "Unnamed Step"}
      </div>
      <div className="mt-2 text-xs text-center text-muted-foreground">
        {data.source ? `Loop over: ${data.source}` : "Configure loop source..."}
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <div className="text-blue-600">Loop</div>
        <div className="text-gray-600">Done</div>
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
        id="loop"
        style={{ left: "25%" }}
        isConnectable={isConnectable}
        className="!bg-blue-600"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="done"
        style={{ left: "75%" }}
        isConnectable={isConnectable}
        className="!bg-gray-600"
      />
    </div>
  );
});

LoopNode.displayName = "LoopNode";