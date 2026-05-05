import type { JsonObject } from "@liveblocks/client"
import type { Edge, Node } from "@xyflow/react"

export const NODE_COLORS = [
  { background: "#1F1F1F", foreground: "#EDEDED" },
  { background: "#10233D", foreground: "#52A8FF" },
  { background: "#2E1938", foreground: "#BF7AF0" },
  { background: "#331B00", foreground: "#FF990A" },
  { background: "#3C1618", foreground: "#FF6166" },
  { background: "#3A1726", foreground: "#F75F8F" },
  { background: "#0F2E18", foreground: "#62C073" },
  { background: "#062822", foreground: "#0AC7B4" },
] as const

export const NODE_SHAPES = ["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"] as const

export type NodeShape = (typeof NODE_SHAPES)[number]

export interface NodeColor extends JsonObject {
  background: string
  foreground: string
}

export interface NodeSize {
  width: number
  height: number
}

export interface NodeData extends JsonObject {
  label: string
  color: NodeColor
  shape: NodeShape
}

export interface CanvasShapeDragPayload {
  shape: NodeShape
  size: NodeSize
}

export const DEFAULT_NODE_COLOR: NodeColor = NODE_COLORS[0]

export const SHAPE_DEFAULT_SIZES: Record<NodeShape, NodeSize> = {
  rectangle: { width: 208, height: 112 },
  diamond: { width: 192, height: 136 },
  circle: { width: 132, height: 132 },
  pill: { width: 216, height: 96 },
  cylinder: { width: 188, height: 120 },
  hexagon: { width: 196, height: 116 },
}

export const SHAPE_DRAG_MIME_TYPE = "application/x-ghost-shape"

export type CanvasNode = Node<NodeData, "canvasNode">
export type CanvasEdge = Edge<Record<string, unknown>, "canvasEdge">
