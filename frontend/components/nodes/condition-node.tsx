import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Copy, GitBranch, Trash2 } from "lucide-react";
import { translate } from "@/utils/operator";

export const ConditionNode = memo(({ data, isConnectable }) => {
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
        <GitBranch className="h-5 w-5 text-amber-500" />
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground">
        {data.name || "Unnamed Step"}
      </div>
      <div className="mt-2 text-xs text-center text-muted-foreground">
        {data.condition ? (
          <p>
            {data.condition.left}{" "}
            {translate(data.condition.operator).toLowerCase()}{" "}
            {data.condition.right}
          </p>
        ) : (
          "Configure condition..."
        )}
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <div className="text-green-600">{data.trueLabel}</div>
        <div className="text-red-600">{data.falseLabel}</div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-amber-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: "25%" }}
        isConnectable={isConnectable}
        className="!bg-green-600"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: "75%" }}
        isConnectable={isConnectable}
        className="!bg-red-600"
      />
    </div>
  );
});

ConditionNode.displayName = "ConditionNode";
