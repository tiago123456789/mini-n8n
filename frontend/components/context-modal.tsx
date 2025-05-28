"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

export type ContextVariable = {
  id: string
  key: string
  value: string
  description?: string
}

interface ContextModalProps {
  isOpen: boolean
  onClose: () => void
  contextVariables: ContextVariable[]
  onSave: (variables: ContextVariable[]) => void
}

export function ContextModal({ isOpen, onClose, contextVariables, onSave }: ContextModalProps) {
  const [variables, setVariables] = useState<ContextVariable[]>(contextVariables)

  const handleAddVariable = () => {
    const newVariable: ContextVariable = {
      id: `var-${Date.now()}`,
      key: "",
      value: "",
      description: "",
    }
    setVariables([...variables, newVariable])
  }

  const handleRemoveVariable = (id: string) => {
    setVariables(variables.filter((variable) => variable.id !== id))
  }

  const handleVariableChange = (id: string, field: keyof ContextVariable, value: string) => {
    setVariables(
      variables.map((variable) => {
        if (variable.id === id) {
          return { ...variable, [field]: value }
        }
        return variable
      }),
    )
  }

  const handleSave = () => {
    // Filter out variables with empty keys
    const validVariables = variables.filter((variable) => variable.key.trim() !== "")
    onSave(validVariables)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Workflow Context Variables</DialogTitle>
          <DialogDescription>
            Define context variables that will be available throughout your workflow. These variables can be accessed in
            code nodes and conditions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto pr-4 -mr-4 max-h-[50vh]">
          <div className="space-y-6 py-2">
            {variables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No context variables defined. Add variables to make data available throughout your workflow.
              </div>
            ) : (
              variables.map((variable) => (
                <div key={variable.id} className="grid gap-3 border-b pb-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Variable</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveVariable(variable.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`key-${variable.id}`}>Key</Label>
                      <Input
                        id={`key-${variable.id}`}
                        value={variable.key}
                        onChange={(e) => handleVariableChange(variable.id, "key", e.target.value)}
                        placeholder="variable_name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`value-${variable.id}`}>Value</Label>
                      <Input
                        id={`value-${variable.id}`}
                        value={variable.value}
                        onChange={(e) => handleVariableChange(variable.id, "value", e.target.value)}
                        placeholder="value"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${variable.id}`}>Description (optional)</Label>
                    <Textarea
                      id={`description-${variable.id}`}
                      value={variable.description || ""}
                      onChange={(e) => handleVariableChange(variable.id, "description", e.target.value)}
                      placeholder="Describe what this variable is used for"
                      className="h-20"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handleAddVariable} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Variable
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
