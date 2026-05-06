import { tasks } from '@trigger.dev/sdk'
import prisma from '@/lib/prisma'
import { getProjectIfAccessible, getCurrentIdentity } from '@/lib/project-access'
import type { generateSpecTask } from '@/trigger/generate-spec'

interface RawChatMessage {
  role?: unknown
  content?: unknown
}

interface RawNode {
  id?: unknown
  data?: { label?: unknown; shape?: unknown }
}

interface RawEdge {
  id?: unknown
  source?: unknown
  target?: unknown
  data?: { label?: unknown }
}

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { roomId, chatHistory, nodes, edges } = body as {
    roomId?: unknown
    chatHistory?: unknown
    nodes?: unknown
    edges?: unknown
  }

  if (
    typeof roomId !== 'string' ||
    !Array.isArray(chatHistory) ||
    !Array.isArray(nodes) ||
    !Array.isArray(edges)
  ) {
    return Response.json(
      { error: 'Missing or invalid fields: roomId, chatHistory, nodes, edges' },
      { status: 400 }
    )
  }

  const project = await getProjectIfAccessible(roomId, identity)
  if (!project) {
    return Response.json({ error: 'Project not found or access denied' }, { status: 403 })
  }

  const mappedChat = (chatHistory as RawChatMessage[]).map((m) => ({
    role: String(m.role ?? ''),
    content: String(m.content ?? ''),
  }))

  const mappedNodes = (nodes as RawNode[]).map((n) => ({
    id: String(n.id ?? ''),
    label: String(n.data?.label ?? ''),
    shape: n.data?.shape ? String(n.data.shape) : undefined,
  }))

  const mappedEdges = (edges as RawEdge[]).map((e) => ({
    id: String(e.id ?? ''),
    source: String(e.source ?? ''),
    target: String(e.target ?? ''),
    label: e.data?.label ? String(e.data.label) : undefined,
  }))

  const handle = await tasks.trigger<typeof generateSpecTask>('generate-spec', {
    projectId: project.id,
    roomId,
    chatHistory: mappedChat,
    nodes: mappedNodes,
    edges: mappedEdges,
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId: identity.userId,
    },
  })

  return Response.json({ runId: handle.id }, { status: 201 })
}
