import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { Book, SearchScope } from '../../types/book'
import { cn } from '../../utils/cn'
import { SearchSuggestions } from './SearchSuggestions'

type SearchBarProps = {
  query: string
  scope: SearchScope
  hasFullText: boolean
  suggestions: Book[]
  isSuggesting: boolean
  onQueryChange: (value: string) => void
  onScopeChange: (scope: SearchScope) => void
  onFullTextChange: (value: boolean) => void
  onSearch: () => void
  onSuggestionSelect: (book: Book) => void
  onClear: () => void
  onDismissSuggestions: () => void
}

export function SearchBar({ query, scope, hasFullText, suggestions, isSuggesting, onQueryChange, onScopeChange, onFullTextChange, onSearch, onSuggestionSelect, onClear, onDismissSuggestions }: SearchBarProps) {
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
      <div className="mb-3 flex flex-wrap items-start gap-3 min-[521px]:items-center">
        <span className="font-mono text-[10px] tracking-[0.08em]">SEARCH IN</span>
        <div className="flex overflow-hidden rounded-[8px] border border-[var(--color-black)] text-[11px]">
          {(['book', 'author'] as const).map((value) => <button key={value} type="button" className={cn('cursor-pointer border-0 px-3 py-1', scope === value ? 'bg-[var(--color-black)] text-[var(--color-white)]' : 'bg-[var(--color-white)] text-[var(--color-black)] hover:bg-[var(--color-black)] hover:text-[var(--color-white)]')} onClick={() => { if (scope !== value) onScopeChange(value) }} aria-label={`Search ${value === 'book' ? 'book titles' : 'authors'}`}>{value === 'book' ? 'Books' : 'Authors'}</button>)}
        </div>
        <label className="ml-0 inline-flex cursor-pointer items-center gap-1.5 text-[11px] min-[521px]:ml-auto">
          <input className="h-3.5 w-3.5 cursor-pointer accent-[var(--color-black)]" type="checkbox" checked={hasFullText} onChange={(event) => onFullTextChange(event.target.checked)} />
          <span>Only books with full text</span>
        </label>
      </div>
      <div className="relative">
        <div className="flex h-[60px] items-center gap-1 rounded-[15px] border border-[var(--color-black)] bg-[var(--color-white)] px-4 focus-within:border-2">
          <input className="min-w-0 flex-1 border-0 bg-transparent outline-0" value={query} onChange={(event) => onQueryChange(event.target.value)} onKeyDown={handleSuggestionKeyDown} placeholder={scope === 'author' ? 'Author name' : 'Book title'} aria-label={scope === 'author' ? 'Search by author' : 'Search by book title'} />
          {query && <button type="button" className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent hover:bg-[var(--color-black)] hover:text-[var(--color-white)]" aria-label="Clear search" onClick={onClear}><X size={17} /></button>}
          <button type="button" className="grid h-11 w-11 cursor-pointer place-items-center rounded-[11px] border-0 bg-[var(--color-black)] text-[var(--color-white)] hover:bg-[var(--color-white)] hover:text-[var(--color-black)] hover:outline hover:outline-1 hover:outline-[var(--color-black)]" aria-label={scope === 'author' ? 'Search authors' : 'Search book titles'} onClick={onSearch}><Search size={20} /></button>
        </div>
        <SearchSuggestions suggestions={suggestions} loading={isSuggesting} scope={scope} activeIndex={activeSuggestionIndex} onActiveChange={setActiveSuggestionIndex} onSelect={(book) => { setActiveSuggestionIndex(-1); onSuggestionSelect(book) }} />
      </div>
    </div>
  )
}
