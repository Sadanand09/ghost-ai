"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useProjectDialogs, toSlug } from "./use-project-dialogs"

function generateSuffix(): string {
  return Math.random().toString(36).slice(2, 6)
}

export function useProjectActions() {
  const router = useRouter()
  const pathname = usePathname()
  const dialogs = useProjectDialogs()
  const [roomSuffix, setRoomSuffix] = useState("")

  function openCreate() {
    setRoomSuffix(generateSuffix())
    dialogs.openCreate()
  }

  const slug = toSlug(dialogs.name)
  const roomId = slug ? `${slug}-${roomSuffix}` : roomSuffix

  async function handleCreate() {
    dialogs.setIsLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: dialogs.name, id: roomId }),
      })
      if (!res.ok) throw new Error("Failed to create project")
      const { project } = await res.json()
      dialogs.closeDialog()
      router.push(`/editor/${project.id}`)
    } catch (err) {
      console.error(err)
    } finally {
      dialogs.setIsLoading(false)
    }
  }

  async function handleRename() {
    const project = dialogs.activeProject
    if (!project) return
    dialogs.setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: dialogs.name }),
      })
      if (!res.ok) throw new Error("Failed to rename project")
      dialogs.closeDialog()
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      dialogs.setIsLoading(false)
    }
  }

  async function handleDelete() {
    const project = dialogs.activeProject
    if (!project) return
    dialogs.setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete project")
      dialogs.closeDialog()
      if (pathname === `/editor/${project.id}`) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      dialogs.setIsLoading(false)
    }
  }

  return {
    openDialog: dialogs.openDialog,
    activeProject: dialogs.activeProject,
    name: dialogs.name,
    roomId,
    isLoading: dialogs.isLoading,
    setName: dialogs.setName,
    openCreate,
    openRename: dialogs.openRename,
    openDelete: dialogs.openDelete,
    closeDialog: dialogs.closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  }
}
