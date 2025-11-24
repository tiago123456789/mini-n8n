"use client";
import FlowBuilder from "@/components/flow-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [flowName, setFlowName] = useState(`Flow ${new Date().getTime()}`)

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
        <Link className="ml-auto" href="/workflows">
          <Button>Go to Workflows</Button>
        </Link>
      </div>
      <div className="flex-1">
      
      <FlowBuilder 
        flowName={flowName} 
        onFlowNameChange={setFlowName}
        contextVariables={[]}
        workflowToEdit={null} />
      </div>

    </main>
  );
}
