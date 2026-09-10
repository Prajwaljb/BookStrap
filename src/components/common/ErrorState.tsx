type ErrorStateProps = {
  onRetry: () => void
  message?: string
  className?: string
}

export function ErrorState({ onRetry, message = 'Something went wrong while searching.', className = '' }: ErrorStateProps) {
  return <div className={`flex items-center justify-between gap-4 rounded-[12px] border border-black bg-white p-4 ${className}`} role="alert"><span>{message}</span><button type="button" className="shrink-0 rounded-[8px] border border-black px-3 py-2 text-sm font-bold hover:bg-black hover:text-white" onClick={onRetry}>Try again</button></div>
}
