"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"
import type { CanvasTemplate } from "./starter-templates"

interface CanvasEditingContextValue {
  replaceNode: (nodeId: string, updater: (node: CanvasNode) => CanvasNode) => void
  replaceEdge: (edgeId: string, updater: (edge: CanvasEdge) => CanvasEdge) => void
  importTemplate: (template: CanvasTemplate) => void
}

const CanvasEditingContext = createContext<CanvasEditingContextValue | null>(null)

interface CanvasEditingProviderProps {
  value: CanvasEditingContextValue
  children: ReactNode
}

export function CanvasEditingProvider({ value, children }: CanvasEditingProviderProps) {
  return <CanvasEditingContext.Provider value={value}>{children}</CanvasEditingContext.Provider>
}

export function useCanvasEditing() {
  const context = useContext(CanvasEditingContext)

  if (!context) {
    throw new Error("useCanvasEditing must be used within CanvasEditingProvider")
  }

  return context
}
