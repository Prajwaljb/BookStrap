import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchBooks } from './openLibraryApi'

describe('searchBooks', () => {
  afterEach(() => vi.restoreAllMocks())

  it('sends the required search parameters and exposes author facets', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      numFound: 1,
      docs: [{ key: '/works/OL1W', title: 'A Book', author_name: ['An Author'], first_publish_year: 2020, cover_i: 12 }],
      facets: { author: { 'An Author': 1, 'Another Author': 2 } },
    }), { status: 200 }))

    const result = await searchBooks('books', { scope: 'book', page: 1, limit: 20 })
    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string)

    expect(requestUrl.searchParams.get('q')).toBe('title:"books"')
    expect(requestUrl.searchParams.has('has_fulltext')).toBe(false)
    expect(result.books[0]).toMatchObject({ id: '/works/OL1W', title: 'A Book', authors: ['An Author'] })
    expect(result.authors).toEqual(['An Author', 'Another Author'])
  })

  it('rejects unsuccessful responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }))

    await expect(searchBooks('books')).rejects.toThrow('Book search is currently unavailable.')
  })

  it('adds the full-text filter when enabled', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ docs: [], numFound: 0 }), { status: 200 }))

    await searchBooks('books', { hasFullText: true })

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string)
    expect(requestUrl.searchParams.get('has_fulltext')).toBe('true')
  })

  it('allows lightweight field selection for suggestions', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ docs: [], numFound: 0 }), { status: 200 }))

    await searchBooks('books', { fields: 'key,title,author_name', limit: 5 })

    const requestUrl = new URL(fetchMock.mock.calls[0][0] as string)
    expect(requestUrl.searchParams.get('fields')).toBe('key,title,author_name')
  })

  it('keeps fallback IDs stable across paged responses and trims authors', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      docs: [{ title: 'A Book', author_name: ['  An Author  '] }],
      numFound: 21,
    }), { status: 200 }))

    const result = await searchBooks('books', { page: 2, limit: 20 })

    expect(result.books[0]).toMatchObject({ id: 'a-book-20', authors: ['An Author'] })
    expect(new URL(fetchMock.mock.calls[0][0] as string).searchParams.get('page')).toBe('2')
  })
})