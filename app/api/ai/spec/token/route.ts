import { auth } from '@trigger.dev/sdk'
import { getCurrentIdentity } from '@/lib/project-access'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { runId } = body as { runId?: string }

  if (!runId) {
    return Response.json({ error: 'Missing required field: runId' }, { status: 400 })
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
    select: { userId: true },
  })

  if (!taskRun || taskRun.userId !== identity.userId) {
    return Response.json({ error: 'Run not found or access denied' }, { status: 403 })
  }

  const publicToken = await auth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: '1h',
  })

  return Response.json({ token: publicToken })
}
