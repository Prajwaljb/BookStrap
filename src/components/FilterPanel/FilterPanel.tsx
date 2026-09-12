import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { BookFilters } from '../../types/book'
import { Button } from '../common/Button'
import { cn } from '../../utils/cn'

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
    <aside className="rounded-[14px] border border-[var(--color-black)] bg-[var(--color-white)] p-4" aria-label="Filter books">
      <div className="mb-4 flex items-center gap-2 border-b border-[var(--color-black)] pb-4"><SlidersHorizontal size={18} aria-hidden="true" /><h2 className="font-mono text-[11px] uppercase tracking-[0.04em]">Filter results</h2></div>
      <div className="flex flex-col gap-4">
        {showAuthorFilter && <div className="relative block text-sm" ref={authorRef}>
          <span className="mb-1.5 block font-mono text-[10px] tracking-[0.04em]">Author</span>
          <button type="button" className="flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-[var(--color-black)] bg-[var(--color-white)] px-3 py-2 text-left focus:outline-2 focus:outline-[var(--color-black)] focus:outline-offset-1" aria-haspopup="listbox" aria-expanded={authorOpen} aria-label="Author" onClick={() => setAuthorOpen((open) => !open)} onKeyDown={(event) => { if (event.key === 'Escape') setAuthorOpen(false) }}>
            <span>{draftFilters.author || 'All authors'}</span><ChevronDown size={17} className={authorOpen ? 'rotate-180' : ''} />
          </button>
          {authorOpen && <div className="absolute left-0 right-0 z-20 mt-1 max-h-[280px] overflow-y-auto rounded-[10px] border border-[var(--color-black)] bg-[var(--color-white)] p-1 shadow-[3px_3px_0_var(--color-black)]" role="listbox" aria-label="Filter by author">
            <button type="button" role="option" aria-selected={!draftFilters.author} className={cn('flex w-full cursor-pointer items-center justify-between rounded-[7px] border-0 px-2 py-2 text-left', !draftFilters.author ? 'bg-[var(--color-black)] text-[var(--color-white)]' : 'bg-[var(--color-white)] hover:bg-[var(--color-black)] hover:text-[var(--color-white)]')} onClick={() => { setDraftFilters({ ...draftFilters, author: '' }); setAuthorOpen(false) }}>All authors{!draftFilters.author && <Check size={15} />}</button>
            {authors.map((author) => <button key={author} type="button" role="option" aria-selected={author === draftFilters.author} className={cn('flex w-full cursor-pointer items-center justify-between rounded-[7px] border-0 px-2 py-2 text-left', author === draftFilters.author ? 'bg-[var(--color-black)] text-[var(--color-white)]' : 'bg-[var(--color-white)] hover:bg-[var(--color-black)] hover:text-[var(--color-white)]')} onClick={() => { setDraftFilters({ ...draftFilters, author }); setAuthorOpen(false) }}>{author}{author === draftFilters.author && <Check size={15} />}</button>)}
          </div>}
        </div>}
        <div>
          <span className="mb-1.5 block font-mono text-[10px] tracking-[0.04em]">Publication year</span>
          <div className="flex items-center gap-1.5">
            <input className="min-w-0 w-full rounded-[10px] border border-[var(--color-black)] bg-[var(--color-white)] px-3 py-2 outline-0 focus:shadow-[0_0_0_2px_var(--color-black)]" type="text" placeholder="YYYY" value={draftFilters.minYear} aria-label="Minimum publication year" inputMode="numeric" maxLength={4} onChange={(event) => updateYear('minYear', event.target.value)} />
            <span aria-hidden="true">—</span>
            <input className="min-w-0 w-full rounded-[10px] border border-[var(--color-black)] bg-[var(--color-white)] px-3 py-2 outline-0 focus:shadow-[0_0_0_2px_var(--color-black)]" type="text" placeholder="YYYY" value={draftFilters.maxYear} aria-label="Maximum publication year" inputMode="numeric" maxLength={4} onChange={(event) => updateYear('maxYear', event.target.value)} />
          </div>
          {yearError && <p className="mt-1 text-xs text-red-700" role="alert">{yearError}</p>}
          <p className="mt-2 font-mono text-[9px]">Missing years are excluded.</p>
        </div>
        <Button type="button" variant="primary" className="min-h-[38px] w-full rounded-[10px]" disabled={Boolean(yearError)} onClick={() => onApply(showAuthorFilter ? draftFilters : { ...draftFilters, author: '' })}>Apply filters</Button>
        {hasFilters && <Button type="button" variant="ghost" className="inline-flex items-center gap-1" onClick={() => { setDraftFilters({ author: '', minYear: '', maxYear: '' }); onClear() }}><RotateCcw size={15} /> Reset filters</Button>}
      </div>
    </aside>
  )
}
