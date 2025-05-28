"use client";
import FlowBuilder from "@/components/flow-builder";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home({ params }: { params: { id: string } }) {
  const [workflow, setWorkflow] = useState(null);

  const getWorkflowById = async () => {
    const id = params.id;
    const workflow = await axios.get(`http://localhost:5000/workflows/${id}`);
    setWorkflow(workflow.data.data);
  }

  useEffect(() => {
    getWorkflowById()
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
     
      <div className="flex h-16 items-center border-b px-4">
        <h1 className="text-xl font-bold">Flow Builder</h1>
        <Link className="ml-auto" href="/workflows">
          <Button>Go to list</Button>
        </Link>
      </div>
      <div className="flex-1">
        <FlowBuilder flowName={workflow?.name} workflowToEdit={workflow}/>
      </div>
    </main>
  );
}
