import { getCurrentIdentity, getProjectIfAccessible } from '@/lib/project-access'
import prisma from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId, specId } = await params

  const project = await getProjectIfAccessible(projectId, identity)
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
    select: { projectId: true, filePath: true, createdAt: true },
  })

  if (!spec) {
    return Response.json({ error: 'Spec not found' }, { status: 404 })
  }

  if (spec.projectId !== projectId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const blobResponse = await fetch(spec.filePath)
  if (!blobResponse.ok) {
    return Response.json({ error: 'Failed to retrieve spec file' }, { status: 502 })
  }

  const content = await blobResponse.text()
  const filename = `spec-${specId}.md`

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
