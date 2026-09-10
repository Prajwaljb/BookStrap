import { useEffect, useState } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { BookFilters } from '../../types/book'

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
  const hasFilters = Boolean((showAuthorFilter && draftFilters.author) || draftFilters.minYear || draftFilters.maxYear)
  const hasInvalidYear = !isValidYear(draftFilters.minYear) || !isValidYear(draftFilters.maxYear)
  const hasInvalidRange = Boolean(draftFilters.minYear && draftFilters.maxYear) && !hasInvalidYear && Number(draftFilters.minYear) > Number(draftFilters.maxYear)
  const yearError = hasInvalidYear ? 'Use four-digit years.' : hasInvalidRange ? 'From must be before To.' : ''

  useEffect(() => setDraftFilters(filters), [filters])

  const updateYear = (key: 'minYear' | 'maxYear', value: string) => {
    setDraftFilters((current) => ({ ...current, [key]: value.replace(/\D/g, '').slice(0, 4) }))
  }

  const fieldClass = 'w-full rounded-[10px] border border-black bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black'

  return (
    <aside className="rounded-[14px] border border-black bg-white p-4" aria-label="Filter books">
      <div className="mb-4 flex items-center gap-2 border-b border-black pb-4"><SlidersHorizontal size={18} aria-hidden="true" /><h2 className="font-mono text-[11px] font-medium uppercase tracking-[.04em]">Filter results</h2></div>
      <div className="space-y-4">
        {showAuthorFilter && <label className="block text-sm"><span className="mb-1.5 block font-mono text-[10px] tracking-[.04em]">Author</span><select className={fieldClass} value={draftFilters.author} onChange={(event) => setDraftFilters({ ...draftFilters, author: event.target.value })} aria-label="Author"><option value="">All authors</option>{authors.map((author) => <option key={author} value={author}>{author}</option>)}</select></label>}
        <div>
          <span className="mb-1.5 block font-mono text-[10px] tracking-[.04em]">Publication year</span>
          <div className="flex items-center gap-1.5">
            <input className={fieldClass} type="text" placeholder="YYYY" value={draftFilters.minYear} aria-label="Minimum publication year" inputMode="numeric" maxLength={4} onChange={(event) => updateYear('minYear', event.target.value)} />
            <span aria-hidden="true">—</span>
            <input className={fieldClass} type="text" placeholder="YYYY" value={draftFilters.maxYear} aria-label="Maximum publication year" inputMode="numeric" maxLength={4} onChange={(event) => updateYear('maxYear', event.target.value)} />
          </div>
          {yearError && <p className="mt-1 text-xs text-red-700" role="alert">{yearError}</p>}
          <p className="mt-2 font-mono text-[9px]">Missing years are excluded.</p>
        </div>
        <button type="button" className="min-h-[38px] w-full rounded-[10px] bg-black px-3 py-2 text-sm font-bold text-white hover:bg-white hover:text-black hover:outline hover:outline-1 hover:outline-black disabled:cursor-not-allowed disabled:opacity-50" disabled={Boolean(yearError)} onClick={() => onApply(showAuthorFilter ? draftFilters : { ...draftFilters, author: '' })}>Apply filters</button>
        {hasFilters && <button type="button" className="inline-flex items-center gap-1 p-0 font-mono text-[10px] text-black hover:underline" onClick={() => { setDraftFilters({ author: '', minYear: '', maxYear: '' }); onClear() }}><RotateCcw size={15} /> Reset filters</button>}
      </div>
    </aside>
  )
}
