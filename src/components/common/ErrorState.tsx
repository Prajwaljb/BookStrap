import { Button } from './Button'
import { cn } from '../../utils/cn'

type ErrorStateProps = {
  onRetry: () => void
  message?: string
  className?: string
}

export function ErrorState({ onRetry, message = 'Something went wrong while searching.', className = '' }: ErrorStateProps) {
  return <div className={cn('flex items-center justify-between gap-4 rounded-xl border border-[var(--color-black)] bg-[var(--color-white)] p-4', className)} role="alert"><span>{message}</span><Button type="button" onClick={onRetry}>Try again</Button></div>
}
