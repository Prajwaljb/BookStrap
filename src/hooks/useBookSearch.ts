import { useCallback, useEffect, useRef, useState } from 'react'
import { BOOKS_PER_PAGE, searchBooks } from '../services/openLibraryApi'
import type { Book } from '../types/book'

const MIN_QUERY_LENGTH = 2
const SUGGESTION_LIMIT = 5
const DEBOUNCE_MS = 180
const SUGGESTION_CACHE_SIZE = 24

function isAbortError(error: unknown): boolean {
  return (error instanceof DOMException && error.name === 'AbortError')
    || (error instanceof Error && error.name === 'AbortError')
}

export function useBookSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[]>([])
  const [suggestions, setSuggestions] = useState<Book[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchedQuery, setSearchedQuery] = useState('')
  const [requestQuery, setRequestQuery] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(false)
  const mainControllerRef = useRef<AbortController | null>(null)
  const suggestionControllerRef = useRef<AbortController | null>(null)
  const suggestionCacheRef = useRef(new Map<string, Book[]>())
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
    setRequestQuery(requestedQuery)
    setError(null)
    setLoadMoreError(null)

    try {
      const { books, total } = await searchBooks(requestedQuery, { signal: controller.signal, limit: BOOKS_PER_PAGE, page: 1 })
      if (!controller.signal.aborted) {
        setResults(books)
        setTotalResults(total)
        setPage(1)
        setCanLoadMore(books.length > 0 && (total > books.length || (total === 0 && books.length === BOOKS_PER_PAGE)))
      }
    } catch (requestError) {
      if (isAbortError(requestError)) return
      if (!controller.signal.aborted) setError('We could not load books right now. Please try again.')
    } finally {
      if (!controller.signal.aborted) setIsSearching(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (isSearching || isLoadingMore || !canLoadMore || query.trim() !== searchedQuery || query.trim().length < MIN_QUERY_LENGTH) return

    const controller = new AbortController()
    const nextPage = page + 1
    mainControllerRef.current?.abort()
    mainControllerRef.current = controller
    setIsLoadingMore(true)
    setLoadMoreError(null)

    try {
      const { books, total } = await searchBooks(requestQuery, { signal: controller.signal, limit: BOOKS_PER_PAGE, page: nextPage })
      if (!controller.signal.aborted) {
        setResults((currentResults) => {
          const existingIds = new Set(currentResults.map((book) => book.id))
          return [...currentResults, ...books.filter((book) => !existingIds.has(book.id))]
        })
        setPage(nextPage)
        setTotalResults(total)
        setCanLoadMore(books.length > 0 && (total > 0 ? nextPage * BOOKS_PER_PAGE < total : books.length === BOOKS_PER_PAGE))
      }
    } catch (requestError) {
      if (!controller.signal.aborted && !isAbortError(requestError)) setLoadMoreError('Could not load more books.')
    } finally {
      if (!controller.signal.aborted) setIsLoadingMore(false)
    }
  }, [canLoadMore, isLoadingMore, isSearching, page, query, requestQuery, searchedQuery])

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
      const cachedSuggestions = suggestionCacheRef.current.get(trimmedQuery)
      if (cachedSuggestions) {
        setSuggestions(cachedSuggestions)
        setIsSuggesting(false)
        return
      }

      const controller = new AbortController()
      suggestionControllerRef.current = controller
      setIsSuggesting(true)

      try {
        const { books } = await searchBooks(trimmedQuery, { signal: controller.signal, limit: SUGGESTION_LIMIT, page: 1 })
        if (!controller.signal.aborted) {
          suggestionCacheRef.current.set(trimmedQuery, books)
          if (suggestionCacheRef.current.size > SUGGESTION_CACHE_SIZE) {
            const oldestQuery = suggestionCacheRef.current.keys().next().value
            if (oldestQuery) suggestionCacheRef.current.delete(oldestQuery)
          }
          setSuggestions(books)
        }
      } catch (requestError) {
        if (!controller.signal.aborted && !isAbortError(requestError)) setSuggestions([])
      } finally {
        if (!controller.signal.aborted) setIsSuggesting(false)
      }
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => () => {
    mainControllerRef.current?.abort()
    suggestionControllerRef.current?.abort()
  }, [])

  return {
    query,
    setQuery,
    results,
    suggestions,
    isSearching,
    isSuggesting,
    error,
    loadMoreError,
    hasSearched,
    totalResults,
    isLoadingMore,
    canLoadMore: canLoadMore && query.trim() === searchedQuery,
    searchNow,
    loadMore,
    clearSuggestions,
  }
}
