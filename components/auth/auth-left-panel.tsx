import { Cpu, Network, FileText } from "lucide-react"

const features = [
  {
    Icon: Cpu,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    Icon: Network,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    Icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
]

export function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex w-1/2 flex-col bg-surface border-r border-border-default">
      <div className="flex items-center gap-2.5 px-12 pt-10">
        <div className="h-7 w-7 rounded-lg bg-brand flex-shrink-0" />
        <span className="font-semibold text-copy-primary text-[15px] tracking-tight">
          Ghost AI
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center px-12">
        <h1 className="text-4xl font-bold text-copy-primary leading-snug tracking-tight">
          Design systems at the speed of thought.
        </h1>
        <p className="mt-5 text-copy-secondary text-sm leading-relaxed max-w-sm">
          Describe your architecture in plain English. Ghost AI maps it to a
          shared canvas your whole team can refine in real time.
        </p>
        <div className="mt-10 space-y-6">
          {features.map(({ Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-elevated flex items-center justify-center">
                <Icon className="h-4 w-4 text-copy-secondary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-copy-primary text-sm font-medium">{title}</p>
                <p className="text-copy-muted text-sm mt-0.5 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-12 pb-10">
        <p className="text-copy-faint text-xs">
          © 2026 Ghost AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
