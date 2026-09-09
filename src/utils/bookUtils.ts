import type { Book, BookFilters, SortOption } from '../types/book'

export function sortBooks(books: Book[], sort: SortOption): Book[] {
  if (sort === 'relevance') return books

  return [...books].sort((a, b) => {
    const comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    return sort === 'title-asc' ? comparison : -comparison
  })
}

export function filterBooks(books: Book[], filters: BookFilters): Book[] {
  const minYear = filters.minYear ? Number(filters.minYear) : null
  const maxYear = filters.maxYear ? Number(filters.maxYear) : null

  return books.filter((book) => {
    const matchesAuthor = !filters.author || book.authors.includes(filters.author)
    const matchesMinYear = minYear === null || (book.firstPublishYear !== null && book.firstPublishYear >= minYear)
    const matchesMaxYear = maxYear === null || (book.firstPublishYear !== null && book.firstPublishYear <= maxYear)
    return matchesAuthor && matchesMinYear && matchesMaxYear
  })
}

export function getAuthors(books: Book[]): string[] {
  return Array.from(new Set(books.flatMap((book) => book.authors))).sort((a, b) => a.localeCompare(b))
}
