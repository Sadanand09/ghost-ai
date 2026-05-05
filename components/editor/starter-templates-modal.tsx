"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates"
import { CanvasShapeFrame } from "./canvas-shape"

interface StarterTemplatesModalProps {
  open: boolean
  onClose: () => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({ open, onClose, onImport }: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col bg-surface border-border-default p-0 overflow-hidden">
        <div className="p-8 border-b border-border-default bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <DialogHeader>
            <DialogTitle className="text-copy-primary text-3xl font-bold">Starter Templates</DialogTitle>
            <DialogDescription className="text-copy-muted text-lg mt-1">
              Choose a professional architecture pattern to jumpstart your design.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <ScrollArea className="flex-1 p-8">
          <div className="flex flex-wrap justify-center gap-8 pb-8">
            {CANVAS_TEMPLATES.map((template) => (
              <Card 
                key={template.id} 
                className="flex flex-col w-[340px] overflow-hidden bg-surface-elevated border-border-default hover:border-border-strong transition-all hover:shadow-xl hover:-translate-y-1 group"
              >
                <div className="h-48 bg-base p-6 flex items-center justify-center overflow-hidden border-b border-border-default group-hover:bg-base/80 transition-colors">
                  <TemplatePreview template={template} />
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="font-bold text-xl text-copy-primary group-hover:text-brand transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-copy-muted line-clamp-3 leading-relaxed flex-1">
                    {template.description}
                  </p>
                  <Button 
                    className="mt-4 w-full font-bold shadow-md h-11" 
                    variant="secondary"
                    onClick={() => {
                      onImport(template)
                      onClose()
                    }}
                  >
                    Use this template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const { nodes, edges } = template
  
  if (nodes.length === 0) return null

  // Calculate bounds
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  nodes.forEach((node) => {
    const { x, y } = node.position
    const width = node.width ?? 200
    const height = node.height ?? 100
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + width)
    maxY = Math.max(maxY, y + height)
  })

  const padding = 40
  const contentWidth = maxX - minX + padding * 2
  const contentHeight = maxY - minY + padding * 2
  
  // The preview container is fixed size in the card
  const viewportWidth = 280
  const viewportHeight = 160
  
  const scaleX = viewportWidth / contentWidth
  const scaleY = viewportHeight / contentHeight
  const scale = Math.min(scaleX, scaleY, 0.7) // Cap scale at 0.7 for better fit

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  return (
    <div 
      className="relative pointer-events-none select-none"
      style={{ 
        width: viewportWidth, 
        height: viewportHeight,
      }}
    >
      <div 
        style={{ 
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${scale}) translate(${-centerX}px, ${-centerY}px)`,
        }}
      >
        {/* Draw Edges */}
        <svg className="absolute inset-0 overflow-visible" style={{ width: 0, height: 0 }}>
          {edges.map((edge) => {
            const source = nodes.find((n) => n.id === edge.source)
            const target = nodes.find((n) => n.id === edge.target)
            if (!source || !target) return null

            const x1 = source.position.x + (source.width ?? 200) / 2
            const y1 = source.position.y + (source.height ?? 100) / 2
            const x2 = target.position.x + (target.width ?? 200) / 2
            const y2 = target.position.y + (target.height ?? 100) / 2

            return (
              <line
                key={edge.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--copy-faint)"
                strokeWidth={2 / scale}
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        {/* Draw Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.position.x,
              top: node.position.y,
              width: node.width,
              height: node.height,
            }}
          >
            <CanvasShapeFrame
              shape={node.data.shape}
              color={node.data.color}
              width={node.width ?? 0}
              height={node.height ?? 0}
              className="border-none shadow-none"
              contentClassName="text-[12px] p-2 leading-tight font-medium"
            >
              <span className="truncate max-w-[120px]">{node.data.label}</span>
            </CanvasShapeFrame>
          </div>
        ))}
      </div>
    </div>
  )
}
