import { Button, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { BookFilters } from '../../types/book'

type FilterPanelProps = {
  filters: BookFilters
  authors: string[]
  onChange: (filters: BookFilters) => void
  onClear: () => void
}

export function FilterPanel({ filters, authors, onChange, onClear }: FilterPanelProps) {
  const hasFilters = Boolean(filters.author || filters.minYear || filters.maxYear)

  return (
    <aside className="filter-panel" aria-label="Filter books">
      <div className="filter-heading"><div className="filter-heading-icon"><SlidersHorizontal size={18} /></div><Typography variant="h2">Filter results</Typography></div>
      <Divider />
      <Stack spacing={2} sx={{ mt: 2.5 }}>
        <TextField
          select fullWidth size="small" label="Author" value={filters.author}
          onChange={(event) => onChange({ ...filters, author: event.target.value })}
          InputLabelProps={{ shrink: true }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value=""><em>All authors</em></MenuItem>
          {authors.map((author) => <MenuItem key={author} value={author}>{author}</MenuItem>)}
        </TextField>
        <div>
          <Typography variant="caption" color="text.secondary" className="field-label">Publication year</Typography>
          <div className="year-fields">
            <TextField size="small" type="number" placeholder="From" value={filters.minYear} onChange={(event) => onChange({ ...filters, minYear: event.target.value })} inputProps={{ min: 0, 'aria-label': 'Minimum publication year' }} />
            <Typography color="text.secondary">—</Typography>
            <TextField size="small" type="number" placeholder="To" value={filters.maxYear} onChange={(event) => onChange({ ...filters, maxYear: event.target.value })} inputProps={{ min: 0, 'aria-label': 'Maximum publication year' }} />
          </div>
        </div>
        {hasFilters && <Button variant="text" startIcon={<RotateCcw size={16} />} onClick={onClear} className="reset-button">Reset filters</Button>}
      </Stack>
    </aside>
  )
}
