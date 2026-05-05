"use client"

import type { NodeProps } from "@xyflow/react"
import type { CanvasNode } from "@/types/canvas"

export function CanvasNodeView({ data, selected, width, height }: NodeProps<CanvasNode>) {
  const borderColor = selected ? "var(--accent-primary)" : "var(--border-subtle)"

  return (
    <div
      className="flex items-center justify-center rounded-2xl border bg-transparent px-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
      style={{
        width: width ?? 180,
        height: height ?? 100,
        minWidth: 120,
        minHeight: 72,
        backgroundColor: data.color.background,
        color: data.color.foreground,
        borderColor,
      }}
    >
      <span className="text-sm font-medium">{data.label}</span>
    </div>
  )
}
