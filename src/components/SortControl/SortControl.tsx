import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { SortOption } from '../../types/book'
import styles from './SortControl.module.css'

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
    <div ref={wrapperRef} className={styles.wrapper}>
      <span className={styles.label}>Sort by</span>
      <button type="button" className={styles.trigger} aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((current) => !current); setActiveIndex(selectedIndex) }} onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setOpen(true); setActiveIndex(selectedIndex) } }}>
        {selectedOption.label}<ChevronDown size={15} />
      </button>
      {open && <div className={styles.menu} role="listbox" aria-label="Sort results" onKeyDown={handleMenuKeyDown} tabIndex={0} autoFocus>
        {SORT_OPTIONS.map((option, index) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} className={`${styles.option} ${index === activeIndex ? styles.optionActive : ''}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => selectOption(option.value)}>{option.label}{option.value === value && <Check size={14} />}</button>)}
      </div>}
    </div>
  )
}
