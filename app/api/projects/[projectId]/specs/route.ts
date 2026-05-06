import { getCurrentIdentity, getProjectIfAccessible } from '@/lib/project-access'
import prisma from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const identity = await getCurrentIdentity()
  if (!identity) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await params
  const project = await getProjectIfAccessible(projectId, identity)
  if (!project) return Response.json({ error: 'Not found' }, { status: 404 })

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json({
    specs: specs.map((s) => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      filename: `spec-${s.id}.md`,
    })),
  })
}
