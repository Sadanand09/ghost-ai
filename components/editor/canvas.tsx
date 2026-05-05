"use client"

import { useRef } from "react"
import { ReactFlow, MiniMap, Background, BackgroundVariant, ConnectionMode, type NodeChange, type ReactFlowInstance } from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import { CanvasNodeView } from "@/components/editor/canvas-node"
import { DEFAULT_NODE_COLOR, type CanvasNode, type CanvasEdge, type CanvasShapeDragPayload } from "@/types/canvas"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes = {
  canvasNode: CanvasNodeView,
}

interface CanvasApi {
  instance: ReactFlowInstance<CanvasNode, CanvasEdge>
  createNodeFromDrop: (payload: CanvasShapeDragPayload, clientPosition: { x: number; y: number }) => void
}

interface CanvasProps {
  onReady?: (api: CanvasApi) => void
}

export function Canvas({ onReady }: CanvasProps) {
  const flowInstanceRef = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)
  const nodeCounterRef = useRef(0)
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const createNodeFromDrop = (payload: CanvasShapeDragPayload, clientPosition: { x: number; y: number }) => {
    if (!flowInstanceRef.current) {
      return
    }

    const position = flowInstanceRef.current.screenToFlowPosition({
      x: clientPosition.x - payload.size.width / 2,
      y: clientPosition.y - payload.size.height / 2,
    })

    nodeCounterRef.current += 1

    const nextNode: CanvasNode = {
      id: `${payload.shape}-${Date.now()}-${nodeCounterRef.current}`,
      type: "canvasNode",
      position,
      width: payload.size.width,
      height: payload.size.height,
      data: {
        label: "",
        color: DEFAULT_NODE_COLOR,
        shape: payload.shape,
      },
    }

    const changes: NodeChange<CanvasNode>[] = [{ type: "add", item: nextNode }]
    onNodesChange(changes)
  }

  const handleInit = (instance: ReactFlowInstance<CanvasNode, CanvasEdge>) => {
    flowInstanceRef.current = instance
    onReady?.({
      instance,
      createNodeFromDrop,
    })
  }

  return (
    <div className="w-full h-full">
      <ReactFlow<CanvasNode, CanvasEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        fitView
        nodeTypes={nodeTypes}
        onInit={handleInit}
      >
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} />
        <Cursors />
      </ReactFlow>
    </div>
  )
}
