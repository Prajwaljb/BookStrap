import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { Book, SearchScope } from '../../types/book'
import { SearchSuggestions } from './SearchSuggestions'
import styles from './SearchBar.module.css'

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
    <div ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.scopeRow}>
        <span className={styles.scopeLabel}>SEARCH IN</span>
        <div className={styles.scopeToggle}>
          {(['book', 'author'] as const).map((value) => <button key={value} type="button" className={`${styles.scopeButton} ${scope === value ? styles.scopeButtonActive : ''}`} onClick={() => { if (scope !== value) onScopeChange(value) }} aria-label={`Search ${value === 'book' ? 'book titles' : 'authors'}`}>{value === 'book' ? 'Books' : 'Authors'}</button>)}
        </div>
      </div>
      <div className={styles.inputRegion}>
        <div className={styles.inputShell}>
          <input className={styles.input} value={query} onChange={(event) => onQueryChange(event.target.value)} onKeyDown={handleSuggestionKeyDown} placeholder={scope === 'author' ? 'Author name' : 'Book title'} aria-label={scope === 'author' ? 'Search by author' : 'Search by book title'} />
          {query && <button type="button" className={styles.clearButton} aria-label="Clear search" onClick={onClear}><X size={17} /></button>}
          <button type="button" className={styles.searchButton} aria-label={scope === 'author' ? 'Search authors' : 'Search book titles'} onClick={onSearch}><Search size={20} /></button>
        </div>
        <SearchSuggestions suggestions={suggestions} loading={isSuggesting} scope={scope} activeIndex={activeSuggestionIndex} onActiveChange={setActiveSuggestionIndex} onSelect={(book) => { setActiveSuggestionIndex(-1); onSuggestionSelect(book) }} />
      </div>
    </div>
  )
}
