import { BOOKS_PER_PAGE, searchBooks, type BookSearchPage } from '../services/openLibraryApi'
import type { SortOption } from '../types/book'

export function getSearchCacheKey(requestQuery: string, page: number, sort: SortOption): string {
  return JSON.stringify([requestQuery, page, sort, BOOKS_PER_PAGE])
}

export async function fetchSearchPage(requestQuery: string, page: number, sort: SortOption, signal: AbortSignal, totalHint?: number): Promise<BookSearchPage> {
  if (sort !== 'title-desc') return searchBooks(requestQuery, { signal, limit: BOOKS_PER_PAGE, page, sort })

  const firstPage = totalHint === undefined
    ? await searchBooks(requestQuery, { signal, limit: BOOKS_PER_PAGE, page: 1, sort: 'title-asc' })
    : null
  const total = totalHint ?? firstPage?.total ?? 0
  if (total <= BOOKS_PER_PAGE && firstPage) return { ...firstPage, books: [...firstPage.books].reverse() }

  const endOffset = total - (page - 1) * BOOKS_PER_PAGE
  const offset = Math.max(0, endOffset - BOOKS_PER_PAGE)
  const limit = endOffset - offset
  const pageData = await searchBooks(requestQuery, { signal, limit, offset, sort: 'title-asc' })
  return { ...pageData, books: [...pageData.books].reverse() }
}
