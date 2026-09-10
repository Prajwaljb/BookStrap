import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { SortOption } from '../../types/book'

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'title-asc', label: 'Title A → Z' },
  { value: 'title-desc', label: 'Title Z → A' },
]

export function SortControl({ value, onChange }: { value: SortOption; onChange: (value: SortOption) => void }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => SORT_OPTIONS.findIndex((option) => option.value === value))
  const wrapperRef = useRef<HTMLDivElement>(null)
  const selectedIndex = SORT_OPTIONS.findIndex((option) => option.value === value)
  const selectedOption = SORT_OPTIONS[selectedIndex] ?? SORT_OPTIONS[0]

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const selectOption = (nextValue: SortOption) => {
    onChange(nextValue)
    setOpen(false)
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % SORT_OPTIONS.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => index <= 0 ? SORT_OPTIONS.length - 1 : index - 1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      selectOption(SORT_OPTIONS[activeIndex].value)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-[150px] text-[10px]">
      <span className="mb-1 block font-mono tracking-[.04em]">Sort by</span>
      <button type="button" className="flex w-full items-center justify-between rounded-[11px] border border-black bg-white px-3 py-2 font-mono text-[10px] outline-none focus:ring-2 focus:ring-black" aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((current) => !current); setActiveIndex(selectedIndex) }} onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen(true); setActiveIndex(selectedIndex) } }}>
        {selectedOption.label}<ChevronDown size={15} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      {open && <div className="absolute right-0 top-full z-20 mt-1 w-full overflow-hidden rounded-[10px] border border-black bg-white p-1 shadow-[3px_3px_0_#000]" role="listbox" aria-label="Sort results" onKeyDown={handleMenuKeyDown} tabIndex={0} autoFocus>
        {SORT_OPTIONS.map((option, index) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} className={`flex w-full items-center justify-between rounded-[7px] px-2 py-2 text-left text-[11px] ${index === activeIndex ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectOption(option.value)}>{option.label}{option.value === value && <Check size={14} />}</button>)}
      </div>}
    </div>
  )
}
