"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CreateProjectDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  name: string
  roomId: string
  onNameChange: (value: string) => void
  isLoading: boolean
}

export function CreateProjectDialog({
  open,
  onClose,
  onConfirm,
  name,
  roomId,
  onNameChange,
  isLoading,
}: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-copy-primary">Create Project</DialogTitle>
          <DialogDescription className="text-copy-secondary">
            Give your project a name to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="Project name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            autoFocus
            disabled={isLoading}
          />
          {name && (
            <p className="text-xs text-copy-secondary">
              Room ID:{" "}
              <span className="font-mono text-copy-primary">
                {roomId || "—"}
              </span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="text-copy-secondary">
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || isLoading}
            onClick={onConfirm}
          >
            {isLoading ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
