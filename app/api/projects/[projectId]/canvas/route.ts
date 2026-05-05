import { put } from '@vercel/blob'
import { getCurrentIdentity, getProjectIfAccessible } from '@/lib/project-access'
import prisma from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params
  const project = await getProjectIfAccessible(projectId, identity)

  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (!project.isOwned) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const canvasData = JSON.stringify(body)

  try {
    const blob = await put(`projects/${projectId}/canvas.json`, canvasData, {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasUrl: blob.url },
    })

    return Response.json({ url: blob.url })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Failed to upload canvas to blob:', msg)
    return Response.json({ error: 'Failed to save canvas', detail: msg }, { status: 500 })
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params
  const project = await getProjectIfAccessible(projectId, identity)

  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const raw = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasUrl: true },
  })

  if (!raw?.canvasUrl) {
    return Response.json({ canvas: null })
  }

  try {
    const response = await fetch(raw.canvasUrl, {
      headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch from blob: ${response.statusText}`)
    }

    const canvas = await response.json()
    return Response.json({ canvas })
  } catch (error) {
    console.error('Failed to fetch canvas from blob:', error)
    return Response.json({ error: 'Failed to load canvas' }, { status: 500 })
  }
}
