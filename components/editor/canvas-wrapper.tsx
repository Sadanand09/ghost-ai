"use client"

import { LiveMap, LiveObject } from "@liveblocks/client"
import { Component, type ReactNode, useRef } from "react"
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react"
import { Canvas } from "@/components/editor/canvas"
import { ShapePanel } from "@/components/editor/shape-panel"
import { SHAPE_DRAG_MIME_TYPE, type CanvasShapeDragPayload } from "@/types/canvas"

interface CanvasWrapperProps {
  roomId: string
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

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
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
            <CanvasSurface />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function CanvasSurface() {
  const createNodeFromDropRef = useRef<
    ((payload: CanvasShapeDragPayload, clientPosition: { x: number; y: number }) => void) | null
  >(null)

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME_TYPE)) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
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
  }

  return (
    <div className="relative h-full w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
      <Canvas
        onReady={({ createNodeFromDrop }) => {
          createNodeFromDropRef.current = createNodeFromDrop
        }}
      />
      <ShapePanel />
    </div>
  )
}
