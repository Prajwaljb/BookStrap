import { useCallback, useEffect, useRef, useState } from 'react'
import { BOOKS_PER_PAGE, searchBooks } from '../services/openLibraryApi'
import type { Book, SearchConfig, SearchRequest, SearchScope, SortOption } from '../types/book'
import { readCachedPage, writeCachedPage } from './searchCache'
import { fetchSearchPage, getSearchCacheKey } from './searchResults'
import { useSuggestions } from './useSuggestions'

const MIN_QUERY_LENGTH = 2

function isAbortError(error: unknown): boolean {
  return (error instanceof DOMException && error.name === 'AbortError')
    || (error instanceof Error && error.name === 'AbortError')
}

export function useBookSearch({ sort, hasFullText }: SearchConfig) {
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
  const [searchedHasFullText, setSearchedHasFullText] = useState(false)
  const [requestQuery, setRequestQuery] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(false)
  const mainControllerRef = useRef<AbortController | null>(null)
  const searchCacheRef = useRef(new Map<string, Awaited<ReturnType<typeof searchBooks>>>())
  const { suggestions, isSuggesting, clearSuggestions, skipNextSuggestions } = useSuggestions(query, scope)

  const executeSearch = useCallback(async (value: string, { requestQuery = value, sort: requestedSort = sort, hasFullText: requestedHasFullText = hasFullText }: SearchRequest = {}) => {
    const trimmedQuery = value.trim()
    clearSuggestions()

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      mainControllerRef.current?.abort()
      setResults([])
      setError(null)
      setLoadMoreError(null)
      setTotalResults(0)
      setAvailableAuthors([])
      setPage(0)
      setCanLoadMore(false)
      setSearchedQuery('')
      setSearchedScope(scope)
      setSearchedSort(requestedSort)
      setSearchedHasFullText(requestedHasFullText)
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
    setSearchedHasFullText(requestedHasFullText)
    setRequestQuery(requestQuery)
    setError(null)
    setLoadMoreError(null)
    setAvailableAuthors([])

    const cacheKey = getSearchCacheKey(requestQuery, 1, requestedSort, requestedHasFullText)
    const cachedPage = readCachedPage(searchCacheRef.current, cacheKey)
    if (cachedPage) {
      setResults(cachedPage.books)
      setTotalResults(cachedPage.total)
      setAvailableAuthors(cachedPage.authors)
      setPage(1)
      setCanLoadMore(cachedPage.books.length > 0 && (cachedPage.total > cachedPage.books.length || (cachedPage.total === 0 && cachedPage.books.length === BOOKS_PER_PAGE)))
      setIsSearching(false)
      return
    }

    try {
      const pageData = await fetchSearchPage(requestQuery, 1, requestedSort, controller.signal, undefined, requestedHasFullText)
      if (!controller.signal.aborted) {
        writeCachedPage(searchCacheRef.current, cacheKey, pageData)
        setResults(pageData.books)
        setTotalResults(pageData.total)
        setAvailableAuthors(pageData.authors)
        setPage(1)
        setCanLoadMore(pageData.books.length > 0 && (pageData.total > pageData.books.length || (pageData.total === 0 && pageData.books.length === BOOKS_PER_PAGE)))
      }
    } catch (requestError) {
      if (!isAbortError(requestError) && !controller.signal.aborted) setError('We could not load books right now. Please try again.')
    } finally {
      if (!controller.signal.aborted) setIsSearching(false)
    }
  }, [clearSuggestions, hasFullText, scope, sort])

  const loadMore = useCallback(async () => {
    if (isSearching || isLoadingMore || !canLoadMore || scope !== searchedScope || sort !== searchedSort || query.trim() !== searchedQuery || query.trim().length < MIN_QUERY_LENGTH) return

    const controller = new AbortController()
    const nextPage = page + 1
    mainControllerRef.current?.abort()
    mainControllerRef.current = controller
    setIsLoadingMore(true)
    setLoadMoreError(null)

    const cacheKey = getSearchCacheKey(requestQuery, nextPage, sort, searchedHasFullText)
    const cachedPage = readCachedPage(searchCacheRef.current, cacheKey)
    if (cachedPage) {
      appendUniqueResults(cachedPage.books)
      setPage(nextPage)
      setTotalResults(cachedPage.total)
      setAvailableAuthors((currentAuthors) => Array.from(new Set([...currentAuthors, ...cachedPage.authors])).sort((a, b) => a.localeCompare(b)))
      setCanLoadMore(cachedPage.books.length > 0 && (cachedPage.total > 0 ? nextPage * BOOKS_PER_PAGE < cachedPage.total : cachedPage.books.length === BOOKS_PER_PAGE))
      setIsLoadingMore(false)
      return
    }

    try {
      const pageData = await fetchSearchPage(requestQuery, nextPage, sort, controller.signal, totalResults, searchedHasFullText)
      if (!controller.signal.aborted) {
        writeCachedPage(searchCacheRef.current, cacheKey, pageData)
        appendUniqueResults(pageData.books)
        setPage(nextPage)
        setTotalResults(pageData.total)
        setAvailableAuthors((currentAuthors) => Array.from(new Set([...currentAuthors, ...pageData.authors])).sort((a, b) => a.localeCompare(b)))
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
  }, [canLoadMore, isLoadingMore, isSearching, page, query, requestQuery, scope, searchedHasFullText, searchedQuery, searchedScope, searchedSort, sort, totalResults])

  const searchNow = useCallback(({ value = query, ...request }: SearchRequest = {}) => {
    if (value.trim() !== query.trim()) skipNextSuggestions()
    setQuery(value)
    void executeSearch(value, request)
  }, [executeSearch, query, skipNextSuggestions])

  const updateQuery = useCallback((nextQuery: string) => {
    if (nextQuery !== query) {
      mainControllerRef.current?.abort()
      setIsSearching(false)
      setIsLoadingMore(false)
    }
    setQuery(nextQuery)
  }, [query])

  useEffect(() => () => mainControllerRef.current?.abort(), [])

  return {
    query,
    setQuery: updateQuery,
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
    availableAuthors,
    isLoadingMore,
    canLoadMore: canLoadMore && scope === searchedScope && sort === searchedSort && query.trim() === searchedQuery,
    searchNow,
    loadMore,
    clearSuggestions,
  }
}
