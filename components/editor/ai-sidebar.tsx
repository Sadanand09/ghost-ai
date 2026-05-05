"use client"

import { Bot, Send, X, FileText, Sparkles, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  if (!isOpen) return null

  return (
    <aside className={cn(
      "fixed right-4 top-16 bottom-4 w-80 z-50 flex flex-col",
      "bg-base/95 border border-surface-border rounded-2xl shadow-2xl backdrop-blur-sm",
      "animate-in slide-in-from-right duration-300"
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="bg-accent-ai/20 p-1.5 rounded-lg">
            <Bot className="h-4 w-4 text-accent-ai-text" />
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

      <Tabs defaultValue="architect" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2">
          <TabsList variant="line" className="w-full justify-start border-b border-surface-border rounded-none h-9">
            <TabsTrigger 
              value="architect" 
              className="data-active:text-brand data-active:after:bg-brand text-xs"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger 
              value="specs" 
              className="data-active:text-brand data-active:after:bg-brand text-xs"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="architect" className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 px-4">
             {/* Empty State */}
             <div className="flex flex-col items-center justify-center text-center py-12 gap-4">
                <div className="bg-subtle p-4 rounded-3xl">
                   <Bot className="h-8 w-8 text-copy-muted" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-copy-primary">Ghost AI Architect</p>
                  <p className="text-xs text-copy-muted max-w-[200px] mx-auto">
                    Ask me to design a system, explain a component, or generate a spec.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 mt-2 w-full max-w-[240px]">
                   {[
                     "Design an e-commerce backend",
                     "Create a chat app architecture",
                     "Build a CI/CD pipeline"
                   ].map(chip => (
                     <button 
                       key={chip}
                       className="text-[11px] px-3 py-2 rounded-full bg-subtle text-accent-ai-text border border-border-subtle hover:bg-subtle/80 transition-colors text-left"
                     >
                       {chip}
                     </button>
                   ))}
                </div>
             </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-surface-border">
            <div className="relative group">
              <Textarea 
                placeholder="Message Ghost AI..."
                className="pr-12 min-h-[72px] max-h-[160px] bg-elevated/50 border-surface-border focus-visible:ring-brand/30 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    // Submit logic would go here
                  }
                }}
              />
              <Button 
                size="icon-xs" 
                className="absolute right-2 bottom-2 bg-brand text-base h-7 w-7 rounded-md hover:bg-brand/90 shadow-lg"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="flex-1 flex flex-col min-h-0 p-4 gap-4">
          <Button className="w-full bg-brand text-base hover:bg-brand/90 gap-2 h-9 shadow-lg">
            <Sparkles className="h-4 w-4" />
            Generate Spec
          </Button>

          <Card className="bg-elevated border-surface-border shadow-sm">
            <CardContent className="p-3 flex items-start gap-3">
              <div className="bg-subtle p-2 rounded-lg shrink-0">
                <FileText className="h-4 w-4 text-copy-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-copy-primary truncate">System Architecture Spec</p>
                <p className="text-xs text-copy-muted mt-0.5 line-clamp-2 leading-relaxed">
                  Comprehensive specification for the current system design, including data models and API endpoints.
                </p>
                <Button variant="ghost" size="xs" disabled className="mt-2.5 h-7 text-xs gap-1.5 px-2">
                   <Download className="h-3.5 w-3.5" />
                   Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </aside>
  )
}

