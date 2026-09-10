import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
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
        <div className="flex overflow-hidden rounded-[8px] border border-black text-[11px]">
          {(['book', 'author'] as const).map((value) => <button key={value} type="button" className={`px-3 py-1 font-medium ${scope === value ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'}`} onClick={() => { if (scope !== value) onScopeChange(value) }} aria-label={`Search ${value === 'book' ? 'book titles' : 'authors'}`}>{value === 'book' ? 'Books' : 'Authors'}</button>)}
        </div>
      </div>
      <div className="relative">
        <div className="flex h-[60px] items-center gap-1 rounded-[15px] border border-black bg-white px-4 focus-within:border-2">
          <input className="min-w-0 flex-1 bg-transparent outline-none" value={query} onChange={(event) => onQueryChange(event.target.value)} onKeyDown={handleSuggestionKeyDown} placeholder={scope === 'author' ? 'Author name' : 'Book title'} aria-label={scope === 'author' ? 'Search by author' : 'Search by book title'} />
          {query && <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-black hover:text-white" aria-label="Clear search" onClick={onClear}><X size={17} /></button>}
          <button type="button" className="grid h-11 w-11 place-items-center rounded-[11px] bg-black text-white hover:bg-white hover:text-black hover:outline hover:outline-1 hover:outline-black" aria-label={scope === 'author' ? 'Search authors' : 'Search book titles'} onClick={onSearch}><Search size={20} /></button>
        </div>
        <SearchSuggestions suggestions={suggestions} loading={isSuggesting} scope={scope} activeIndex={activeSuggestionIndex} onActiveChange={setActiveSuggestionIndex} onSelect={(book) => { setActiveSuggestionIndex(-1); onSuggestionSelect(book) }} />
      </div>
    </div>
  )
}
