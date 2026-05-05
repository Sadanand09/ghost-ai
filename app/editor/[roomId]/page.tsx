import { redirect } from "next/navigation"
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access"
import { getProjectsForUser } from "@/lib/projects"
import { AccessDenied } from "@/components/editor/access-denied"
import { EditorWorkspace } from "@/components/editor/editor-workspace"

interface EditorRoomPageProps {
  params: Promise<{ roomId: string }>
}

export default async function EditorRoomPage({ params }: EditorRoomPageProps) {
  const { roomId } = await params

  const identity = await getCurrentIdentity()
  if (!identity) redirect("/sign-in")

  const [project, { owned, shared }] = await Promise.all([
    getProjectIfAccessible(roomId, identity),
    getProjectsForUser(),
  ])

  if (!project) return <AccessDenied />

  const allProjects = [...owned, ...shared]

  return (
    <EditorWorkspace
      projectName={project.name}
      currentProjectId={project.id}
      projects={allProjects}
      isOwner={project.isOwned}
    />
  )
}
