import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { BookFilters } from '../../types/book'

type FilterPanelProps = {
  filters: BookFilters
  authors: string[]
  showAuthorFilter: boolean
  onApply: (filters: BookFilters) => void
  onClear: () => void
}

const YEAR_PATTERN = /^\d{4}$/

function isValidYear(value: string): boolean {
  return value === '' || YEAR_PATTERN.test(value)
}

export function FilterPanel({ filters, authors, showAuthorFilter, onApply, onClear }: FilterPanelProps) {
  const [draftFilters, setDraftFilters] = useState(filters)
  const hasFilters = Boolean((showAuthorFilter && draftFilters.author) || draftFilters.minYear || draftFilters.maxYear)
  const hasInvalidYear = !isValidYear(draftFilters.minYear) || !isValidYear(draftFilters.maxYear)
  const hasInvalidRange = Boolean(draftFilters.minYear && draftFilters.maxYear) && !hasInvalidYear && Number(draftFilters.minYear) > Number(draftFilters.maxYear)
  const yearError = hasInvalidYear ? 'Use four-digit years.' : hasInvalidRange ? 'From must be before To.' : ''

  useEffect(() => setDraftFilters(filters), [filters])

  const updateYear = (key: 'minYear' | 'maxYear', value: string) => {
    setDraftFilters((current) => ({ ...current, [key]: value.replace(/\D/g, '').slice(0, 4) }))
  }

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000' }, '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' }, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000' } }

  return (
    <aside className="rounded-[14px] border border-black bg-white p-4" aria-label="Filter books">
      <div className="mb-4 flex items-center gap-2 border-b border-black pb-4"><SlidersHorizontal size={18} aria-hidden="true" /><Typography component="h2" className="font-mono text-[11px] font-medium uppercase tracking-[.04em]">Filter results</Typography></div>
      <Stack spacing={2}>
        {showAuthorFilter && <TextField select fullWidth size="small" label="Author" value={draftFilters.author} onChange={(event) => setDraftFilters({ ...draftFilters, author: event.target.value })} slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }} sx={fieldSx}>
          <MenuItem value=""><em>All authors</em></MenuItem>
          {authors.map((author) => <MenuItem key={author} value={author}>{author}</MenuItem>)}
        </TextField>}
        <div>
          <Typography component="span" className="mb-1.5 block font-mono text-[10px] tracking-[.04em]">Publication year</Typography>
          <div className="flex items-center gap-1.5">
            <TextField size="small" type="text" placeholder="YYYY" value={draftFilters.minYear} error={Boolean(yearError)} onChange={(event) => updateYear('minYear', event.target.value)} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4, 'aria-label': 'Minimum publication year' } }} sx={{ ...fieldSx, width: '100%' }} />
            <Typography component="span">—</Typography>
            <TextField size="small" type="text" placeholder="YYYY" value={draftFilters.maxYear} error={Boolean(yearError)} onChange={(event) => updateYear('maxYear', event.target.value)} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4, 'aria-label': 'Maximum publication year' } }} sx={{ ...fieldSx, width: '100%' }} />
          </div>
          {yearError && <FormHelperText error>{yearError}</FormHelperText>}
          <Typography component="p" className="mt-2 font-mono text-[9px]">Missing years are excluded.</Typography>
        </div>
        <Button variant="contained" disabled={Boolean(yearError)} onClick={() => onApply(showAuthorFilter ? draftFilters : { ...draftFilters, author: '' })} sx={{ minHeight: 38, color: '#fff', backgroundColor: '#000', borderRadius: '10px', '&:hover': { color: '#000', backgroundColor: '#fff', outline: '1px solid #000' } }}>Apply filters</Button>
        {hasFilters && <Button variant="text" startIcon={<RotateCcw size={15} />} onClick={() => { setDraftFilters({ author: '', minYear: '', maxYear: '' }); onClear() }} sx={{ justifyContent: 'flex-start', padding: '2px 0', color: '#000', fontFamily: 'DM Mono, monospace', fontSize: 10 }}>Reset filters</Button>}
      </Stack>
    </aside>
  )
}
