"use client"

import { useEffect, useState, useRef } from "react"
import { useMutation, useStorage } from "@liveblocks/react"
import { type CanvasNode, type CanvasEdge } from "@/types/canvas"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

export function useCanvasPersistence(projectId: string, nodes: CanvasNode[], edges: CanvasEdge[], isOwner: boolean) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const lastSavedJsonRef = useRef<string>("")
  const hasLoadedRef = useRef(false)

  // Load canvas if storage is empty
  const loadCanvas = useMutation(({ storage }, canvasData: { nodes: any[]; edges: any[] }) => {
    const flow = storage.get("flow") as any
    if (!flow) return

    const nodesMap = flow.get("nodes")
    const edgesMap = flow.get("edges")

    if (!nodesMap || !edgesMap) return

    // Clear and set
    nodesMap.clear()
    edgesMap.clear()

    canvasData.nodes.forEach((node) => {
      nodesMap.set(node.id, node)
    })
    canvasData.edges.forEach((edge) => {
      edgesMap.set(edge.id, edge)
    })
  }, [])

  useEffect(() => {
    if (!isOwner || hasLoadedRef.current) return

    const checkAndLoad = async () => {
      // If there's already content, don't load from backup
      if (nodes.length > 0 || edges.length > 0) {
        hasLoadedRef.current = true
        return
      }

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`)
        if (!response.ok) return

        const data = await response.json()
        if (data.canvas && (data.canvas.nodes?.length > 0 || data.canvas.edges?.length > 0)) {
          loadCanvas(data.canvas)
          lastSavedJsonRef.current = JSON.stringify(data.canvas)
        }
        hasLoadedRef.current = true
      } catch (error) {
        console.error("Failed to load canvas backup:", error)
        hasLoadedRef.current = true
      }
    }

    void checkAndLoad()
  }, [projectId, nodes.length, edges.length, loadCanvas])

  // Autosave (owner only — collaborators sync via Liveblocks, not the DB)
  useEffect(() => {
    if (!isOwner || !hasLoadedRef.current) return

    // Don't save if nothing has changed since last save
    const currentJson = JSON.stringify({ nodes, edges })
    if (currentJson === lastSavedJsonRef.current) return

    // Don't save if empty (unless it was non-empty before, but let's be safe)
    if (nodes.length === 0 && edges.length === 0 && !lastSavedJsonRef.current) return

    const timer = setTimeout(async () => {
      setSaveStatus("saving")
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: currentJson,
        })

        if (!response.ok) {
          throw new Error("Failed to save")
        }

        lastSavedJsonRef.current = currentJson
        setSaveStatus("saved")
        
        // Reset to idle after a while
        setTimeout(() => setSaveStatus("idle"), 3000)
      } catch (error) {
        console.error("Autosave failed:", error)
        setSaveStatus("error")
      }
    }, 3000) // 3 second debounce

    return () => clearTimeout(timer)
  }, [nodes, edges, projectId])

  return { saveStatus }
}
