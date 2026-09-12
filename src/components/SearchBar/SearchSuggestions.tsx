import { LoaderCircle } from 'lucide-react'
import type { Book, SearchScope } from '../../types/book'

type SearchSuggestionsProps = {
  suggestions: Book[]
  loading: boolean
  scope: SearchScope
  activeIndex: number
  onActiveChange: (index: number) => void
  onSelect: (book: Book) => void
}

export function SearchSuggestions({ suggestions, loading, scope, activeIndex, onActiveChange, onSelect }: SearchSuggestionsProps) {
  if (!loading && suggestions.length === 0) return null

  return (
    <div className="absolute left-0 right-0 top-[68px] z-10 overflow-hidden rounded-[14px] border border-[var(--color-black)] bg-[var(--color-white)] shadow-[4px_4px_0_var(--color-black)]" role="listbox" aria-label={scope === 'author' ? 'Author suggestions' : 'Book suggestions'}>
      {loading ? (
        <div className="flex items-center gap-2 p-4 text-sm"><LoaderCircle size={17} className="animate-spin" />Finding {scope === 'author' ? 'authors' : 'books'}...</div>
      ) : (
        <div>
          {suggestions.map((book, index) => (
            <button key={book.id} type="button" className={`block w-full cursor-pointer border-0 bg-[var(--color-white)] px-4 py-3 text-left hover:bg-[var(--color-black)] hover:text-[var(--color-white)] ${index === activeIndex ? 'bg-[var(--color-black)] text-[var(--color-white)]' : ''}`} onMouseEnter={() => onActiveChange(index)} onClick={() => onSelect(book)} role="option" aria-selected={index === activeIndex}><span className="block">{scope === 'author' ? (book.authors[0] ?? book.title) : book.title}</span>{scope !== 'author' && <span className="mt-1 block text-sm opacity-80">{book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'}</span>}</button>
          ))}
        </div>
      )}
    </div>
  )
}
