import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export interface ClerkIdentity {
  userId: string
  email: string | null
}

export async function getCurrentIdentity(): Promise<ClerkIdentity | null> {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()])
  if (!userId || !user) return null
  const email = user.emailAddresses[0]?.emailAddress ?? null
  return { userId, email }
}

export interface AccessibleProject {
  id: string
  name: string
  isOwned: boolean
}

export async function getProjectIfAccessible(
  roomId: string,
  identity: ClerkIdentity,
): Promise<AccessibleProject | null> {
  const project = await prisma.project.findUnique({
    where: { id: roomId },
    select: { id: true, name: true, ownerId: true },
  })

  if (!project) return null

  if (project.ownerId === identity.userId) {
    return { id: project.id, name: project.name, isOwned: true }
  }

  if (identity.email) {
    const collab = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId: roomId, email: identity.email } },
      select: { projectId: true },
    })
    if (collab) {
      return { id: project.id, name: project.name, isOwned: false }
    }
  }

  return null
}
