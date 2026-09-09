import { useEffect, useRef } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Search, X } from 'lucide-react'
import type { Book } from '../../types/book'
import { SearchSuggestions } from './SearchSuggestions'

type SearchBarProps = {
  query: string
  suggestions: Book[]
  isSuggesting: boolean
  onQueryChange: (value: string) => void
  onSearch: () => void
  onSuggestionSelect: (book: Book) => void
  onClear: () => void
  onDismissSuggestions: () => void
}

export function SearchBar({ query, suggestions, isSuggesting, onQueryChange, onSearch, onSuggestionSelect, onClear, onDismissSuggestions }: SearchBarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) onDismissSuggestions()
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [onDismissSuggestions])

  return (
    <div ref={wrapperRef} className="search-bar-wrapper">
      <TextField
        fullWidth
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') onSearch() }}
        placeholder="Title or author"
        aria-label="Search by book title or author"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {query && <IconButton aria-label="Clear search" onClick={onClear} size="small"><X size={18} /></IconButton>}
              <IconButton aria-label="Search books" onClick={onSearch} className="search-submit" edge="end"><Search size={20} /></IconButton>
            </InputAdornment>
          ),
        }}
      />
      <SearchSuggestions suggestions={suggestions} loading={isSuggesting} onSelect={onSuggestionSelect} />
    </div>
  )
}
