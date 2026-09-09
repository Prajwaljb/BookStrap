import { Alert, Button } from '@mui/material'

type ErrorStateProps = {
  onRetry: () => void
  message?: string
  className?: string
}

export function ErrorState({ onRetry, message = 'Something went wrong while searching.', className = '' }: ErrorStateProps) {
  return <Alert className={className} severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>Try again</Button>}>{message}</Alert>
}
