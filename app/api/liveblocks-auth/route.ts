import { getCurrentIdentity, getProjectIfAccessible } from '@/lib/project-access'
import { getLiveblocks, getUserColor } from '@/lib/liveblocks'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { room } = await request.json()
  if (!room || typeof room !== 'string') {
    return new Response('Bad Request', { status: 400 })
  }

  const project = await getProjectIfAccessible(room, identity)
  if (!project) {
    return new Response('Forbidden', { status: 403 })
  }

  const user = await currentUser()
  const name =
    user?.fullName ??
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress ??
    'Unknown'
  const avatar = user?.imageUrl ?? ''
  const color = getUserColor(identity.userId)

  const liveblocks = getLiveblocks()

  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] })

  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: { name, avatar, color },
  })

  session.allow(room, session.FULL_ACCESS)

  const { status, body } = await session.authorize()

  return new Response(body, { status })
}
