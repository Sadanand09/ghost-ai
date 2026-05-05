import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; email: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId, email: rawEmail } = await params
  const email = decodeURIComponent(rawEmail).toLowerCase()

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const collab = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
  })
  if (!collab) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.projectCollaborator.delete({
    where: { projectId_email: { projectId, email } },
  })

  return new Response(null, { status: 204 })
}
