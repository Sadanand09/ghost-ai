"use client"

import { LiveMap, LiveObject } from "@liveblocks/client"
import { Component, type DragEvent, type ReactNode, useRef, useState } from "react"
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react"
import { Canvas, type CanvasApi } from "@/components/editor/canvas"
import { CanvasShapeFrame } from "@/components/editor/canvas-shape"
import { ShapePanel } from "@/components/editor/shape-panel"
import { DEFAULT_NODE_COLOR } from "@/types/canvas"
import { SHAPE_DRAG_MIME_TYPE, type CanvasShapeDragPayload } from "@/types/canvas"

interface CanvasWrapperProps {
  roomId: string
  onReady?: (api: CanvasApi) => void
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-copy-muted">Unable to connect to canvas.</p>
        </div>
      )
    }
    return this.props.children
  }
}

export function CanvasWrapper({ roomId, onReady }: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
        initialStorage={{
          flow: new LiveObject({
            nodes: new LiveMap(),
            edges: new LiveMap(),
          }),
        }}
      >
        <CanvasErrorBoundary>
          <ClientSideSuspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-copy-faint">Loading canvas…</p>
              </div>
            }
          >
            <CanvasSurface onReady={onReady} />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function CanvasSurface({ onReady }: { onReady?: (api: CanvasApi) => void }) {
  const createNodeFromDropRef = useRef<
    ((payload: CanvasShapeDragPayload, clientPosition: { x: number; y: number }) => void) | null
  >(null)
  const [dragPreview, setDragPreview] = useState<{
    payload: CanvasShapeDragPayload
    position: { x: number; y: number }
  } | null>(null)

  const clearDragPreview = () => {
    setDragPreview(null)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME_TYPE)) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setDragPreview((current) =>
      current
        ? {
            ...current,
            position: { x: event.clientX, y: event.clientY },
          }
        : current,
    )
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const rawPayload = event.dataTransfer.getData(SHAPE_DRAG_MIME_TYPE)
    if (!rawPayload || !createNodeFromDropRef.current) {
      return
    }

    let payload: CanvasShapeDragPayload

    try {
      payload = JSON.parse(rawPayload) as CanvasShapeDragPayload
    } catch {
      return
    }

    createNodeFromDropRef.current(payload, {
      x: event.clientX,
      y: event.clientY,
    })
    clearDragPreview()
  }

  return (
    <div className="relative h-full w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
      <Canvas
        onReady={(api) => {
          createNodeFromDropRef.current = api.createNodeFromDrop
          onReady?.(api)
        }}
      />
      {dragPreview ? (
        <div
          className="pointer-events-none fixed left-0 top-0 z-30"
          style={{
            transform: `translate(${dragPreview.position.x - dragPreview.payload.size.width / 2}px, ${
              dragPreview.position.y - dragPreview.payload.size.height / 2
            }px)`,
          }}
        >
          <CanvasShapeFrame
            shape={dragPreview.payload.shape}
            color={DEFAULT_NODE_COLOR}
            width={dragPreview.payload.size.width}
            height={dragPreview.payload.size.height}
            className="opacity-85"
          />
        </div>
      ) : null}
      <ShapePanel
        onShapeDragStart={(payload, clientPosition) => {
          setDragPreview({ payload, position: clientPosition })
        }}
        onShapeDrag={(clientPosition) => {
          setDragPreview((current) => (current ? { ...current, position: clientPosition } : current))
        }}
        onShapeDragEnd={clearDragPreview}
      />
    </div>
  )
}
