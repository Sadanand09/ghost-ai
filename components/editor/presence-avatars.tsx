"use client"

import { useOthers } from "@liveblocks/react"
import { useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

const MAX_AVATARS = 5

export function PresenceAvatars() {
  const others = useOthers()
  const { user } = useUser()

  // useOthers already excludes the current user by default in Liveblocks react hooks
  // but the spec asks to be explicit about it if needed.
  const collaborators = others.filter((other) => other.id !== user?.id)
  
  if (collaborators.length === 0) return null

  const visibleCollaborators = collaborators.slice(0, MAX_AVATARS)
  const overflowCount = collaborators.length - MAX_AVATARS

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 mr-4">
        {visibleCollaborators.map((other) => {
          const { name, avatar, color } = other.info
          return (
            <div
              key={other.id}
              className="relative h-8 w-8 rounded-full border-2 border-surface bg-elevated ring-1 ring-border-default overflow-hidden flex items-center justify-center"
              title={name}
              style={{ zIndex: collaborators.length - collaborators.indexOf(other) }}
            >
              {avatar ? (
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-copy-primary">
                  {getInitials(name)}
                </span>
              )}
              {/* Optional: border color matching user color? Spec says "subtle ring" */}
            </div>
          )
        })}
        {overflowCount > 0 && (
          <div className="relative h-8 w-8 rounded-full border-2 border-surface bg-elevated ring-1 ring-border-default flex items-center justify-center text-[10px] font-bold text-copy-muted z-0">
            +{overflowCount}
          </div>
        )}
      </div>
      <div className="h-4 w-px bg-border-default mr-4" />
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
