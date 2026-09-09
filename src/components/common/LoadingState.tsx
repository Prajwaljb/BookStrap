import { CircularProgress, Typography } from '@mui/material'

export function LoadingState() {
  return <div className="flex min-h-[220px] items-center justify-center gap-3" role="status"><CircularProgress size={24} color="inherit" /><Typography>Loading…</Typography></div>
}
