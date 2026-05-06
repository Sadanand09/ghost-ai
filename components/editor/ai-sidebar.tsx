"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bot, Send, X, FileText, Download, Loader2, Hash } from "lucide-react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { useEventListener, useSelf, useStorage, useMutation } from "@liveblocks/react"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { aiStatusFeedMessageSchema, chatMessageSchema, type AiStatusFeedMessage, type ChatMessage } from "@/types/tasks"
import type { designAgentTask } from "@/trigger/design-agent"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

interface SpecMeta {
  id: string
  createdAt: string
  filename: string
}

const SUGGESTED_PROMPTS = [
  "Design an e-commerce backend",
  "Create a real-time chat architecture",
  "Build a CI/CD pipeline",
]

const AI_SENDER = { id: "ghost-ai", name: "Ghost AI" }

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onApplyDesign: (nodes: CanvasNode[], edges: CanvasEdge[]) => void
}

export function AiSidebar({ isOpen, onClose, projectId, onApplyDesign }: AiSidebarProps) {
  const [prompt, setPrompt] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [chatError, setChatError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeRunId, setActiveRunId] = useState<string | undefined>()
  const [activeToken, setActiveToken] = useState<string | undefined>()
  const [feedStatus, setFeedStatus] = useState<AiStatusFeedMessage | null>(null)
  const appliedRef = useRef(false)
  const architectScrollRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const feedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Specs state ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("architect")
  const [specs, setSpecs] = useState<SpecMeta[]>([])
  const [specsLoading, setSpecsLoading] = useState(false)
  const [specsFetched, setSpecsFetched] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<SpecMeta | null>(null)
  const [specContent, setSpecContent] = useState<string | null>(null)
  const [specContentLoading, setSpecContentLoading] = useState(false)

  // ── Liveblocks ────────────────────────────────────────────────────────────
  const self = useSelf()
  const rawChatMessages = useStorage((root) => root.chatMessages)

  const chatMessages: ChatMessage[] = (rawChatMessages ?? [])
    .map((m) => chatMessageSchema.safeParse(m))
    .filter((r): r is { success: true; data: ChatMessage } => r.success)
    .map((r) => r.data)

  // Must be defined before useRealtimeRun so its closure is available in onComplete
  const addChatMessage = useMutation(({ storage }, message: ChatMessage) => {
    const list = storage.get("chatMessages")
    if (list) list.push(message)
  }, [])

  useEventListener(({ event }) => {
    const result = aiStatusFeedMessageSchema.safeParse(event)
    if (!result.success) return
    if (feedTimerRef.current) clearTimeout(feedTimerRef.current)
    setFeedStatus(result.data)
    if (result.data.status === "complete" || result.data.status === "error") {
      feedTimerRef.current = setTimeout(() => setFeedStatus(null), 3000)
    }
  })

  // ── Specs ─────────────────────────────────────────────────────────────────
  const fetchSpecs = useCallback(async () => {
    setSpecsLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`)
      if (!res.ok) return
      const data = (await res.json()) as { specs: SpecMeta[] }
      setSpecs(data.specs)
      setSpecsFetched(true)
    } finally {
      setSpecsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (activeTab === "specs" && !specsFetched) {
      void fetchSpecs()
    }
  }, [activeTab, specsFetched, fetchSpecs])

  const openSpecPreview = async (spec: SpecMeta) => {
    setSelectedSpec(spec)
    setSpecContent(null)
    setSpecContentLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/specs/${spec.id}/download`)
      if (!res.ok) throw new Error("Failed to load spec")
      setSpecContent(await res.text())
    } catch {
      setSpecContent(null)
    } finally {
      setSpecContentLoading(false)
    }
  }

  const closeSpecPreview = () => {
    setSelectedSpec(null)
    setSpecContent(null)
  }

  const downloadSpec = (specId: string) => {
    const a = document.createElement("a")
    a.href = `/api/projects/${projectId}/specs/${specId}/download`
    a.click()
  }

  // ── Run tracking ──────────────────────────────────────────────────────────
  const isRunActive = isSubmitting || !!activeRunId

  useRealtimeRun<typeof designAgentTask>(activeRunId, {
    enabled: !!activeRunId && !!activeToken,
    accessToken: activeToken ?? "",
    onComplete: (completedRun) => {
      if (completedRun.output && !appliedRef.current) {
        appliedRef.current = true
        onApplyDesign(
          completedRun.output.nodes as unknown as CanvasNode[],
          completedRun.output.edges as unknown as CanvasEdge[]
        )
        const count = completedRun.output.nodes.length
        addChatMessage({
          id: `${Date.now()}-ai-result`,
          sender: AI_SENDER,
          role: "ai",
          content: `Design applied — ${count} component${count !== 1 ? "s" : ""} added to canvas.`,
          timestamp: Date.now(),
        })
      } else if (!completedRun.output) {
        addChatMessage({
          id: `${Date.now()}-ai-err`,
          sender: AI_SENDER,
          role: "ai",
          content: "Design generation failed. Please try again.",
          timestamp: Date.now(),
        })
      }
      setActiveRunId(undefined)
      setActiveToken(undefined)
    },
  })

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    architectScrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const text = prompt.trim()
    if (!text || isRunActive || !self) return

    setPrompt("")
    setIsSubmitting(true)
    appliedRef.current = false

    addChatMessage({
      id: `${Date.now()}-user`,
      sender: { id: self.id, name: self.info.name },
      role: "user",
      content: text,
      timestamp: Date.now(),
    })

    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, roomId: projectId, projectId }),
      })
      if (!res.ok) throw new Error("Failed to start design agent")
      const { runId, publicToken } = (await res.json()) as { runId: string; publicToken: string }

      setActiveRunId(runId)
      setActiveToken(publicToken)
      setIsSubmitting(false)
    } catch {
      addChatMessage({
        id: `${Date.now()}-ai-err`,
        sender: AI_SENDER,
        role: "ai",
        content: "Something went wrong. Please try again.",
        timestamp: Date.now(),
      })
      setIsSubmitting(false)
    }
  }

  const handleArchitectKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  const handleChatSend = () => {
    const text = chatInput.trim()
    if (!text || !self) return
    setChatError(null)
    try {
      addChatMessage({
        id: `${Date.now()}-${Math.random()}`,
        sender: { id: self.id, name: self.info.name },
        role: "user",
        content: text,
        timestamp: Date.now(),
      })
      setChatInput("")
    } catch {
      setChatError("Failed to send. Please try again.")
    }
  }

  // All hooks are above — safe to early-return
  if (!isOpen) return null

  return (
    <aside
      className={cn(
        "fixed right-4 top-16 bottom-4 w-80 z-50 flex flex-col",
        "bg-[var(--bg-base)]/95 border border-[var(--border-default)] rounded-2xl shadow-2xl backdrop-blur-sm",
        "animate-in slide-in-from-right duration-300"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--accent-ai)]/20 p-1.5 rounded-lg">
            <Bot className="h-4 w-4 text-[var(--accent-ai-text)]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-copy-primary leading-tight">AI Workspace</h2>
            <p className="text-[11px] text-copy-muted leading-tight">Collaborate with Ghost AI</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onClose}
          className="text-copy-muted hover:text-copy-primary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2">
          <TabsList variant="line" className="w-full justify-start border-b border-[var(--border-default)] rounded-none h-9">
            <TabsTrigger value="architect" className="data-active:text-brand data-active:after:bg-brand text-xs">
              AI Architect
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-active:text-brand data-active:after:bg-brand text-xs">
              Chat
            </TabsTrigger>
            <TabsTrigger value="specs" className="data-active:text-brand data-active:after:bg-brand text-xs">
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── AI Architect Tab ── */}
        <TabsContent value="architect" className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto px-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                <div className="bg-subtle p-4 rounded-3xl">
                  <Bot className="h-8 w-8 text-copy-muted" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-copy-primary">Ghost AI Architect</p>
                  <p className="text-xs text-copy-muted max-w-[200px] mx-auto">
                    Describe a system and I&apos;ll design it on the canvas for everyone to see.
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-2 w-full max-w-[240px]">
                  {SUGGESTED_PROMPTS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setPrompt(chip)}
                      className="text-[11px] px-3 py-2 rounded-full bg-subtle text-[var(--accent-ai-text)] border border-[var(--border-subtle)] hover:bg-subtle/80 transition-colors text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4 flex flex-col gap-3">
                {chatMessages.map((msg) => (
                  <Bubble key={msg.id} message={msg} isOwn={msg.sender.id === self?.id} />
                ))}
                <div ref={architectScrollRef} />
              </div>
            )}
          </div>

          {/* Status strip — only when run is active */}
          {isRunActive && (
            <div className="px-4 py-2 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#62C073]/10 text-[#62C073]">
                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                <span className="truncate">{feedStatus?.message ?? "Processing your request..."}</span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-[var(--border-default)]">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleArchitectKeyDown}
                placeholder="Describe a system to design..."
                className="pr-12 min-h-[72px] max-h-[160px] bg-elevated/50 border-[var(--border-default)] focus-visible:ring-[#62C073]/30 resize-none text-copy-primary"
                disabled={isRunActive}
              />
              <Button
                size="icon-xs"
                onClick={() => void handleSubmit()}
                disabled={!prompt.trim() || isRunActive}
                className="absolute right-2 bottom-2 bg-[#62C073] text-[#0d1f0f] h-7 w-7 rounded-md hover:bg-[#52a861] shadow-lg disabled:opacity-40"
              >
                {isRunActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Chat Tab ── */}
        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto px-4">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                <div className="bg-subtle p-4 rounded-3xl">
                  <Hash className="h-8 w-8 text-copy-muted" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-copy-primary">Room Chat</p>
                  <p className="text-xs text-copy-muted max-w-50 mx-auto">
                    Send messages to everyone in this room.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 flex flex-col gap-3">
                {chatMessages.map((msg) => (
                  <Bubble key={msg.id} message={msg} isOwn={msg.sender.id === self?.id} />
                ))}
                <div ref={chatScrollRef} />
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[var(--border-default)]">
            {chatError && (
              <p className="text-[11px] text-error mb-2">{chatError}</p>
            )}
            <div className="relative">
              <Textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleChatSend()
                  }
                }}
                placeholder="Message room..."
                className="pr-12 min-h-[72px] max-h-[160px] bg-elevated/50 border-[var(--border-default)] focus-visible:ring-[#62C073]/30 resize-none text-copy-primary"
                disabled={!self}
              />
              <Button
                size="icon-xs"
                onClick={handleChatSend}
                disabled={!chatInput.trim() || !self}
                className="absolute right-2 bottom-2 bg-[#62C073] text-[#0d1f0f] h-7 w-7 rounded-md hover:bg-[#52a861] shadow-lg disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Specs Tab ── */}
        <TabsContent value="specs" className="flex-1 flex flex-col min-h-0">
          {specsLoading ? (
            <div className="flex items-center justify-center flex-1 py-12">
              <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
            </div>
          ) : specs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center flex-1 py-12 gap-4 px-4">
              <div className="bg-subtle p-4 rounded-3xl">
                <FileText className="h-8 w-8 text-copy-muted" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-copy-primary">No specs yet</p>
                <p className="text-xs text-copy-muted max-w-[200px] mx-auto">
                  Generate a spec from the AI Architect tab to see it here.
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 flex flex-col gap-2">
                {specs.map((spec) => (
                  <SpecItem
                    key={spec.id}
                    spec={spec}
                    onPreview={() => void openSpecPreview(spec)}
                    onDownload={() => downloadSpec(spec.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Spec Preview Modal ── */}
      <Dialog open={!!selectedSpec} onOpenChange={(open) => { if (!open) closeSpecPreview() }}>
        <DialogContent
          showCloseButton={false}
          className="bg-[var(--bg-elevated)] border-[var(--border-default)] rounded-3xl w-[min(680px,calc(100vw-2rem))] max-w-none p-0 gap-0 overflow-hidden"
        >
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-[var(--border-default)] flex-row items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-copy-muted shrink-0" />
              <DialogTitle className="text-sm font-medium text-copy-primary truncate">
                {selectedSpec?.filename}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => selectedSpec && downloadSpec(selectedSpec.id)}
                className="h-7 gap-1.5 px-2 text-xs text-copy-secondary hover:text-copy-primary"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={closeSpecPreview}
                className="text-copy-muted hover:text-copy-primary"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="px-5 py-4">
              {specContentLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
                </div>
              ) : specContent ? (
                <div className="prose-spec text-xs leading-relaxed text-copy-primary">
                  <ReactMarkdown>{specContent}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-copy-muted text-center py-16">Failed to load spec content.</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </aside>
  )
}

function SpecItem({
  spec,
  onPreview,
  onDownload,
}: {
  spec: SpecMeta
  onPreview: () => void
  onDownload: () => void
}) {
  const date = new Date(spec.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <button
      onClick={onPreview}
      className="w-full text-left rounded-xl bg-elevated border border-[var(--border-default)] px-3 py-2.5 hover:border-[var(--border-subtle)] transition-colors group"
    >
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 mt-0.5">
          <FileText className="h-4 w-4 text-copy-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-copy-primary truncate">{spec.filename}</p>
          <p className="text-[11px] text-copy-muted mt-0.5">{date}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDownload() }}
          className="shrink-0 p-1 rounded-lg text-copy-muted hover:text-copy-primary hover:bg-subtle transition-colors opacity-0 group-hover:opacity-100"
          title="Download"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </button>
  )
}

// Unified bubble component for both tabs
function Bubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const isAi = message.role === "ai"
  const time = new Date(message.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  if (isAi) {
    return (
      <div className="flex gap-2">
        <div className="shrink-0 h-6 w-6 rounded-full bg-elevated border border-[var(--border-subtle)] flex items-center justify-center mt-0.5">
          <Bot className="h-3 w-3 text-[var(--accent-ai-text)]" />
        </div>
        <div className="flex flex-col gap-0.5 max-w-[210px]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-copy-primary">{message.sender.name}</span>
            <span className="text-[9px] text-copy-muted">{time}</span>
          </div>
          <div className="rounded-xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed bg-elevated text-copy-primary">
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  const initials = message.sender.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
      <div className="shrink-0 h-6 w-6 rounded-full bg-elevated border border-[var(--border-subtle)] flex items-center justify-center mt-0.5">
        <span className="text-[9px] font-bold text-copy-muted">{initials}</span>
      </div>
      <div className={cn("flex flex-col gap-0.5 max-w-[210px]", isOwn && "items-end")}>
        <div className={cn("flex items-center gap-1.5", isOwn && "flex-row-reverse")}>
          <span className="text-[10px] font-medium text-copy-primary">{message.sender.name}</span>
          <span className="text-[9px] text-copy-muted">{time}</span>
        </div>
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-xs leading-relaxed",
            isOwn
              ? "bg-[#62C073] text-[#0d1f0f] font-medium rounded-tr-sm"
              : "bg-elevated text-copy-primary rounded-tl-sm"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
