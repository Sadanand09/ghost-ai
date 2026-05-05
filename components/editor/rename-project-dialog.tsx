"use client"

import type { KeyboardEvent } from "react"
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
import type { Project } from "@/hooks/use-project-dialogs"

interface RenameProjectDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  project: Project | null
  name: string
  onNameChange: (value: string) => void
  isLoading: boolean
}

export function RenameProjectDialog({
  open,
  onClose,
  onConfirm,
  project,
  name,
  onNameChange,
  isLoading,
}: RenameProjectDialogProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && name.trim() && !isLoading) {
      onConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-copy-primary">Rename Project</DialogTitle>
          {project && (
            <DialogDescription className="text-copy-secondary">
              Renaming &quot;{project.name}&quot;
            </DialogDescription>
          )}
        </DialogHeader>

        <Input
          placeholder="Project name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={isLoading}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="text-copy-secondary">
            Cancel
          </Button>
          <Button disabled={!name.trim() || isLoading} onClick={onConfirm}>
            {isLoading ? "Renaming…" : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
