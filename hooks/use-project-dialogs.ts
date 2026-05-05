"use client"

import { useState } from "react"

export interface Project {
  id: string
  name: string
  slug: string
  isOwned: boolean
}

type DialogType = "create" | "rename" | "delete" | null

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function useProjectDialogs() {
  const [openDialog, setOpenDialog] = useState<DialogType>(null)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [name, setNameValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function openCreate() {
    setNameValue("")
    setActiveProject(null)
    setOpenDialog("create")
  }

  function openRename(project: Project) {
    setNameValue(project.name)
    setActiveProject(project)
    setOpenDialog("rename")
  }

  function openDelete(project: Project) {
    setActiveProject(project)
    setOpenDialog("delete")
  }

  function closeDialog() {
    setOpenDialog(null)
    setActiveProject(null)
    setNameValue("")
  }

  const slug = toSlug(name)

  return {
    openDialog,
    activeProject,
    name,
    slug,
    isLoading,
    setIsLoading,
    setName: setNameValue,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
  }
}
