import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { BookFilters } from '../../types/book'
import styles from './FilterPanel.module.css'

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
  const [authorOpen, setAuthorOpen] = useState(false)
  const authorRef = useRef<HTMLDivElement>(null)
  const hasFilters = Boolean((showAuthorFilter && draftFilters.author) || draftFilters.minYear || draftFilters.maxYear)
  const hasInvalidYear = !isValidYear(draftFilters.minYear) || !isValidYear(draftFilters.maxYear)
  const hasInvalidRange = Boolean(draftFilters.minYear && draftFilters.maxYear) && !hasInvalidYear && Number(draftFilters.minYear) > Number(draftFilters.maxYear)
  const yearError = hasInvalidYear ? 'Use four-digit years.' : hasInvalidRange ? 'From must be before To.' : ''

  useEffect(() => setDraftFilters(filters), [filters])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (authorRef.current && !authorRef.current.contains(event.target as Node)) setAuthorOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const updateYear = (key: 'minYear' | 'maxYear', value: string) => {
    setDraftFilters((current) => ({ ...current, [key]: value.replace(/\D/g, '').slice(0, 4) }))
  }

  return (
    <aside className={styles.panel} aria-label="Filter books">
      <div className={styles.heading}><SlidersHorizontal size={18} aria-hidden="true" /><h2 className={styles.headingText}>Filter results</h2></div>
      <div className={styles.fields}>
        {showAuthorFilter && <div className={styles.fieldLabel} ref={authorRef}>
          <span className={styles.labelText}>Author</span>
          <button type="button" className={styles.selectTrigger} aria-haspopup="listbox" aria-expanded={authorOpen} aria-label="Author" onClick={() => setAuthorOpen((open) => !open)} onKeyDown={(event) => { if (event.key === 'Escape') setAuthorOpen(false) }}>
            <span>{draftFilters.author || 'All authors'}</span><ChevronDown size={17} className={authorOpen ? styles.chevronOpen : ''} />
          </button>
          {authorOpen && <div className={styles.authorMenu} role="listbox" aria-label="Filter by author">
            <button type="button" role="option" aria-selected={!draftFilters.author} className={`${styles.authorOption} ${!draftFilters.author ? styles.authorOptionActive : ''}`} onClick={() => { setDraftFilters({ ...draftFilters, author: '' }); setAuthorOpen(false) }}>All authors{!draftFilters.author && <Check size={15} />}</button>
            {authors.map((author) => <button key={author} type="button" role="option" aria-selected={author === draftFilters.author} className={`${styles.authorOption} ${author === draftFilters.author ? styles.authorOptionActive : ''}`} onClick={() => { setDraftFilters({ ...draftFilters, author }); setAuthorOpen(false) }}>{author}{author === draftFilters.author && <Check size={15} />}</button>)}
          </div>}
        </div>}
        <div>
          <span className={styles.labelText}>Publication year</span>
          <div className={styles.yearRow}>
            <input className={styles.field} type="text" placeholder="YYYY" value={draftFilters.minYear} aria-label="Minimum publication year" inputMode="numeric" maxLength={4} onChange={(event) => updateYear('minYear', event.target.value)} />
            <span aria-hidden="true">—</span>
            <input className={styles.field} type="text" placeholder="YYYY" value={draftFilters.maxYear} aria-label="Maximum publication year" inputMode="numeric" maxLength={4} onChange={(event) => updateYear('maxYear', event.target.value)} />
          </div>
          {yearError && <p className={styles.error} role="alert">{yearError}</p>}
          <p className={styles.hint}>Missing years are excluded.</p>
        </div>
        <button type="button" className={styles.apply} disabled={Boolean(yearError)} onClick={() => onApply(showAuthorFilter ? draftFilters : { ...draftFilters, author: '' })}>Apply filters</button>
        {hasFilters && <button type="button" className={styles.reset} onClick={() => { setDraftFilters({ author: '', minYear: '', maxYear: '' }); onClear() }}><RotateCcw size={15} /> Reset filters</button>}
      </div>
    </aside>
  )
}
