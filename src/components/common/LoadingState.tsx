import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

export function LoadingState() {
  return <div className="flex min-h-[220px] items-center justify-center gap-3" role="status"><CircularProgress size={24} color="inherit" /><Typography>Loading…</Typography></div>
}
