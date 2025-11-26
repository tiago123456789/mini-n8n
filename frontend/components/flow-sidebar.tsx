"use client"

import { useState } from "react"
import { Webhook, Globe, GitBranch, Code2, ChevronLeft, ChevronRight, PlusCircle, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FlowSidebarProps {
  onAddNode: (type: string) => void,
  customNodes: any[]
}

export function FlowSidebar({ onAddNode, customNodes }: FlowSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const nodeTypes = [
    {
      type: "webhook",
      label: "Webhook",
      icon: Webhook,
      description: "Trigger a flow with an incoming webhook request",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      type: "api",
      label: "API",
      icon: Globe,
      description: "Make HTTP requests to external APIs",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      type: "condition",
      label: "Condition",
      icon: GitBranch,
      description: "Add conditional logic to your flow",
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      type: "code",
      label: "Code",
      icon: Code2,
      description: "Run custom JavaScript code",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      type: "loop",
      label: "Loop",
      icon: Repeat,
      description: "Execute actions multiple times over a list",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    ...customNodes
  ]

  return (
    <div
      className={cn(
        "h-full border-r bg-background transition-all duration-300 flex flex-col",
        collapsed ? "w-14" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className={cn("font-semibold", collapsed && "sr-only")}>Components</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-4/4 h-full max-h-screen overflow-y-auto flex flex-col flex-grow">
        <div className={cn("space-y-2", collapsed && "space-y-3")}>
          {nodeTypes.map((nodeType) => (
            <TooltipProvider key={nodeType.type} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onAddNode(nodeType.type)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-md transition-colors",
                      nodeType.bgColor,
                      nodeType.borderColor,
                      "border hover:bg-muted",
                      collapsed ? "justify-center" : "justify-start",
                    )}
                  >
                    <nodeType.icon className={cn("h-5 w-5", nodeType.color)} />
                    {!collapsed && (
                      <div className="text-left">
                        <div className="font-medium">{nodeType.label}</div>
                        <div className="text-xs text-muted-foreground">{nodeType.description}</div>
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="flex flex-col gap-1">
                    <div className="font-medium">{nodeType.label}</div>
                    <div className="text-xs">{nodeType.description}</div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

    </div>
  )
}
