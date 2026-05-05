"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog"
import { useProjectActions } from "@/hooks/use-project-actions"
import { Button } from "@/components/ui/button"
import type { ProjectData } from "@/lib/projects"

interface EditorHomeProps {
  ownedProjects: ProjectData[]
  sharedProjects: ProjectData[]
}

export function EditorHome({ ownedProjects, sharedProjects }: EditorHomeProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    openDialog,
    activeProject,
    name,
    roomId,
    isLoading,
    setName,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectActions()

  const projects = [
    ...ownedProjects,
    ...sharedProjects,
  ]

  return (
    <div className="flex h-screen flex-col bg-base overflow-hidden">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewProject={openCreate}
        onRenameProject={openRename}
        onDeleteProject={openDelete}
        projects={projects}
      />

      <main className="flex flex-1 flex-col items-center justify-center gap-3 pt-12">
        <h1 className="text-xl font-semibold text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-copy-secondary">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
        <Button className="mt-2 gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </main>

      <CreateProjectDialog
        open={openDialog === "create"}
        onClose={closeDialog}
        onConfirm={handleCreate}
        name={name}
        roomId={roomId}
        onNameChange={setName}
        isLoading={isLoading}
      />
      <RenameProjectDialog
        open={openDialog === "rename"}
        onClose={closeDialog}
        onConfirm={handleRename}
        project={activeProject}
        name={name}
        onNameChange={setName}
        isLoading={isLoading}
      />
      <DeleteProjectDialog
        open={openDialog === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        project={activeProject}
        isLoading={isLoading}
      />
    </div>
  )
}
