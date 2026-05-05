"use client"

import Link from "next/link"
import { Plus, X, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Project } from "@/hooks/use-project-dialogs"

interface ProjectItemProps {
  project: Project
  isActive?: boolean
  showActions: boolean
  onRename: () => void
  onDelete: () => void
  onClose: () => void
}

function ProjectItem({ project, isActive, showActions, onRename, onDelete, onClose }: ProjectItemProps) {
  return (
    <Link
      href={`/editor/${project.id}`}
      onClick={onClose}
      className={`group flex items-center justify-between rounded-xl px-2 py-1.5 ${
        isActive ? "bg-elevated" : "hover:bg-elevated"
      }`}
    >
      <span className="truncate text-sm text-copy-primary">{project.name}</span>
      {showActions && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename() }}
            className="h-6 w-6 text-copy-muted hover:text-copy-primary"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete() }}
            className="h-6 w-6 text-copy-muted hover:text-error"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </Link>
  )
}

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewProject: () => void
  onRenameProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
  projects: Project[]
  currentProjectId?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
  onRenameProject,
  onDeleteProject,
  projects,
  currentProjectId,
}: ProjectSidebarProps) {
  const myProjects = projects.filter((p) => p.isOwned)
  const sharedProjects = projects.filter((p) => !p.isOwned)

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:bg-transparent"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed top-0 left-0 z-40 flex h-full w-72 flex-col border-r border-border-default bg-surface shadow-xl transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-12 items-center justify-between border-b border-border-default px-4">
          <span className="text-sm font-semibold text-copy-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-copy-muted hover:text-copy-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden p-3">
          <Tabs defaultValue="my-projects" className="flex-1">
            <TabsList className="w-full">
              <TabsTrigger
                value="my-projects"
                className="flex-1 text-copy-secondary data-active:text-copy-primary"
              >
                My Projects
              </TabsTrigger>
              <TabsTrigger
                value="shared"
                className="flex-1 text-copy-secondary data-active:text-copy-primary"
              >
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-projects" className="mt-3">
              {myProjects.length === 0 ? (
                <p className="py-8 text-center text-xs text-copy-muted">
                  No projects yet
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {myProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === currentProjectId}
                      showActions
                      onRename={() => onRenameProject(project)}
                      onDelete={() => onDeleteProject(project)}
                      onClose={onClose}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared" className="mt-3">
              {sharedProjects.length === 0 ? (
                <p className="py-8 text-center text-xs text-copy-muted">
                  No shared projects
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === currentProjectId}
                      showActions={false}
                      onRename={() => {}}
                      onDelete={() => {}}
                      onClose={onClose}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t border-border-default p-3">
          <Button className="w-full gap-2" variant="default" onClick={onNewProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
