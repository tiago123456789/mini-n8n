"use client"

import { useState } from "react"
import { Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import LogEntry from "@/types/log-entry"

interface LogsModalProps {
  isOpen: boolean
  onClose: () => void
  logs: LogEntry[]
  isLoading?: boolean
}

export function LogsModal({ isOpen, onClose, logs, isLoading }: LogsModalProps) {
  const formatOutput = (output: any): string => {
    if (typeof output === 'object' && output !== null) {
      return JSON.stringify(output, null, 2)
    }
    return String(output)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            Workflow Execution Logs
          </DialogTitle>
          <DialogDescription>
            View the output from each step in your workflow execution.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto pr-4 -mr-4">
          <div className="space-y-4 py-2">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="h-8 w-8 animate-pulse mx-auto mb-2" />
                Running workflow...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs available. Run the workflow to see execution results.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md border text-xs font-mono bg-muted">
                      Step {index + 1}
                    </span>
                    <span className="font-medium text-sm">{log.step}</span>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                      {formatOutput(log.output)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}