import { useCallback, useEffect, useRef, useState } from 'react'
import { searchBooks } from '../services/openLibraryApi'
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
  const [hasSearched, setHasSearched] = useState(false)
  const mainControllerRef = useRef<AbortController | null>(null)
  const suggestionControllerRef = useRef<AbortController | null>(null)
  const suggestionCacheRef = useRef(new Map<string, Book[]>())
  const skipSuggestionRef = useRef(false)
  const clearSuggestions = useCallback(() => {
    suggestionControllerRef.current?.abort()
    setSuggestions([])
    setIsSuggesting(false)
  }, [])

  const executeSearch = useCallback(async (value: string) => {
    const trimmedQuery = value.trim()
    suggestionControllerRef.current?.abort()
    setSuggestions([])

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      mainControllerRef.current?.abort()
      setResults([])
      setError(null)
      setIsSearching(false)
      setHasSearched(false)
      return
    }

    mainControllerRef.current?.abort()
    const controller = new AbortController()
    mainControllerRef.current = controller
    setResults([])
    setIsSearching(true)
    setHasSearched(true)
    setError(null)

    try {
      const books = await searchBooks(trimmedQuery, controller.signal)
      if (!controller.signal.aborted) setResults(books)
    } catch (requestError) {
      if (isAbortError(requestError)) return
      if (!controller.signal.aborted) setError('We could not load books right now. Please try again.')
    } finally {
      if (!controller.signal.aborted) setIsSearching(false)
    }
  }, [])

  const searchNow = useCallback((value = query) => {
    skipSuggestionRef.current = value.trim() !== query.trim()
    setQuery(value)
    void executeSearch(value)
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
        const books = await searchBooks(trimmedQuery, controller.signal, SUGGESTION_LIMIT)
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
    hasSearched,
    searchNow,
    clearSuggestions,
  }
}
