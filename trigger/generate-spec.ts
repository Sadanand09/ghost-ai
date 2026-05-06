import { schemaTask, metadata } from "@trigger.dev/sdk"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { put } from "@vercel/blob"
import { z } from "zod"
import prisma from "@/lib/prisma"

const specPayloadSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    })
  ),
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      shape: z.string().optional(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      label: z.string().optional(),
    })
  ),
})

export const generateSpecTask = schemaTask({
  id: "generate-spec",
  schema: specPayloadSchema,
  retry: { maxAttempts: 2 },
  run: async (payload) => {
    const { projectId, nodes, edges, chatHistory } = payload

    metadata.set("status", "thinking").set("message", "Analyzing canvas architecture...")

    const nodeLines = nodes.map((n) => `- ${n.label}${n.shape ? ` (${n.shape})` : ""} [id: ${n.id}]`)
    const edgeLines = edges.map((e) => {
      const sourceName = nodes.find((n) => n.id === e.source)?.label ?? e.source
      const targetName = nodes.find((n) => n.id === e.target)?.label ?? e.target
      const rel = e.label ? ` [${e.label}]` : ""
      return `- ${sourceName} → ${targetName}${rel}`
    })

    const chatLines =
      chatHistory.length > 0
        ? chatHistory.map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n")
        : "(No chat history)"

    metadata.set("status", "generating").set("message", "Generating specification...")

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: `You are a senior software architect. Generate a comprehensive Markdown technical specification from an architecture diagram.

Structure the output as follows:
1. Project title and executive overview (2-3 sentences)
2. Architecture overview — describe the overall system design approach
3. Components — one subsection per node with purpose, responsibilities, and interfaces
4. Data flows — describe how data moves between components referencing the edges
5. Architectural decisions — key trade-offs and design rationale
6. Technology considerations — suggested technologies per component where relevant

Write in clear, professional technical prose. Be specific. Do not include placeholder text.`,
      prompt: `Generate a technical specification for the following system architecture.

## Components
${nodeLines.join("\n")}

## Data Flows
${edgeLines.join("\n")}

## Design Context
${chatLines}`,
    })

    metadata.set("status", "saving").set("message", "Persisting specification...")

    const specRecord = await prisma.projectSpec.create({
      data: { projectId, filePath: "" },
    })

    const blob = await put(
      `specs/${projectId}/${specRecord.id}.md`,
      text,
      { access: "public", contentType: "text/markdown", allowOverwrite: false }
    )

    await prisma.projectSpec.update({
      where: { id: specRecord.id },
      data: { filePath: blob.url },
    })

    metadata
      .set("status", "complete")
      .set("message", "Specification generated")
      .set("specId", specRecord.id)
      .set("nodeCount", nodes.length)
      .set("edgeCount", edges.length)

    return { spec: text, specId: specRecord.id }
  },
})
