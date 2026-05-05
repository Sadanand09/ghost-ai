import Link from "next/link"
import { Lock } from "lucide-react"

export function AccessDenied() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-base">
      <Lock className="h-8 w-8 text-copy-muted" />
      <p className="text-sm text-copy-secondary">
        This project doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link href="/editor" className="text-sm text-brand hover:underline">
        Back to editor
      </Link>
    </div>
  )
}
