import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import type { SortOption } from '../../types/book'

export function SortControl({ value, onChange }: { value: SortOption; onChange: (value: SortOption) => void }) {
  return (
    <TextField select size="small" label="Sort by" value={value} onChange={(event) => onChange(event.target.value as SortOption)} sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: '11px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000' }, '& .MuiSelect-select': { paddingTop: '9px', paddingBottom: '9px', fontFamily: 'DM Mono, monospace', fontSize: 10 } }}>
      <MenuItem value="relevance">Relevance</MenuItem>
      <MenuItem value="title-asc">Title A → Z</MenuItem>
      <MenuItem value="title-desc">Title Z → A</MenuItem>
    </TextField>
  )
}
