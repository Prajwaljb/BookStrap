import { useCallback, useEffect, useRef, useState } from 'react'
import { searchBooks } from '../services/openLibraryApi'
import type { Book, SearchScope } from '../types/book'

const SUGGESTION_LIMIT = 5
const DEBOUNCE_MS = 180
const SUGGESTION_CACHE_SIZE = 24
const SUGGESTION_FIELDS = 'key,title,author_name'

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

export function useSuggestions(query: string, scope: SearchScope) {
  const [suggestions, setSuggestions] = useState<Book[]>([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)
  const cacheRef = useRef(new Map<string, Book[]>())
  const skipNextRef = useRef(false)

  const clearSuggestions = useCallback(() => {
    controllerRef.current?.abort()
    setSuggestions([])
    setIsSuggesting(false)
  }, [])

  const skipNextSuggestions = useCallback(() => {
    skipNextRef.current = true
  }, [])

  useEffect(() => {
    controllerRef.current?.abort()
    const trimmedQuery = query.trim()
    if (skipNextRef.current) {
      skipNextRef.current = false
      setSuggestions([])
      setIsSuggesting(false)
      return
    }
    if (trimmedQuery.length < 2) {
      setSuggestions([])
      setIsSuggesting(false)
      return
    }

    setIsSuggesting(true)

    const timer = window.setTimeout(async () => {
      const cacheKey = `${scope}:${trimmedQuery}`
      const cachedSuggestions = cacheRef.current.get(cacheKey)
      if (cachedSuggestions) {
        setSuggestions(cachedSuggestions)
        setIsSuggesting(false)
        return
      }

      const controller = new AbortController()
      controllerRef.current = controller
      setIsSuggesting(true)

      try {
        const { books } = await searchBooks(trimmedQuery, { signal: controller.signal, limit: SUGGESTION_LIMIT, page: 1, scope, fields: SUGGESTION_FIELDS, mode: 'suggestion' })
        if (!controller.signal.aborted) {
          const nextSuggestions = scope === 'author' ? uniqueAuthorSuggestions(books) : books
          cacheRef.current.set(cacheKey, nextSuggestions)
          if (cacheRef.current.size > SUGGESTION_CACHE_SIZE) {
            const oldestQuery = cacheRef.current.keys().next().value
            if (oldestQuery) cacheRef.current.delete(oldestQuery)
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

  useEffect(() => () => controllerRef.current?.abort(), [])

  return { suggestions, isSuggesting, clearSuggestions, skipNextSuggestions }
}
