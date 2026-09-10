import type { Book, BookFilters } from '../types/book'

export function filterBooks(books: Book[], filters: BookFilters): Book[] {
  const minYear = filters.minYear ? Number(filters.minYear) : null
  const maxYear = filters.maxYear ? Number(filters.maxYear) : null

  return books.filter((book) => {
    const matchesAuthor = !filters.author || book.authors.includes(filters.author)
    const hasYearFilter = minYear !== null || maxYear !== null
    const matchesYear = !hasYearFilter || (
      book.firstPublishYear !== null
      && (minYear === null || book.firstPublishYear >= minYear)
      && (maxYear === null || book.firstPublishYear <= maxYear)
    )
    return matchesAuthor && matchesYear
  })
}

export function getAuthors(books: Book[]): string[] {
  return Array.from(new Set(books.flatMap((book) => book.authors))).sort((a, b) => a.localeCompare(b))
}
