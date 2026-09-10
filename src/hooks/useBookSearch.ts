import { useCallback, useEffect, useRef, useState } from 'react'
import { BOOKS_PER_PAGE, searchBooks } from '../services/openLibraryApi'
import type { Book, SearchScope, SortOption } from '../types/book'
import { readCachedPage, writeCachedPage } from './searchCache'
import { fetchSearchPage, getSearchCacheKey } from './searchResults'
import { useSuggestions } from './useSuggestions'

const MIN_QUERY_LENGTH = 2

function isAbortError(error: unknown): boolean {
  return (error instanceof DOMException && error.name === 'AbortError')
    || (error instanceof Error && error.name === 'AbortError')
}

export function useBookSearch(sort: SortOption) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>('book')
  const [results, setResults] = useState<Book[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchedQuery, setSearchedQuery] = useState('')
  const [searchedScope, setSearchedScope] = useState<SearchScope>('book')
  const [searchedSort, setSearchedSort] = useState<SortOption>('relevance')
  const [requestQuery, setRequestQuery] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(false)
  const mainControllerRef = useRef<AbortController | null>(null)
  const searchCacheRef = useRef(new Map<string, Awaited<ReturnType<typeof searchBooks>>>())
  const { suggestions, isSuggesting, clearSuggestions, skipNextSuggestions } = useSuggestions(query, scope)

  const executeSearch = useCallback(async (value: string, requestedQuery = value, requestedSort = sort) => {
    const trimmedQuery = value.trim()
    clearSuggestions()

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
      setSearchedSort(requestedSort)
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
    setSearchedSort(requestedSort)
    setRequestQuery(requestedQuery)
    setError(null)
    setLoadMoreError(null)

    const cacheKey = getSearchCacheKey(requestedQuery, 1, requestedSort)
    const cachedPage = readCachedPage(searchCacheRef.current, cacheKey)
    if (cachedPage) {
      setResults(cachedPage.books)
      setTotalResults(cachedPage.total)
      setPage(1)
      setCanLoadMore(cachedPage.books.length > 0 && (cachedPage.total > cachedPage.books.length || (cachedPage.total === 0 && cachedPage.books.length === BOOKS_PER_PAGE)))
      setIsSearching(false)
      return
    }

    try {
      const pageData = await fetchSearchPage(requestedQuery, 1, requestedSort, controller.signal)
      if (!controller.signal.aborted) {
        writeCachedPage(searchCacheRef.current, cacheKey, pageData)
        setResults(pageData.books)
        setTotalResults(pageData.total)
        setPage(1)
        setCanLoadMore(pageData.books.length > 0 && (pageData.total > pageData.books.length || (pageData.total === 0 && pageData.books.length === BOOKS_PER_PAGE)))
      }
    } catch (requestError) {
      if (!isAbortError(requestError) && !controller.signal.aborted) setError('We could not load books right now. Please try again.')
    } finally {
      if (!controller.signal.aborted) setIsSearching(false)
    }
  }, [clearSuggestions, scope, sort])

  const loadMore = useCallback(async () => {
    if (isSearching || isLoadingMore || !canLoadMore || scope !== searchedScope || sort !== searchedSort || query.trim() !== searchedQuery || query.trim().length < MIN_QUERY_LENGTH) return

    const controller = new AbortController()
    const nextPage = page + 1
    mainControllerRef.current?.abort()
    mainControllerRef.current = controller
    setIsLoadingMore(true)
    setLoadMoreError(null)

    const cacheKey = getSearchCacheKey(requestQuery, nextPage, sort)
    const cachedPage = readCachedPage(searchCacheRef.current, cacheKey)
    if (cachedPage) {
      appendUniqueResults(cachedPage.books)
      setPage(nextPage)
      setTotalResults(cachedPage.total)
      setCanLoadMore(cachedPage.books.length > 0 && (cachedPage.total > 0 ? nextPage * BOOKS_PER_PAGE < cachedPage.total : cachedPage.books.length === BOOKS_PER_PAGE))
      setIsLoadingMore(false)
      return
    }

    try {
      const pageData = await fetchSearchPage(requestQuery, nextPage, sort, controller.signal, totalResults)
      if (!controller.signal.aborted) {
        writeCachedPage(searchCacheRef.current, cacheKey, pageData)
        appendUniqueResults(pageData.books)
        setPage(nextPage)
        setTotalResults(pageData.total)
        setCanLoadMore(pageData.books.length > 0 && (pageData.total > 0 ? nextPage * BOOKS_PER_PAGE < pageData.total : pageData.books.length === BOOKS_PER_PAGE))
      }
    } catch (requestError) {
      if (!controller.signal.aborted && !isAbortError(requestError)) setLoadMoreError('Could not load more books.')
    } finally {
      if (!controller.signal.aborted) setIsLoadingMore(false)
    }

    function appendUniqueResults(nextBooks: Book[]) {
      setResults((currentResults) => {
        const existingIds = new Set(currentResults.map((book) => book.id))
        return [...currentResults, ...nextBooks.filter((book) => !existingIds.has(book.id))]
      })
    }
  }, [canLoadMore, isLoadingMore, isSearching, page, query, requestQuery, scope, searchedQuery, searchedScope, searchedSort, sort, totalResults])

  const searchNow = useCallback((value = query, requestedQuery = value, requestedSort = sort) => {
    if (value.trim() !== query.trim()) skipNextSuggestions()
    setQuery(value)
    void executeSearch(value, requestedQuery, requestedSort)
  }, [executeSearch, query, skipNextSuggestions, sort])

  useEffect(() => () => mainControllerRef.current?.abort(), [])

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
    canLoadMore: canLoadMore && scope === searchedScope && sort === searchedSort && query.trim() === searchedQuery,
    searchNow,
    loadMore,
    clearSuggestions,
  }
}
