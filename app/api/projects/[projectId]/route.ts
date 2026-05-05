import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  if (typeof body?.name !== 'string' || !body.name.trim()) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { name: body.name.trim() },
  })

  return Response.json({ project: updated })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.project.delete({ where: { id: projectId } })

  return new Response(null, { status: 204 })
}
