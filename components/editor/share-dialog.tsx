"use client"

import { useState, useEffect, useCallback } from "react"
import { UserPlus, Link2, Check, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Collaborator {
  email: string
  displayName: string | null
  avatarUrl: string | null
}

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
  isOwner: boolean
}

export function ShareDialog({ open, onClose, projectId, isOwner }: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCollaborators = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`)
      if (!res.ok) return
      const data = await res.json()
      setCollaborators(data.collaborators)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (open) {
      setError(null)
      setInviteEmail("")
      loadCollaborators()
    }
  }, [open, loadCollaborators])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    const email = inviteEmail.trim()
    if (!email) return
    setIsInviting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to invite")
        return
      }
      setInviteEmail("")
      await loadCollaborators()
    } finally {
      setIsInviting(false)
    }
  }

  async function handleRemove(email: string) {
    setRemovingEmail(email)
    try {
      await fetch(`/api/projects/${projectId}/collaborators/${encodeURIComponent(email)}`, {
        method: "DELETE",
      })
      setCollaborators((prev) => prev.filter((c) => c.email !== email))
    } finally {
      setRemovingEmail(null)
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton className="sm:max-w-md rounded-3xl bg-surface border-border-default p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-default">
          <DialogTitle className="text-base font-semibold text-copy-primary">Share project</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 flex flex-col gap-4">
          {isOwner && (
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input
                type="email"
                placeholder="Invite by email"
                value={inviteEmail}
                onChange={(e) => { setInviteEmail(e.target.value); setError(null) }}
                className="flex-1 h-8 text-sm bg-elevated border-border-default text-copy-primary placeholder:text-copy-faint"
                disabled={isInviting}
              />
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs shrink-0"
                disabled={isInviting || !inviteEmail.trim()}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Invite
              </Button>
            </form>
          )}

          {error && (
            <p className="text-xs text-state-error -mt-2">{error}</p>
          )}

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-copy-muted mb-1">
              {collaborators.length === 0 && !isLoading ? "No collaborators yet" : "Collaborators"}
            </p>

            {isLoading ? (
              <p className="text-xs text-copy-faint py-2">Loading…</p>
            ) : (
              <ScrollArea className="max-h-52">
                <ul className="flex flex-col gap-0.5">
                  {collaborators.map((c) => (
                    <li
                      key={c.email}
                      className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-elevated transition-colors"
                    >
                      {c.avatarUrl ? (
                        // eslint-disable-next-line @next/next-image/no-img-element
                        <img
                          src={c.avatarUrl}
                          alt={c.displayName ?? c.email}
                          className="h-6 w-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-elevated shrink-0 flex items-center justify-center text-xs font-medium text-copy-muted border border-border-default">
                          {(c.displayName ?? c.email)[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {c.displayName && (
                          <p className="text-xs font-medium text-copy-primary truncate">{c.displayName}</p>
                        )}
                        <p className={`text-xs truncate ${c.displayName ? "text-copy-muted" : "text-copy-primary"}`}>
                          {c.email}
                        </p>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-copy-faint hover:text-state-error shrink-0"
                          onClick={() => handleRemove(c.email)}
                          disabled={removingEmail === c.email}
                          aria-label={`Remove ${c.email}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>

          {isOwner && (
            <div className="pt-2 border-t border-border-default">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-full text-xs text-copy-muted hover:text-copy-primary gap-1.5 justify-start"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-state-success" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy link"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
