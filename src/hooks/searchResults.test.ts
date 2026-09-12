import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchSearchPage } from './searchResults'

const signal = new AbortController().signal

function page(total: number, titles: string[]) {
  return { numFound: total, docs: titles.map((title, index) => ({ key: `/works/${title}-${index}`, title })) }
}

describe('fetchSearchPage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('requests the next relevance page without refetching page one', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(page(45, ['Book 21'])), { status: 200 }))

    const result = await fetchSearchPage('title:"books"', 2, 'relevance', signal, 45, false)

    expect(result.books[0].title).toBe('Book 21')
    expect(new URL(fetchMock.mock.calls[0][0] as string).searchParams.get('page')).toBe('2')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('requests the correct reverse window for descending title order', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(page(45, ['A'])), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page(45, ['Z', 'Y'])), { status: 200 }))

    const result = await fetchSearchPage('title:"books"', 1, 'title-desc', signal, undefined, false)
    const requestUrl = new URL(fetchMock.mock.calls[1][0] as string)

    expect(result.books.map((book) => book.title)).toEqual(['Y', 'Z'])
    expect(requestUrl.searchParams.get('offset')).toBe('25')
    expect(requestUrl.searchParams.get('limit')).toBe('20')
  })
})
