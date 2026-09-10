import { LoaderCircle } from 'lucide-react'

export function LoadingState() {
  return <div className="flex min-h-[220px] items-center justify-center gap-3" role="status"><LoaderCircle size={24} className="animate-spin" />Loading…</div>
}
