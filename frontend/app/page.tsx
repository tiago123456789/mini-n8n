"use client";
import FlowBuilder from "@/components/flow-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { ContextModal, type ContextVariable } from "@/components/context-modal"
import { Settings } from "lucide-react";

export default function Home() {
  const [flowName, setFlowName] = useState("Untitled Flow")
  const [isContextModalOpen, setIsContextModalOpen] = useState(false)
  const [contextVariables, setContextVariables] = useState<ContextVariable[]>([])

  const handleSaveContextVariables = (variables: ContextVariable[]) => {
    setContextVariables(variables)
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center border-b px-4">
        <h1 className="text-xl font-bold">Flow Builder</h1>
        <div className="w-64">
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="h-9 font-medium"
              placeholder="Enter flow name"
              aria-label="Flow name"
            />
        </div>
        <Button
            variant="outline"
            size="sm"
            onClick={() => setIsContextModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Context Variables
            {contextVariables.length > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 flex items-center justify-center text-[10px] text-primary-foreground">
                {contextVariables.length}
              </span>
            )}
          </Button>
        <Link className="ml-auto" href="/workflows">
          <Button>Go to list</Button>
        </Link>
      </div>
      <div className="flex-1">
      
      <FlowBuilder 
        flowName={flowName} 
        onFlowNameChange={setFlowName}
        contextVariables={contextVariables}
        workflowToEdit={null} />
      </div>

      <ContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        contextVariables={contextVariables}
        onSave={handleSaveContextVariables}
      />
    </main>
  );
}
