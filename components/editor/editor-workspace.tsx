"use client"

import { useState } from "react"
import { PanelLeftClose, PanelLeftOpen, Share2, MessageSquare, LayoutTemplate } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { CanvasWrapper } from "@/components/editor/canvas-wrapper"
import { CreateProjectDialog } from "@/components/editor/create-project-dialog"
import { RenameProjectDialog } from "@/components/editor/rename-project-dialog"
import { DeleteProjectDialog } from "@/components/editor/delete-project-dialog"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { Project } from "@/hooks/use-project-dialogs"
import type { CanvasApi } from "@/components/editor/canvas"

interface EditorWorkspaceProps {
  projectName: string
  currentProjectId: string
  projects: Project[]
  isOwner: boolean
}

export function EditorWorkspace({ projectName, currentProjectId, projects, isOwner }: EditorWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [canvasApi, setCanvasApi] = useState<CanvasApi | null>(null)

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

  return (
    <div className="h-screen w-screen overflow-hidden bg-base">
      <header className="fixed top-0 left-0 right-0 z-40 flex h-12 items-center justify-between border-b border-border-default bg-surface px-3">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen((o) => !o)}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isSidebarOpen}
            className="h-8 w-8 text-copy-muted hover:text-copy-primary"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>
        </div>

        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-copy-primary">
          {projectName}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-copy-muted hover:text-copy-primary"
            onClick={() => setIsTemplatesOpen(true)}
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-copy-muted hover:text-copy-primary"
            onClick={() => setIsShareOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsAiPanelOpen((o) => !o)}
            aria-label="Toggle AI sidebar"
            aria-pressed={isAiPanelOpen}
            className="h-8 w-8 text-copy-muted hover:text-copy-primary"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <UserButton />
        </div>
      </header>

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={openCreate}
        onRenameProject={openRename}
        onDeleteProject={openDelete}
        projects={projects}
        currentProjectId={currentProjectId}
      />

      <main className="absolute inset-0 pt-12">
        <CanvasWrapper roomId={currentProjectId} onReady={setCanvasApi} />
      </main>

      {isAiPanelOpen && (
        <aside className="fixed top-12 right-0 bottom-0 w-80 border-l border-border-default bg-surface" />
      )}

      <ShareDialog
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        projectId={currentProjectId}
        isOwner={isOwner}
      />

      <StarterTemplatesModal
        open={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onImport={(template) => canvasApi?.importTemplate(template)}
      />

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
