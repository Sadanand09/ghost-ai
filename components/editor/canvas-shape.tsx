"use client"

import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { NodeColor, NodeShape } from "@/types/canvas"

interface CanvasShapeFrameProps {
  shape: NodeShape
  color: NodeColor
  width: number
  height: number
  selected?: boolean
  className?: string
  contentClassName?: string
  children?: ReactNode
  style?: CSSProperties
}

export function CanvasShapeFrame({
  shape,
  color,
  width,
  height,
  selected = false,
  className,
  contentClassName,
  children,
  style,
}: CanvasShapeFrameProps) {
  const stroke = selected ? "var(--accent-primary)" : "var(--border-subtle)"
  const sharedStyle: CSSProperties = {
    width,
    height,
    color: color.foreground,
    ...style,
  }

  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center border shadow-[0_10px_30px_rgba(0,0,0,0.28)]",
          shape === "rectangle" && "rounded-2xl",
          shape === "pill" && "rounded-full",
          shape === "circle" && "rounded-full",
          className,
        )}
        style={{
          ...sharedStyle,
          backgroundColor: color.background,
          borderColor: stroke,
        }}
      >
        <div className={cn("relative z-10 flex items-center justify-center px-4 text-center", contentClassName)}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={sharedStyle}>
      <svg
        className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {shape === "diamond" ? (
          <polygon points="50,2 98,50 50,98 2,50" fill={color.background} stroke={stroke} strokeWidth="2.2" />
        ) : null}
        {shape === "hexagon" ? (
          <polygon
            points="24,4 76,4 98,50 76,96 24,96 2,50"
            fill={color.background}
            stroke={stroke}
            strokeWidth="2.2"
          />
        ) : null}
        {shape === "cylinder" ? (
          <>
            <rect x="6" y="18" width="88" height="62" fill={color.background} stroke={stroke} strokeWidth="2.2" />
            <ellipse cx="50" cy="18" rx="44" ry="12" fill={color.background} stroke={stroke} strokeWidth="2.2" />
            <path
              d="M6 80 C6 86.6 25.7 92 50 92 C74.3 92 94 86.6 94 80"
              fill="none"
              stroke={stroke}
              strokeWidth="2.2"
            />
          </>
        ) : null}
      </svg>
      <div className={cn("relative z-10 flex h-full items-center justify-center px-5 text-center", contentClassName)}>
        {children}
      </div>
    </div>
  )
}
