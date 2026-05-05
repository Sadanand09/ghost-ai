"use client"

import { useState, useRef } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  type Connection,
  type DefaultEdgeOptions,
  type EdgeChange,
  type NodeChange,
  type ReactFlowInstance,
} from "@xyflow/react"
import { useCanRedo, useCanUndo, useRedo, useUndo } from "@liveblocks/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import { CanvasControlBar } from "@/components/editor/canvas-control-bar"
import { CanvasEdgeView } from "@/components/editor/canvas-edge"
import { CanvasEditingProvider } from "@/components/editor/canvas-editing-context"
import { CanvasNodeView } from "@/components/editor/canvas-node"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { DEFAULT_NODE_COLOR, type CanvasNode, type CanvasEdge, type CanvasShapeDragPayload } from "@/types/canvas"
import { type CanvasTemplate } from "./starter-templates"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"

const nodeTypes = {
  canvasNode: CanvasNodeView,
}

const edgeTypes = {
  canvasEdge: CanvasEdgeView,
}

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--text-primary)",
  },
  style: {
    stroke: "var(--text-primary)",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  interactionWidth: 28,
}

export interface CanvasApi {
  instance: ReactFlowInstance<CanvasNode, CanvasEdge>
  createNodeFromDrop: (payload: CanvasShapeDragPayload, clientPosition: { x: number; y: number }) => void
  importTemplate: (template: CanvasTemplate) => void
}

interface CanvasProps {
  onReady?: (api: CanvasApi) => void
}

export function Canvas({ onReady }: CanvasProps) {
  const flowInstanceRef = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)
  const nodeCounterRef = useRef(0)
  const edgeCounterRef = useRef(0)
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  useKeyboardShortcuts({
    instance: flowInstance,
    onUndo: undo,
    onRedo: redo,
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

  const importTemplate = (template: CanvasTemplate) => {
    if (!flowInstanceRef.current) return

    const combinedNodeChanges: NodeChange<CanvasNode>[] = [
      ...nodes.map((n) => ({ id: n.id, type: "remove" as const })),
      ...template.nodes.map((n) => ({ type: "add" as const, item: n })),
    ]

    const combinedEdgeChanges: EdgeChange<CanvasEdge>[] = [
      ...edges.map((e) => ({ id: e.id, type: "remove" as const })),
      ...template.edges.map((e) => ({ type: "add" as const, item: e })),
    ]

    onNodesChange(combinedNodeChanges)
    onEdgesChange(combinedEdgeChanges)

    setTimeout(() => {
      flowInstanceRef.current?.fitView({ duration: 400, padding: 0.2 })
    }, 50)
  }

  const handleInit = (instance: ReactFlowInstance<CanvasNode, CanvasEdge>) => {
    flowInstanceRef.current = instance
    setFlowInstance(instance)
    onReady?.({
      instance,
      createNodeFromDrop,
      importTemplate,
    })
  }

  const replaceNode = (nodeId: string, updater: (node: CanvasNode) => CanvasNode) => {
    const currentNode = nodes.find((node) => node.id === nodeId)

    if (!currentNode) {
      return
    }

    onNodesChange([
      {
        id: nodeId,
        type: "replace",
        item: updater(currentNode),
      },
    ])
  }

  const replaceEdge = (edgeId: string, updater: (edge: CanvasEdge) => CanvasEdge) => {
    const currentEdge = edges.find((edge) => edge.id === edgeId)

    if (!currentEdge) {
      return
    }

    onEdgesChange([
      {
        id: edgeId,
        type: "replace",
        item: updater(currentEdge),
      },
    ])
  }

  const createEdgeFromConnection = (connection: Connection): CanvasEdge | null => {
    if (!connection.source || !connection.target) {
      return null
    }

    edgeCounterRef.current += 1

    return {
      id: `edge-${Date.now()}-${edgeCounterRef.current}`,
      type: "canvasEdge",
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      data: {
        label: "",
      },
    }
  }

  const handleConnect = (connection: Connection) => {
    const nextEdge = createEdgeFromConnection(connection)

    if (!nextEdge) {
      onConnect(connection)
      return
    }

    const changes: EdgeChange<CanvasEdge>[] = [{ type: "add", item: nextEdge }]
    onEdgesChange(changes)
  }

  const handleZoomIn = () => {
    if (!flowInstance) {
      return
    }

    void flowInstance.zoomIn({ duration: 180 })
  }

  const handleZoomOut = () => {
    if (!flowInstance) {
      return
    }

    void flowInstance.zoomOut({ duration: 180 })
  }

  const handleFitView = () => {
    if (!flowInstance) {
      return
    }

    void flowInstance.fitView({ duration: 220, padding: 0.16 })
  }

  return (
    <CanvasEditingProvider value={{ replaceNode, replaceEdge, importTemplate }}>
      <div className="relative h-full w-full">
        <ReactFlow<CanvasNode, CanvasEdge>
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onDelete={onDelete}
          connectionMode={ConnectionMode.Loose}
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onInit={handleInit}
        >
          <Background variant={BackgroundVariant.Dots} />
          <Cursors />
        </ReactFlow>
        <CanvasControlBar
          canUndo={canUndo}
          canRedo={canRedo}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onUndo={undo}
          onRedo={redo}
        />
      </div>
    </CanvasEditingProvider>
  )
}
