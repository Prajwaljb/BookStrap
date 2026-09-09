import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { IconButton, InputAdornment, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Search, X } from 'lucide-react'
import type { Book, SearchScope } from '../../types/book'
import { SearchSuggestions } from './SearchSuggestions'

type SearchBarProps = {
  query: string
  scope: SearchScope
  suggestions: Book[]
  isSuggesting: boolean
  onQueryChange: (value: string) => void
  onScopeChange: (scope: SearchScope) => void
  onSearch: () => void
  onSuggestionSelect: (book: Book) => void
  onClear: () => void
  onDismissSuggestions: () => void
}

export function SearchBar({ query, scope, suggestions, isSuggesting, onQueryChange, onScopeChange, onSearch, onSuggestionSelect, onClear, onDismissSuggestions }: SearchBarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)

  useEffect(() => setActiveSuggestionIndex(-1), [suggestions, scope])

  const handleSuggestionKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && suggestions.length > 0) {
      event.preventDefault()
      setActiveSuggestionIndex((current) => (current + 1) % suggestions.length)
      return
    }
    if (event.key === 'ArrowUp' && suggestions.length > 0) {
      event.preventDefault()
      setActiveSuggestionIndex((current) => current <= 0 ? suggestions.length - 1 : current - 1)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setActiveSuggestionIndex(-1)
      onDismissSuggestions()
      return
    }
    if (event.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        event.preventDefault()
        onSuggestionSelect(suggestions[activeSuggestionIndex])
        setActiveSuggestionIndex(-1)
      } else {
        onSearch()
      }
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) onDismissSuggestions()
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [onDismissSuggestions])

  return (
    <div ref={wrapperRef} className="relative mt-[18px] max-w-[680px]">
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[.08em]">SEARCH IN</span>
        <ToggleButtonGroup
          value={scope}
          exclusive
          size="small"
          onChange={(_, nextScope: SearchScope | null) => { if (nextScope) onScopeChange(nextScope) }}
          aria-label="Search in"
          sx={{
            '& .MuiToggleButton-root': { color: '#000', borderColor: '#000', px: 1.25, py: 0.45, fontSize: 11, lineHeight: 1.2, textTransform: 'none', borderRadius: '8px !important' },
            '& .MuiToggleButton-root.Mui-selected': { color: '#fff', backgroundColor: '#000' },
            '& .MuiToggleButton-root.Mui-selected:hover': { color: '#fff', backgroundColor: '#000' },
          }}
        >
          <ToggleButton value="book" aria-label="Search book titles">Books</ToggleButton>
          <ToggleButton value="author" aria-label="Search authors">Authors</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className="relative">
        <TextField
          fullWidth
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleSuggestionKeyDown}
          placeholder={scope === 'author' ? 'Author name' : 'Book title'}
          aria-label={scope === 'author' ? 'Search by author' : 'Search by book title'}
          sx={{
            '& .MuiOutlinedInput-root': { height: 60, padding: '6px 10px 6px 16px', borderRadius: '15px' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000', borderWidth: 2 },
          }}
          slotProps={{
            input: {
              endAdornment: (
              <InputAdornment position="end">
                {query && <IconButton aria-label="Clear search" onClick={onClear} size="small"><X size={17} /></IconButton>}
                <IconButton aria-label={scope === 'author' ? 'Search authors' : 'Search book titles'} onClick={onSearch} sx={{ width: 44, height: 44, color: '#fff', backgroundColor: '#000', borderRadius: '11px', '&:hover': { color: '#000', backgroundColor: '#fff', outline: '1px solid #000' } }}><Search size={20} /></IconButton>
              </InputAdornment>
              ),
            },
          }}
        />
        <SearchSuggestions suggestions={suggestions} loading={isSuggesting} scope={scope} activeIndex={activeSuggestionIndex} onActiveChange={setActiveSuggestionIndex} onSelect={(book) => { setActiveSuggestionIndex(-1); onSuggestionSelect(book) }} />
      </div>
    </div>
  )
}
