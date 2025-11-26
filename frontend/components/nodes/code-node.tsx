"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Code2, Copy, Trash2 } from "lucide-react";

export const CodeNode = memo(({ data, isConnectable }) => {
  const codePreview = data.code
    ? data.code.split("\n").slice(0, 3).join("\n") +
      (data.code.split("\n").length > 3 ? "..." : "")
    : "// Add your code here...";

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
        <Code2 className="h-5 w-5 text-purple-500" />
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground">
        {data.name || "Unnamed Step"}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-purple-500"
      />
    </div>
  );
});

CodeNode.displayName = "CodeNode";
