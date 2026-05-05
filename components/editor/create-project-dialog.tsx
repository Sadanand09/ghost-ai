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
  onConfirm: (name: string, slug: string) => void
  name: string
  slug: string
  onNameChange: (value: string) => void
}

export function CreateProjectDialog({
  open,
  onClose,
  onConfirm,
  name,
  slug,
  onNameChange,
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
          />
          {name && (
            <p className="text-xs text-copy-secondary">
              Slug:{" "}
              <span className="font-mono text-copy-primary">
                {slug || "—"}
              </span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="text-copy-secondary">
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() => onConfirm(name, slug)}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
