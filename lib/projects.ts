import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export interface ProjectData {
  id: string
  name: string
  isOwned: boolean
}

export async function getProjectsForUser(): Promise<{
  owned: ProjectData[]
  shared: ProjectData[]
}> {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()])
  if (!userId || !user) return { owned: [], shared: [] }

  const email = user.emailAddresses[0]?.emailAddress ?? null

  const [owned, collaborations] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true },
    }),
    email
      ? prisma.projectCollaborator.findMany({
          where: { email },
          include: { project: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
  ])

  return {
    owned: owned.map((p) => ({ ...p, isOwned: true })),
    shared: collaborations.map((c) => ({ ...c.project, isOwned: false })),
  }
}
