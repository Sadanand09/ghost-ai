"use client"

import { Minus, Plus, Redo2, ScanSearch, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CanvasControlBarProps {
  canUndo: boolean
  canRedo: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
}

export function CanvasControlBar({
  canUndo,
  canRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
}: CanvasControlBarProps) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border-default bg-surface/95 p-1 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-center gap-1">
          <CanvasControlButton ariaLabel="Zoom out" onClick={onZoomOut}>
            <Minus className="h-4 w-4" />
          </CanvasControlButton>
          <CanvasControlButton ariaLabel="Fit view" onClick={onFitView}>
            <ScanSearch className="h-4 w-4" />
          </CanvasControlButton>
          <CanvasControlButton ariaLabel="Zoom in" onClick={onZoomIn}>
            <Plus className="h-4 w-4" />
          </CanvasControlButton>
        </div>

        <div className="mx-1 h-6 w-px bg-border-default" />

        <div className="flex items-center gap-1">
          <CanvasControlButton ariaLabel="Undo" disabled={!canUndo} onClick={onUndo}>
            <Undo2 className="h-4 w-4" />
          </CanvasControlButton>
          <CanvasControlButton ariaLabel="Redo" disabled={!canRedo} onClick={onRedo}>
            <Redo2 className="h-4 w-4" />
          </CanvasControlButton>
        </div>
      </div>
    </div>
  )
}

interface CanvasControlButtonProps {
  ariaLabel: string
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}

function CanvasControlButton({ ariaLabel, children, disabled = false, onClick }: CanvasControlButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary",
        disabled && "text-copy-faint hover:bg-transparent hover:text-copy-faint",
      )}
    >
      {children}
    </Button>
  )
}
