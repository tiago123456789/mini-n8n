"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight } from "lucide-react";
import useWorkflow from "@/hooks/useWorkflow";

interface ExecutionsDrawerProps {
  workflowId: string;
}

export default function ExecutionsDrawer({ workflowId }: ExecutionsDrawerProps) {
  const [open, setOpen] = useState(false);
  const [expandedExecutions, setExpandedExecutions] = useState<Set<string>>(new Set());
  const { executions,
    isLoading,
    fetchExecutions 
  } = useWorkflow();

  useEffect(() => {
    if (open && workflowId) {
      fetchExecutions(workflowId);
    }
  }, [open, workflowId]);

  const toggleExpansion = (executionId: string) => {
    const newExpanded = new Set(expandedExecutions);
    if (newExpanded.has(executionId)) {
      newExpanded.delete(executionId);
    } else {
      newExpanded.add(executionId);
    }
    setExpandedExecutions(newExpanded);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Executions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Workflow Executions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="text-center py-4">Loading executions...</div>
          ) : executions.length === 0 ? (
            <div className="text-center py-4">No executions found</div>
          ) : (
            <div className="space-y-4">
              {executions.map((execution) => (
                <div key={execution._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Execution ID: {execution._id}</p>
                      <p className="text-sm text-muted-foreground">
                        Started: {new Date(execution.startAt).toLocaleString()}
                        {execution.endAt && ` - Ended: ${new Date(execution.endAt).toLocaleString()}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpansion(execution._id)}
                    >
                      {expandedExecutions.has(execution._id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      Logs
                    </Button>
                  </div>
                  {expandedExecutions.has(execution._id) && (
                    <div className="mt-4 space-y-2">
                      {execution.logs.map((log, index) => (
                        <div key={index} className="border-l-2 border-muted pl-4">
                          <p className="font-medium">{log.step}</p>
                          <div>
                            <h3>Input</h3>
                            {log.input && (
                              <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.input, null, 2)}
                              </pre>
                            )}
                            {(log.input?.length == 0 || log.input == null) && (
                              <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-x-auto">
                                <p className="text-sm text-muted-foreground">No input</p>
                              </pre>
                            )}
                          </div>
                          <div>
                            <h3>Output</h3>
                            {log.output && (
                              <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(log.output, null, 2)}
                              </pre>
                            )}
                            {(log.output?.length == 0 || log.output == null) && (
                              <pre className="text-sm bg-muted p-2 rounded mt-1 overflow-x-auto">
                                <p className="text-sm text-muted-foreground">No output</p>
                              </pre>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}