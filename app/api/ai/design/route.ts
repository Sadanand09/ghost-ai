import { tasks, auth as triggerAuth } from '@trigger.dev/sdk'
import prisma from '@/lib/prisma'
import { getProjectIfAccessible, getCurrentIdentity } from '@/lib/project-access'
import type { designAgentTask } from '@/trigger/design-agent'

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { prompt, roomId, projectId } = body as {
    prompt?: string
    roomId?: string
    projectId?: string
  }

  if (!prompt || !roomId || !projectId) {
    return Response.json({ error: 'Missing required fields: prompt, roomId, projectId' }, { status: 400 })
  }

  const project = await getProjectIfAccessible(projectId, identity)
  if (!project) {
    return Response.json({ error: 'Project not found or access denied' }, { status: 403 })
  }

  const handle = await tasks.trigger<typeof designAgentTask>('design-agent', {
    prompt,
    roomId,
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId: identity.userId,
    },
  })

  const publicToken = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [handle.id] } },
  })

  return Response.json({ runId: handle.id, publicToken }, { status: 201 })
}
