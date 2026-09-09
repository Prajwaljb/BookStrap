import { CircularProgress, Stack, Typography } from '@mui/material'

export function LoadingState() {
  return <Stack alignItems="center" justifyContent="center" spacing={1.5} className="state-panel"><CircularProgress size={24} aria-label="Loading" /><Typography>Loading…</Typography></Stack>
}
