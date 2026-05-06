import type { LiveList } from "@liveblocks/client"
import type { LiveblocksFlow } from "@liveblocks/react-flow"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"
import type { ChatMessage } from "@/types/tasks"

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      thinking: boolean
    }

    Storage: {
      flow: LiveblocksFlow<CanvasNode, CanvasEdge>
      chatMessages: LiveList<ChatMessage>
    }

    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        color: string
      }
    }

    RoomEvent: {
      type: "ai-status"
      status: "thinking" | "applying" | "complete" | "error"
      message: string
    }

    ThreadMetadata: {}

    RoomInfo: {}
  }
}

export {}
