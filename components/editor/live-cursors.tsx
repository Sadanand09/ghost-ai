"use client"

import { useOthers } from "@liveblocks/react"

export function LiveCursors() {
  const others = useOthers()

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence.cursor) return null

        return (
          <Cursor
            key={connectionId}
            color={info.color}
            x={presence.cursor.x}
            y={presence.cursor.y}
            name={info.name}
          />
        )
      })}
    </>
  )
}

function Cursor({ color, x, y, name }: { color: string; x: number; y: number; name: string }) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-50 transition-transform duration-100 ease-out"
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
        />
      </svg>
      <div
        className="ml-3 mt-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  )
}
