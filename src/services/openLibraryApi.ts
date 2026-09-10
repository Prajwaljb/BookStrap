import type { Book, SearchScope, SortOption } from '../types/book'

const OPEN_LIBRARY_URL = 'https://openlibrary.org/search.json'
export const BOOKS_PER_PAGE = 20
const REQUEST_FIELDS = 'key,title,author_name,first_publish_year,cover_i'

export type BookSearchPage = {
  books: Book[]
  total: number
  authors: string[]
}

type SearchOptions = {
  signal?: AbortSignal
  limit?: number
  page?: number
  offset?: number
  scope?: SearchScope
  sort?: SortOption
  hasFullText?: boolean
}

type OpenLibraryDocument = Record<string, unknown>

function firstString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getFacetAuthors(data: Record<string, unknown>): string[] {
  const facets = isRecord(data.facets) ? data.facets : null
  const authorFacet = facets && isRecord(facets.author) ? facets.author : null
  return authorFacet
    ? Object.keys(authorFacet).filter((author) => Boolean(author.trim())).sort((a, b) => a.localeCompare(b))
    : []
}

function normalizeBook(document: OpenLibraryDocument, fallbackIndex: number): Book | null {
  const title = firstString(document.title)
  if (!title) return null

  const rawAuthors = Array.isArray(document.author_name) ? document.author_name : []
  const authors = rawAuthors
    .filter((author): author is string => typeof author === 'string' && Boolean(author.trim()))
    .map((author) => author.trim())
  const year = typeof document.first_publish_year === 'number' && Number.isFinite(document.first_publish_year)
    ? document.first_publish_year
    : null
  const coverId = typeof document.cover_i === 'number' && Number.isFinite(document.cover_i)
    ? document.cover_i
    : null
  const key = firstString(document.key)

  return {
    id: key ?? `${title.toLowerCase().replaceAll(' ', '-')}-${fallbackIndex}`,
    title,
    authors,
    firstPublishYear: year,
    coverId,
  }
}

export async function searchBooks(query: string, { signal, limit = BOOKS_PER_PAGE, page = 1, offset, scope, sort = 'relevance', hasFullText = false }: SearchOptions = {}): Promise<BookSearchPage> {
  const scopedQuery = scope
    ? `${scope === 'author' ? 'author' : 'title'}:"${query.replaceAll('"', '\\"')}"`
    : query
  const params = new URLSearchParams({
    q: scopedQuery,
    limit: String(limit),
    fields: REQUEST_FIELDS,
  })
  if (hasFullText) params.set('has_fulltext', 'true')
  params.set(offset === undefined ? 'page' : 'offset', String(offset ?? page))
  if (sort !== 'relevance') params.set('sort', 'title')
  const response = await fetch(`${OPEN_LIBRARY_URL}?${params.toString()}`, { signal })

  if (!response.ok) {
    throw new Error('Book search is currently unavailable.')
  }

  const data: unknown = await response.json()
  const documents = isRecord(data) && Array.isArray(data.docs) ? data.docs.filter(isRecord) : []
  const firstResultIndex = offset ?? (page - 1) * limit
  const books = documents.map((document, index) => normalizeBook(document, firstResultIndex + index)).filter((book): book is Book => book !== null)
  const rawTotal = isRecord(data) ? data.numFound ?? data.num_found : null
  const total = typeof rawTotal === 'number' && Number.isFinite(rawTotal) ? Math.max(0, Math.floor(rawTotal)) : 0
  const authors = isRecord(data) ? getFacetAuthors(data) : []

  return { books, total, authors }
}

export function getCoverUrl(coverId: number | null, size: 'M' | 'L' = 'M'): string | null {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : null
}
