"use client"

import type { LucideIcon } from "lucide-react"
import { Circle, Database, Diamond, Hexagon, Pill, Square } from "lucide-react"
import { NODE_SHAPES, SHAPE_DEFAULT_SIZES, SHAPE_DRAG_MIME_TYPE, type CanvasShapeDragPayload, type NodeShape } from "@/types/canvas"

const SHAPE_ICONS: Record<NodeShape, LucideIcon> = {
  rectangle: Square,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Database,
  hexagon: Hexagon,
}

const SHAPE_LABELS: Record<NodeShape, string> = {
  rectangle: "Rectangle",
  diamond: "Diamond",
  circle: "Circle",
  pill: "Pill",
  cylinder: "Cylinder",
  hexagon: "Hexagon",
}

export function ShapePanel() {
  const handleDragStart = (shape: NodeShape) => (event: React.DragEvent<HTMLButtonElement>) => {
    const payload: CanvasShapeDragPayload = {
      shape,
      size: SHAPE_DEFAULT_SIZES[shape],
    }

    event.dataTransfer.effectAllowed = "copy"
    event.dataTransfer.setData(SHAPE_DRAG_MIME_TYPE, JSON.stringify(payload))
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border-default bg-[color:rgba(17,17,20,0.92)] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur">
        {NODE_SHAPES.map((shape) => {
          const Icon = SHAPE_ICONS[shape]

          return (
            <button
              key={shape}
              type="button"
              draggable
              aria-label={`Drag ${SHAPE_LABELS[shape]} shape`}
              title={SHAPE_LABELS[shape]}
              onDragStart={handleDragStart(shape)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-transparent text-copy-secondary transition-colors hover:border-border-subtle hover:bg-elevated hover:text-copy-primary"
            >
              <Icon className="h-5 w-5" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
