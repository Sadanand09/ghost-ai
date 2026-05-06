import { task, metadata } from "@trigger.dev/sdk"
import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"
import { getLiveblocks } from "@/lib/liveblocks"
import { NODE_COLORS, SHAPE_DEFAULT_SIZES } from "@/types/canvas"
import type { CanvasNode, CanvasEdge, NodeShape } from "@/types/canvas"

const AI_AGENT_ID = "ghost-ai-agent"
const AI_AGENT_COLOR = "#6457f9"

const designSchema = z.object({
  nodes: z
    .array(
      z.object({
        id: z.string().describe("Short kebab-case ID, e.g. 'api-gateway'"),
        label: z.string().describe("2-4 word label"),
        shape: z.enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"]),
        colorIndex: z.number().int().min(0).max(7).describe("Color palette index 0-7"),
        x: z.number().describe("X position in canvas coordinates"),
        y: z.number().describe("Y position in canvas coordinates"),
      })
    )
    .min(2)
    .max(16),
  edges: z
    .array(
      z.object({
        id: z.string().describe("Unique edge ID, e.g. 'edge-client-gateway'"),
        source: z.string().describe("Source node ID"),
        target: z.string().describe("Target node ID"),
        label: z.string().optional().describe("Short relationship label, e.g. 'reads', 'calls'"),
      })
    )
    .max(24),
})

async function setAiPresence(
  liveblocks: ReturnType<typeof getLiveblocks>,
  roomId: string,
  thinking: boolean
) {
  await liveblocks.setPresence(roomId, {
    userId: AI_AGENT_ID,
    data: { cursor: null, thinking },
    userInfo: {
      name: "Ghost AI",
      avatar: "",
      color: AI_AGENT_COLOR,
    },
    ttl: thinking ? 300 : 5,
  })
}

export const designAgentTask = task({
  id: "design-agent",
  retry: { maxAttempts: 2 },
  run: async (payload: { prompt: string; roomId: string }) => {
    const liveblocks = getLiveblocks()

    // Show AI as thinking in the room
    metadata.set("status", "thinking").set("message", "Analyzing your request...")
    await setAiPresence(liveblocks, payload.roomId, true)
    await liveblocks.broadcastEvent(payload.roomId, {
      type: "ai-status",
      status: "thinking",
      message: "Ghost AI is analyzing your request...",
    })

    // Generate structured canvas design with Gemini
    const { object: design } = await generateObject({
      model: anthropic("claude-haiku-4-5-20251001"),
      schema: designSchema,
      system: `You are an expert system architecture designer. Generate a clear, well-organized architecture diagram as structured data.

Node shapes:
- rectangle: services, APIs, servers (default choice)
- cylinder: databases, caches, object storage
- hexagon: external systems, third-party services, browsers
- circle: events, triggers, endpoints
- diamond: load balancers, gateways, routing decisions
- pill: queues, workers, async processes

Color indices (0–7):
- 0: neutral dark (default, general components)
- 1: blue (APIs, web services, HTTP)
- 2: purple (AI, ML, analytics)
- 3: orange (queues, messaging, async)
- 4: red (security, auth, critical path)
- 5: pink (frontend, UI, clients)
- 6: green (databases, storage, persistence)
- 7: teal (external, third-party, integrations)

Layout rules:
- Arrange nodes in a clear left-to-right or top-to-bottom data flow
- x spacing: 280px between columns, y spacing: 220px between rows
- Start positions at x=100, y=100
- Place related components in the same row or column
- Avoid overlapping by staggering rows when needed

Output requirements:
- Labels: 2–4 words, clear and specific (e.g. "API Gateway", "User Service")
- IDs: short kebab-case (e.g. "api-gateway", "user-db")
- Edge IDs: "edge-{source}-{target}" format
- Generate 3–15 nodes covering the core architecture
- Include edges to show data flow between components`,
      prompt: payload.prompt,
    })

    // Show AI is applying changes
    metadata.set("status", "applying").set("message", "Applying design to canvas...")
    await liveblocks.broadcastEvent(payload.roomId, {
      type: "ai-status",
      status: "applying",
      message: "Placing components on canvas...",
    })

    // Convert AI schema output to canvas node/edge format
    const canvasNodes: CanvasNode[] = design.nodes.map((node) => {
      const shape = node.shape as NodeShape
      const size = SHAPE_DEFAULT_SIZES[shape]
      const colorIdx = Math.max(0, Math.min(NODE_COLORS.length - 1, node.colorIndex))
      const color = NODE_COLORS[colorIdx]

      return {
        id: node.id,
        type: "canvasNode" as const,
        position: { x: node.x, y: node.y },
        width: size.width,
        height: size.height,
        data: {
          label: node.label,
          color: { background: color.background, foreground: color.foreground },
          shape,
        },
      }
    })

    const canvasEdges: CanvasEdge[] = design.edges.map((edge) => ({
      id: edge.id,
      type: "canvasEdge" as const,
      source: edge.source,
      target: edge.target,
      data: { label: edge.label ?? "" },
    }))

    // Mark complete and broadcast to all room participants
    metadata
      .set("status", "complete")
      .set("message", `Design ready — ${canvasNodes.length} components`)
      .set("nodeCount", canvasNodes.length)
      .set("edgeCount", canvasEdges.length)

    await liveblocks.broadcastEvent(payload.roomId, {
      type: "ai-status",
      status: "complete",
      message: `Design complete — ${canvasNodes.length} components added`,
    })

    // Clear AI presence from the room
    await setAiPresence(liveblocks, payload.roomId, false)

    return { nodes: canvasNodes, edges: canvasEdges }
  },
})
