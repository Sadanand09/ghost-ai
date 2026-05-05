"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { CreateProjectDialog } from "@/components/editor/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog"
import { useProjectDialogs, toSlug, type Project } from "@/hooks/use-project-dialogs"
import { Button } from "@/components/ui/button"

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  const {
    openDialog,
    activeProject,
    name,
    slug,
    setName,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
  } = useProjectDialogs()

  function handleCreate(projectName: string, projectSlug: string) {
    setProjects((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: projectName, slug: projectSlug, isOwned: true },
    ])
    closeDialog()
  }

  function handleRename(newName: string) {
    if (!activeProject) return
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id
          ? { ...p, name: newName, slug: toSlug(newName) }
          : p
      )
    )
    closeDialog()
  }

  function handleDelete() {
    if (!activeProject) return
    setProjects((prev) => prev.filter((p) => p.id !== activeProject.id))
    closeDialog()
  }

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
        slug={slug}
        onNameChange={setName}
      />
      <RenameProjectDialog
        open={openDialog === "rename"}
        onClose={closeDialog}
        onConfirm={handleRename}
        project={activeProject}
        name={name}
        onNameChange={setName}
      />
      <DeleteProjectDialog
        open={openDialog === "delete"}
        onClose={closeDialog}
        onConfirm={handleDelete}
        project={activeProject}
      />
    </div>
  )
}
