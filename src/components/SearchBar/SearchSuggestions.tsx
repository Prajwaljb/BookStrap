import { LoaderCircle } from 'lucide-react'
import type { Book, SearchScope } from '../../types/book'

type SearchSuggestionsProps = {
  id: string
  suggestions: Book[]
  loading: boolean
  scope: SearchScope
  activeIndex: number
  onActiveChange: (index: number) => void
  onSelect: (book: Book) => void
}

export function SearchSuggestions({ id, suggestions, loading, scope, activeIndex, onActiveChange, onSelect }: SearchSuggestionsProps) {
  if (!loading && suggestions.length === 0) return null

  return (
    <div id={id} className="absolute left-0 right-0 top-[68px] z-10 overflow-hidden rounded-[14px] border border-[#8a8a8a] bg-[#fafafa] text-[#111] shadow-[3px_3px_0_#111]" role="listbox" aria-label={scope === 'author' ? 'Author suggestions' : 'Book suggestions'}>
      {loading ? (
        <div className="flex items-center gap-2 p-4 text-sm"><LoaderCircle size={17} className="animate-spin" />Finding {scope === 'author' ? 'authors' : 'books'}...</div>
      ) : (
        <div>
          {suggestions.map((book, index) => (
            <button id={`book-search-suggestion-${index}`} key={book.id} type="button" className={`block w-full cursor-pointer border-0 px-4 py-3 text-left ${index === activeIndex ? 'bg-[#111] text-white' : 'bg-[#fafafa] text-[#111] hover:bg-[#e8e8e8]'}`} onMouseEnter={() => onActiveChange(index)} onClick={() => onSelect(book)} role="option" aria-selected={index === activeIndex}><span className="block">{scope === 'author' ? (book.authors[0] ?? book.title) : book.title}</span>{scope !== 'author' && <span className="mt-1 block text-sm opacity-70">{book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'}</span>}</button>
          ))}
        </div>
      )}
    </div>
  )
}
