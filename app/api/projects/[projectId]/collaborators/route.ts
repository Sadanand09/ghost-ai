import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const isOwner = project.ownerId === userId
  if (!isOwner) {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
    })
    if (!collab) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
    select: { email: true },
  })

  if (collaborators.length === 0) {
    return Response.json({ collaborators: [] })
  }

  const emails = collaborators.map((c) => c.email)
  const clerk = await clerkClient()
  const { data: clerkUsers } = await clerk.users.getUserList({ emailAddress: emails, limit: 100 })

  const emailToClerkUser = new Map(
    clerkUsers.flatMap((u) => u.emailAddresses.map((e) => [e.emailAddress, u]))
  )

  const enriched = collaborators.map((c) => {
    const u = emailToClerkUser.get(c.email)
    const displayName = u
      ? ([u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || null)
      : null
    return {
      email: c.email,
      displayName,
      avatarUrl: u?.imageUrl ?? null,
    }
  })

  return Response.json({ collaborators: enriched })
}

export async function POST(
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
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const existing = await prisma.projectCollaborator.findUnique({
    where: { projectId_email: { projectId, email } },
  })
  if (existing) {
    return Response.json({ error: 'Already a collaborator' }, { status: 409 })
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: { projectId, email },
  })

  return Response.json({ collaborator }, { status: 201 })
}
