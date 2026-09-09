import { useEffect, useState } from 'react'
import { Button, Divider, FormHelperText, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { BookFilters } from '../../types/book'

type FilterPanelProps = {
  filters: BookFilters
  authors: string[]
  onApply: (filters: BookFilters) => void
  onClear: () => void
}

const YEAR_PATTERN = /^\d{4}$/

function isValidYear(value: string): boolean {
  return value === '' || YEAR_PATTERN.test(value)
}

export function FilterPanel({ filters, authors, onApply, onClear }: FilterPanelProps) {
  const [draftFilters, setDraftFilters] = useState(filters)
  const hasFilters = Boolean(draftFilters.author || draftFilters.minYear || draftFilters.maxYear)
  const hasInvalidYear = !isValidYear(draftFilters.minYear) || !isValidYear(draftFilters.maxYear)
  const hasInvalidRange = Boolean(draftFilters.minYear && draftFilters.maxYear)
    && !hasInvalidYear
    && Number(draftFilters.minYear) > Number(draftFilters.maxYear)
  const yearError = hasInvalidYear ? 'Use four-digit years.' : hasInvalidRange ? 'From must be before To.' : ''

  useEffect(() => setDraftFilters(filters), [filters])

  return (
    <aside className="filter-panel" aria-label="Filter books">
      <div className="filter-heading"><div className="filter-heading-icon"><SlidersHorizontal size={18} /></div><Typography variant="h2">Filter results</Typography></div>
      <Divider />
      <Stack spacing={2} sx={{ mt: 2.5 }}>
        <TextField
          select fullWidth size="small" label="Author" value={draftFilters.author}
          onChange={(event) => setDraftFilters({ ...draftFilters, author: event.target.value })}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value=""><em>All authors</em></MenuItem>
          {authors.map((author) => <MenuItem key={author} value={author}>{author}</MenuItem>)}
        </TextField>
        <div>
          <Typography variant="caption" color="text.secondary" className="field-label">Publication year</Typography>
          <div className="year-fields">
            <TextField size="small" type="text" placeholder="YYYY" value={draftFilters.minYear} error={Boolean(yearError)} onChange={(event) => setDraftFilters({ ...draftFilters, minYear: event.target.value.replace(/\D/g, '').slice(0, 4) })} inputProps={{ inputMode: 'numeric', maxLength: 4, 'aria-label': 'Minimum publication year' }} />
            <Typography color="text.secondary">—</Typography>
            <TextField size="small" type="text" placeholder="YYYY" value={draftFilters.maxYear} error={Boolean(yearError)} onChange={(event) => setDraftFilters({ ...draftFilters, maxYear: event.target.value.replace(/\D/g, '').slice(0, 4) })} inputProps={{ inputMode: 'numeric', maxLength: 4, 'aria-label': 'Maximum publication year' }} />
          </div>
          {yearError && <FormHelperText error>{yearError}</FormHelperText>}
          <Typography variant="caption" className="filter-note">Missing years are excluded.</Typography>
        </div>
        <Button variant="contained" disabled={Boolean(yearError)} onClick={() => onApply(draftFilters)} className="apply-button">Apply filters</Button>
        {hasFilters && <Button variant="text" startIcon={<RotateCcw size={16} />} onClick={() => { setDraftFilters({ author: '', minYear: '', maxYear: '' }); onClear() }} className="reset-button">Reset filters</Button>}
      </Stack>
    </aside>
  )
}
