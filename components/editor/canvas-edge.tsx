"use client"

import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
  Position,
} from "@xyflow/react"
import { useCanvasEditing } from "@/components/editor/canvas-editing-context"
import type { CanvasEdge } from "@/types/canvas"

const EMPTY_LABEL_HINT = "Add label"

function getEdgeTone(isActive: boolean) {
  return isActive
    ? "color-mix(in srgb, var(--text-primary) 96%, var(--accent-primary) 18%)"
    : "color-mix(in srgb, var(--text-primary) 64%, transparent)"
}

export function CanvasEdgeView({
  id,
  data,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const { replaceEdge } = useCanvasEditing()
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data?.label ?? "")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const measureRef = useRef<HTMLSpanElement | null>(null)
  const [inputWidth, setInputWidth] = useState(72)
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: sourcePosition ?? Position.Right,
    targetPosition: targetPosition ?? Position.Left,
    borderRadius: 18,
    offset: 24,
  })
  const isActive = selected || isHovered || isEditing
  const label = data?.label ?? ""
  const showHint = !isEditing && !label && isActive
  const edgeTone = getEdgeTone(isActive)
  const labelTransform = useMemo<CSSProperties>(
    () => ({
      transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
    }),
    [labelX, labelY],
  )

  useEffect(() => {
    if (!isEditing) {
      setDraftLabel(label)
    }
  }, [isEditing, label])

  useEffect(() => {
    if (!isEditing || !inputRef.current) {
      return
    }

    inputRef.current.focus()
    inputRef.current.select()
  }, [isEditing])

  useEffect(() => {
    if (!measureRef.current) {
      return
    }

    const nextWidth = Math.ceil(measureRef.current.getBoundingClientRect().width) + 20
    setInputWidth(Math.max(72, nextWidth))
  }, [draftLabel, isEditing, label])

  const commitLabel = (nextLabel: string) => {
    replaceEdge(id, (edge) => ({
      ...edge,
      data: {
        ...(edge.data ?? {}),
        label: nextLabel.trim(),
      },
    }))
    setIsEditing(false)
  }

  const handleLabelPointer = (event: MouseEvent<Element>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== "Escape") {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    commitLabel(draftLabel)
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={28}
        style={{
          stroke: edgeTone,
          strokeWidth: 1.6,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          transition: "stroke 160ms ease, filter 160ms ease",
          filter: isActive ? "drop-shadow(0 0 6px color-mix(in srgb, var(--accent-primary) 18%, transparent))" : undefined,
        }}
      />
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={(event) => {
          handleLabelPointer(event)
          setIsEditing(true)
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute left-0 top-0 z-20"
          style={labelTransform}
        >
          <span
            ref={measureRef}
            className="pointer-events-none absolute opacity-0"
          >
            {`${draftLabel || EMPTY_LABEL_HINT}  `}
          </span>
          {isEditing ? (
            <input
              ref={inputRef}
              value={draftLabel}
              placeholder={EMPTY_LABEL_HINT}
              className="nodrag nopan pointer-events-auto h-8 rounded-full border border-border-subtle bg-elevated/96 px-3 text-center text-xs font-medium text-copy-primary shadow-[0_10px_28px_rgba(0,0,0,0.34)] outline-none placeholder:text-copy-faint"
              style={{ width: inputWidth }}
              onChange={(event) => setDraftLabel(event.target.value)}
              onBlur={() => commitLabel(draftLabel)}
              onKeyDown={handleKeyDown}
              onMouseDown={handleLabelPointer}
              onClick={handleLabelPointer}
              onDoubleClick={handleLabelPointer}
              onPointerDown={(event) => event.stopPropagation()}
            />
          ) : label ? (
            <button
              type="button"
              className="nodrag nopan pointer-events-auto inline-flex h-7 cursor-text items-center rounded-full border border-border-subtle bg-elevated/94 px-3 text-xs font-medium text-copy-primary shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-colors hover:border-border-default"
              onMouseDown={handleLabelPointer}
              onClick={handleLabelPointer}
              onDoubleClick={(event) => {
                handleLabelPointer(event)
                setIsEditing(true)
              }}
            >
              {label}
            </button>
          ) : showHint ? (
            <button
              type="button"
              className="nodrag nopan pointer-events-auto inline-flex h-7 cursor-text items-center rounded-full border border-dashed border-border-subtle bg-base/80 px-3 text-xs font-medium text-copy-faint transition-colors hover:border-border-default hover:text-copy-muted"
              onMouseDown={handleLabelPointer}
              onClick={handleLabelPointer}
              onDoubleClick={(event) => {
                handleLabelPointer(event)
                setIsEditing(true)
              }}
            >
              {EMPTY_LABEL_HINT}
            </button>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
