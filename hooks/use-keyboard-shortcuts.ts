import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"

interface UseKeyboardShortcutsParams {
  instance: ReactFlowInstance<CanvasNode, CanvasEdge> | null
  onUndo: () => void
  onRedo: () => void
}

const VIEWPORT_ANIMATION_DURATION = 180

export function useKeyboardShortcuts({ instance, onUndo, onRedo }: UseKeyboardShortcutsParams) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreShortcut(event.target)) {
        return
      }

      const isModifierPressed = event.metaKey || event.ctrlKey

      if (isModifierPressed && event.key.toLowerCase() === "z") {
        event.preventDefault()

        if (event.shiftKey) {
          onRedo()
          return
        }

        onUndo()
        return
      }

      if (isModifierPressed && event.key.toLowerCase() === "y") {
        event.preventDefault()
        onRedo()
        return
      }

      if (!instance) {
        return
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        void instance.zoomIn({ duration: VIEWPORT_ANIMATION_DURATION })
        return
      }

      if (event.key === "-") {
        event.preventDefault()
        void instance.zoomOut({ duration: VIEWPORT_ANIMATION_DURATION })
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [instance, onRedo, onUndo])
}

function shouldIgnoreShortcut(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return Boolean(target.closest("input, textarea, [contenteditable='true'], [contenteditable=''], [role='textbox']"))
}
