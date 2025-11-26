"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"
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
import SensitiveData from "@/types/sensitive-data"

interface SensitiveDataModalProps {
  isOpen: boolean
  onClose: () => void
  sensitiveData: SensitiveData[]
  onSave: (data: SensitiveData[]) => void
}

export function SensitiveDataModal({ isOpen, onClose, sensitiveData, onSave }: SensitiveDataModalProps) {
  const [data, setData] = useState<SensitiveData[]>([])
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})

  const handleAddData = () => {
    const newData: SensitiveData = {
      id: `data-${Date.now()}`,
      key: "",
      value: "",
    }
    setData([...data, newData])
  }

  const handleRemoveData = (id: string) => {
    setData(data.filter((item) => item.id !== id))
  }

  const handleDataChange = (id: string, field: keyof SensitiveData, value: string) => {
    setData(
      data.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  const toggleShowValue = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSave = () => {
    const validData = data.filter((item) => item.key.trim() !== "")
    onSave(validData)
    onClose()
  }

  useEffect(() => {
    setData([...sensitiveData])
  }, [sensitiveData])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sensitive Data Storage</DialogTitle>
          <DialogDescription>
            Store sensitive information like API keys, passwords, and tokens securely. These values will be encrypted and available in your workflows.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto pr-4 -mr-4 max-h-[50vh]">
          <div className="space-y-6 py-2">
            {data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No sensitive data stored. Add key-value pairs to securely store sensitive information.
              </div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="grid gap-3 border-b pb-5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sensitive Data</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveData(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`key-${item.id}`}>Key</Label>
                      <Input
                        id={`key-${item.id}`}
                        value={item.key}
                        onChange={(e) => handleDataChange(item.id, "key", e.target.value)}
                        placeholder="api_key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`value-${item.id}`}>Value</Label>
                      <div className="relative">
                        <Input
                          id={`value-${item.id}`}
                          type={showValues[item.id] ? "text" : "password"}
                          value={item.value}
                          onChange={(e) => handleDataChange(item.id, "value", e.target.value)}
                          placeholder="••••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => toggleShowValue(item.id)}
                        >
                          {showValues[item.id] ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handleAddData} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Sensitive Data
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