import { MenuItem, TextField } from '@mui/material'
import type { SortOption } from '../../types/book'

export function SortControl({ value, onChange }: { value: SortOption; onChange: (value: SortOption) => void }) {
  return <TextField select size="small" label="Sort by" value={value} onChange={(event) => onChange(event.target.value as SortOption)} className="sort-control"><MenuItem value="relevance">Relevance</MenuItem><MenuItem value="title-asc">Title A → Z</MenuItem><MenuItem value="title-desc">Title Z → A</MenuItem></TextField>
}
