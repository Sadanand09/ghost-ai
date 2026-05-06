import { z } from "zod"

export const aiStatusFeedMessageSchema = z.object({
  type: z.literal("ai-status"),
  status: z.enum(["thinking", "applying", "complete", "error"]),
  message: z.string(),
  text: z.string().optional(),
})

export type AiStatusFeedMessage = z.infer<typeof aiStatusFeedMessageSchema>

export const chatMessageSchema = z.object({
  id: z.string(),
  sender: z.object({
    id: z.string(),
    name: z.string(),
  }),
  role: z.enum(["user", "ai"]),
  content: z.string(),
  timestamp: z.number(),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
