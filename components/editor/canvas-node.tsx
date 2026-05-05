"use client"

import { type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react"
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react"
import { useCanvasEditing } from "@/components/editor/canvas-editing-context"
import { CanvasShapeFrame } from "@/components/editor/canvas-shape"
import { NODE_COLORS, SHAPE_MIN_SIZES, type CanvasNode, type NodeColor } from "@/types/canvas"

const NODE_HANDLES = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
] as const

const HANDLE_CLASS_NAME =
  "!h-3 !w-3 !border !border-surface-border !bg-white !opacity-0 !shadow-[0_0_0_1px_rgba(0,0,0,0.15)] transition-opacity duration-150 group-hover:!opacity-100"

function isActiveColor(current: NodeColor, candidate: NodeColor) {
  return current.background === candidate.background && current.foreground === candidate.foreground
}

export function CanvasNodeView({ id, data, selected, width, height }: NodeProps<CanvasNode>) {
  const { replaceNode } = useCanvasEditing()
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data.label)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const minSize = SHAPE_MIN_SIZES[data.shape]

  useEffect(() => {
    if (!isEditing) {
      setDraftLabel(data.label)
    }
  }, [data.label, isEditing])

  useEffect(() => {
    if (!isEditing || !textareaRef.current) {
      return
    }

    textareaRef.current.focus()
    textareaRef.current.select()
  }, [isEditing])

  const updateLabel = (nextLabel: string) => {
    setDraftLabel(nextLabel)
    replaceNode(id, (node) => ({
      ...node,
      data: {
        ...node.data,
        label: nextLabel,
      },
    }))
  }

  const stopEditing = () => {
    setIsEditing(false)
  }

  const updateColor = (nextColor: NodeColor) => {
    replaceNode(id, (node) => ({
      ...node,
      data: {
        ...node.data,
        color: nextColor,
      },
    }))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Escape") {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    stopEditing()
  }

  const handleToolbarPointer = (event: MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={minSize.width}
        minHeight={minSize.height}
        keepAspectRatio={data.shape === "circle"}
        color="var(--accent-primary)"
        lineStyle={{
          borderColor: "var(--accent-primary)",
          opacity: 0.35,
        }}
        handleStyle={{
          width: 10,
          height: 10,
          borderRadius: 9999,
          border: "1px solid var(--accent-primary)",
          backgroundColor: "var(--bg-elevated)",
        }}
      />
      <div className="group relative" style={{ width: width ?? 180, height: height ?? 100 }}>
        {NODE_HANDLES.map((handle) => (
          <Handle
            key={handle.id}
            id={handle.id}
            type="source"
            position={handle.position}
            isConnectableStart
            isConnectableEnd
            className={HANDLE_CLASS_NAME}
          />
        ))}
        {selected ? (
          <div
            className="nodrag nopan absolute bottom-full left-1/2 z-20 mb-3 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border-subtle bg-elevated/95 px-2.5 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.34)] backdrop-blur-sm"
            onMouseDown={handleToolbarPointer}
            onClick={handleToolbarPointer}
          >
            {NODE_COLORS.map((color) => {
              const active = isActiveColor(data.color, color)

              return (
                <button
                  key={`${color.background}-${color.foreground}`}
                  type="button"
                  className="nodrag nopan flex h-5 w-5 items-center justify-center rounded-full border transition-transform duration-150 hover:scale-105 focus-visible:outline-none"
                  aria-label={`Set node color ${color.background}`}
                  aria-pressed={active}
                  style={{
                    backgroundColor: color.background,
                    borderColor: active ? color.foreground : "var(--border-subtle)",
                    boxShadow: active
                      ? `0 0 0 1px ${color.foreground}, 0 0 0 4px color-mix(in srgb, ${color.foreground} 16%, transparent)`
                      : `0 0 0 1px color-mix(in srgb, ${color.foreground} 42%, transparent) inset`,
                  }}
                  onMouseDown={handleToolbarPointer}
                  onClick={(event) => {
                    handleToolbarPointer(event)
                    updateColor(color)
                  }}
                  onMouseEnter={(event) => {
                    if (active) {
                      return
                    }

                    event.currentTarget.style.boxShadow = `0 0 0 1px color-mix(in srgb, ${color.foreground} 55%, transparent) inset, 0 0 10px color-mix(in srgb, ${color.foreground} 22%, transparent)`
                  }}
                  onMouseLeave={(event) => {
                    if (active) {
                      event.currentTarget.style.boxShadow = `0 0 0 1px ${color.foreground}, 0 0 0 4px color-mix(in srgb, ${color.foreground} 16%, transparent)`
                      return
                    }

                    event.currentTarget.style.boxShadow = `0 0 0 1px color-mix(in srgb, ${color.foreground} 42%, transparent) inset`
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: color.foreground,
                      opacity: active ? 1 : 0.8,
                    }}
                  />
                </button>
              )
            })}
          </div>
        ) : null}
        <CanvasShapeFrame
          shape={data.shape}
          color={data.color}
          width={width ?? 180}
          height={height ?? 100}
          selected={selected}
          contentClassName="h-full w-full min-w-0"
        >
          <div
            className="nodrag nopan flex h-full w-full items-center justify-center px-3 text-center"
            onDoubleClick={(event) => {
              event.stopPropagation()
              setIsEditing(true)
            }}
            onMouseDown={(event) => {
              if (isEditing) {
                event.stopPropagation()
              }
            }}
          >
            {isEditing ? (
              <div className="flex h-full w-full items-center justify-center">
                <textarea
                  ref={textareaRef}
                  value={draftLabel}
                  placeholder="Untitled node"
                  rows={1}
                  className="nodrag nopan max-h-full w-full resize-none overflow-hidden bg-transparent px-2 text-center text-sm font-medium leading-tight text-inherit outline-none"
                  style={{
                    color: data.color.foreground,
                  }}
                  onChange={(event) => updateLabel(event.target.value)}
                  onBlur={stopEditing}
                  onKeyDown={handleKeyDown}
                  onPointerDown={(event) => event.stopPropagation()}
                  onDoubleClick={(event) => event.stopPropagation()}
                />
              </div>
            ) : data.label ? (
              <span className="text-sm font-medium leading-tight">{data.label}</span>
            ) : (
              <span
                className="text-sm font-medium leading-tight"
                style={{
                  color: `color-mix(in srgb, ${data.color.foreground} 42%, transparent)`,
                }}
              >
                Untitled node
              </span>
            )}
          </div>
        </CanvasShapeFrame>
      </div>
    </>
  )
}
