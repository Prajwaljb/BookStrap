import { useCallback, useEffect, useRef, useState } from 'react'
import { BOOKS_PER_PAGE, searchBooks, type BookSearchPage } from '../services/openLibraryApi'
import type { Book, SearchScope } from '../types/book'

const MIN_QUERY_LENGTH = 2
const SUGGESTION_LIMIT = 5
const DEBOUNCE_MS = 180
const SUGGESTION_CACHE_SIZE = 24
const SEARCH_CACHE_SIZE = 12

function isAbortError(error: unknown): boolean {
  return (error instanceof DOMException && error.name === 'AbortError')
    || (error instanceof Error && error.name === 'AbortError')
}

function uniqueAuthorSuggestions(books: Book[]): Book[] {
  const seenAuthors = new Set<string>()
  return books.filter((book) => {
    const author = book.authors[0]?.trim()
    if (!author) return false
    const authorKey = author.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (seenAuthors.has(authorKey)) return false
    seenAuthors.add(authorKey)
    return true
  })
}

function getSearchCacheKey(requestQuery: string, page: number): string {
  return JSON.stringify([requestQuery, page, BOOKS_PER_PAGE])
}

function readCachedPage(cache: Map<string, BookSearchPage>, key: string): BookSearchPage | undefined {
  const cachedPage = cache.get(key)
  if (!cachedPage) return undefined
  cache.delete(key)
  cache.set(key, cachedPage)
  return cachedPage
}

function writeCachedPage(cache: Map<string, BookSearchPage>, key: string, page: BookSearchPage): void {
  cache.delete(key)
  cache.set(key, page)
  if (cache.size > SEARCH_CACHE_SIZE) cache.delete(cache.keys().next().value ?? '')
}

export function useBookSearch() {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>('book')
  const [results, setResults] = useState<Book[]>([])
  const [suggestions, setSuggestions] = useState<Book[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchedQuery, setSearchedQuery] = useState('')
  const [searchedScope, setSearchedScope] = useState<SearchScope>('book')
  const [requestQuery, setRequestQuery] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(false)
  const mainControllerRef = useRef<AbortController | null>(null)
  const suggestionControllerRef = useRef<AbortController | null>(null)
  const suggestionCacheRef = useRef(new Map<string, Book[]>())
  const searchCacheRef = useRef(new Map<string, BookSearchPage>())
  const skipSuggestionRef = useRef(false)
  const clearSuggestions = useCallback(() => {
    suggestionControllerRef.current?.abort()
    setSuggestions([])
    setIsSuggesting(false)
  }, [])

  const executeSearch = useCallback(async (value: string, requestedQuery = value) => {
    const trimmedQuery = value.trim()
    suggestionControllerRef.current?.abort()
    setSuggestions([])

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      mainControllerRef.current?.abort()
      setResults([])
      setError(null)
      setLoadMoreError(null)
      setTotalResults(0)
      setPage(0)
      setCanLoadMore(false)
      setSearchedQuery('')
      setSearchedScope(scope)
      setRequestQuery('')
      setIsSearching(false)
      setIsLoadingMore(false)
      setHasSearched(false)
      return
    }

    mainControllerRef.current?.abort()
    const controller = new AbortController()
    mainControllerRef.current = controller
    setResults([])
    setIsSearching(true)
    setIsLoadingMore(false)
    setHasSearched(true)
    setSearchedQuery(trimmedQuery)
    setSearchedScope(scope)
    setRequestQuery(requestedQuery)
    setError(null)
    setLoadMoreError(null)

    const cachedPage = readCachedPage(searchCacheRef.current, getSearchCacheKey(requestedQuery, 1))
    if (cachedPage) {
      setResults(cachedPage.books)
      setTotalResults(cachedPage.total)
      setPage(1)
      setCanLoadMore(cachedPage.books.length > 0 && (cachedPage.total > cachedPage.books.length || (cachedPage.total === 0 && cachedPage.books.length === BOOKS_PER_PAGE)))
      setIsSearching(false)
      return
    }

    try {
      const pageData = await searchBooks(requestedQuery, { signal: controller.signal, limit: BOOKS_PER_PAGE, page: 1 })
      if (!controller.signal.aborted) {
        writeCachedPage(searchCacheRef.current, getSearchCacheKey(requestedQuery, 1), pageData)
        setResults(pageData.books)
        setTotalResults(pageData.total)
        setPage(1)
        setCanLoadMore(pageData.books.length > 0 && (pageData.total > pageData.books.length || (pageData.total === 0 && pageData.books.length === BOOKS_PER_PAGE)))
      }
    } catch (requestError) {
      if (isAbortError(requestError)) return
      if (!controller.signal.aborted) setError('We could not load books right now. Please try again.')
    } finally {
      if (!controller.signal.aborted) setIsSearching(false)
    }
  }, [scope])

  const loadMore = useCallback(async () => {
    if (isSearching || isLoadingMore || !canLoadMore || scope !== searchedScope || query.trim() !== searchedQuery || query.trim().length < MIN_QUERY_LENGTH) return

    const controller = new AbortController()
    const nextPage = page + 1
    mainControllerRef.current?.abort()
    mainControllerRef.current = controller
    setIsLoadingMore(true)
    setLoadMoreError(null)

    const cachedPage = readCachedPage(searchCacheRef.current, getSearchCacheKey(requestQuery, nextPage))
    if (cachedPage) {
      setResults((currentResults) => {
        const existingIds = new Set(currentResults.map((book) => book.id))
        return [...currentResults, ...cachedPage.books.filter((book) => !existingIds.has(book.id))]
      })
      setPage(nextPage)
      setTotalResults(cachedPage.total)
      setCanLoadMore(cachedPage.books.length > 0 && (cachedPage.total > 0 ? nextPage * BOOKS_PER_PAGE < cachedPage.total : cachedPage.books.length === BOOKS_PER_PAGE))
      setIsLoadingMore(false)
      return
    }

    try {
      const pageData = await searchBooks(requestQuery, { signal: controller.signal, limit: BOOKS_PER_PAGE, page: nextPage })
      if (!controller.signal.aborted) {
        writeCachedPage(searchCacheRef.current, getSearchCacheKey(requestQuery, nextPage), pageData)
        setResults((currentResults) => {
          const existingIds = new Set(currentResults.map((book) => book.id))
          return [...currentResults, ...pageData.books.filter((book) => !existingIds.has(book.id))]
        })
        setPage(nextPage)
        setTotalResults(pageData.total)
        setCanLoadMore(pageData.books.length > 0 && (pageData.total > 0 ? nextPage * BOOKS_PER_PAGE < pageData.total : pageData.books.length === BOOKS_PER_PAGE))
      }
    } catch (requestError) {
      if (!controller.signal.aborted && !isAbortError(requestError)) setLoadMoreError('Could not load more books.')
    } finally {
      if (!controller.signal.aborted) setIsLoadingMore(false)
    }
  }, [canLoadMore, isLoadingMore, isSearching, page, query, requestQuery, scope, searchedQuery, searchedScope])

  const searchNow = useCallback((value = query, requestedQuery = value) => {
    skipSuggestionRef.current = value.trim() !== query.trim()
    setQuery(value)
    void executeSearch(value, requestedQuery)
  }, [executeSearch, query])

  useEffect(() => {
    suggestionControllerRef.current?.abort()
    setIsSuggesting(false)
    const trimmedQuery = query.trim()
    if (skipSuggestionRef.current) {
      skipSuggestionRef.current = false
      return
    }
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      suggestionControllerRef.current?.abort()
      setSuggestions([])
      setIsSuggesting(false)
      return
    }

    const timer = window.setTimeout(async () => {
      const cacheKey = `${scope}:${trimmedQuery}`
      const cachedSuggestions = suggestionCacheRef.current.get(cacheKey)
      if (cachedSuggestions) {
        setSuggestions(cachedSuggestions)
        setIsSuggesting(false)
        return
      }

      const controller = new AbortController()
      suggestionControllerRef.current = controller
      setIsSuggesting(true)

      try {
        const { books } = await searchBooks(trimmedQuery, { signal: controller.signal, limit: SUGGESTION_LIMIT, page: 1, scope })
        if (!controller.signal.aborted) {
          const nextSuggestions = scope === 'author' ? uniqueAuthorSuggestions(books) : books
          suggestionCacheRef.current.set(cacheKey, nextSuggestions)
          if (suggestionCacheRef.current.size > SUGGESTION_CACHE_SIZE) {
            const oldestQuery = suggestionCacheRef.current.keys().next().value
            if (oldestQuery) suggestionCacheRef.current.delete(oldestQuery)
          }
          setSuggestions(nextSuggestions)
        }
      } catch (requestError) {
        if (!controller.signal.aborted && !isAbortError(requestError)) setSuggestions([])
      } finally {
        if (!controller.signal.aborted) setIsSuggesting(false)
      }
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [query, scope])

  useEffect(() => () => {
    mainControllerRef.current?.abort()
    suggestionControllerRef.current?.abort()
  }, [])

  return {
    query,
    setQuery,
    scope,
    setScope,
    results,
    suggestions,
    isSearching,
    isSuggesting,
    error,
    loadMoreError,
    hasSearched,
    totalResults,
    isLoadingMore,
    canLoadMore: canLoadMore && scope === searchedScope && query.trim() === searchedQuery,
    searchNow,
    loadMore,
    clearSuggestions,
  }
}
