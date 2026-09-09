import type { Book } from '../../types/book'
import { BookCard } from './BookCard'

export function BookList({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
      {books.map((book) => <BookCard key={book.id} book={book} />)}
    </div>
  )
}
