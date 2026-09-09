import { Alert, Button } from '@mui/material'

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetry}>Try again</Button>}>Something went wrong while searching. Please try again.</Alert>
}
