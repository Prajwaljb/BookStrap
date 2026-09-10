import { LoaderCircle } from 'lucide-react'
import type { Book, SearchScope } from '../../types/book'
import styles from './SearchSuggestions.module.css'

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
    <div className={styles.suggestions} role="listbox" aria-label={scope === 'author' ? 'Author suggestions' : 'Book suggestions'}>
      {loading ? (
        <div className={styles.status}><LoaderCircle size={17} className={styles.spinner} />Finding {scope === 'author' ? 'authors' : 'books'}…</div>
      ) : (
        <div>
          {suggestions.map((book, index) => (
            <button key={book.id} type="button" className={`${styles.item} ${index === activeIndex ? styles.itemActive : ''}`} onMouseEnter={() => onActiveChange(index)} onClick={() => onSelect(book)} role="option" aria-selected={index === activeIndex}><span className={styles.author}>{scope === 'author' ? (book.authors[0] ?? book.title) : book.title}</span>{scope !== 'author' && <span className={styles.bookAuthor}>{book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'}</span>}</button>
          ))}
        </div>
      )}
    </div>
  )
}
