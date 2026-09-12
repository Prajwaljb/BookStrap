import { useCallback, useState } from 'react'
import { useBookSearch } from './useBookSearch'
import type { Book, BookFilters, SearchScope, SortOption } from '../types/book'

export const EMPTY_FILTERS: BookFilters = { author: '', minYear: '', maxYear: '' }

function buildSearchQuery(query: string, filters: BookFilters, scope: SearchScope): string {
  const field = scope === 'author' ? 'author' : 'title'
  const escapedQuery = query.trim().replaceAll('"', '\\"')
  const terms = [`${field}:"${escapedQuery}"`]
  if (scope === 'book' && filters.author) terms.push(`author:"${filters.author.replaceAll('"', '\\"')}"`)
  if (filters.minYear || filters.maxYear) terms.push(`first_publish_year:[${filters.minYear || '*'} TO ${filters.maxYear || '*'}]`)
  return terms.join(' ')
}

export function useBookSearchController() {
  const [sort, setSort] = useState<SortOption>('relevance')
  const [hasFullText, setHasFullText] = useState(true)
  const [filters, setFilters] = useState<BookFilters>(EMPTY_FILTERS)
  const search = useBookSearch({ sort, hasFullText })
  const { hasSearched, query, scope, searchNow, setQuery, setScope } = search

  const runSearch = useCallback((value: string, options: { sort?: SortOption; hasFullText?: boolean; filters?: BookFilters } = {}) => {
    const nextFilters = options.filters ?? filters
    searchNow({
      value,
      requestQuery: buildSearchQuery(value, nextFilters, scope),
      sort: options.sort ?? sort,
      hasFullText: options.hasFullText ?? hasFullText,
    })
  }, [filters, hasFullText, scope, searchNow, sort])

  const handleQueryChange = useCallback((value: string) => {
    if (!value.trim()) {
      searchNow({ value: '' })
      setFilters(EMPTY_FILTERS)
      setHasFullText(true)
      return
    }
    if (value.trim() !== query.trim()) setFilters((current) => current.author || current.minYear || current.maxYear ? EMPTY_FILTERS : current)
    setQuery(value)
  }, [query, searchNow, setQuery])

  const handleClear = useCallback(() => {
    searchNow({ value: '' })
    setFilters(EMPTY_FILTERS)
    setHasFullText(true)
  }, [searchNow])

  const handleScopeChange = useCallback((scope: SearchScope) => {
    setScope(scope)
    setFilters(EMPTY_FILTERS)
    setHasFullText(true)
    searchNow({ value: '' })
  }, [searchNow, setScope])

  const handleFullTextChange = useCallback((nextValue: boolean) => {
    setHasFullText(nextValue)
    if (hasSearched && query.trim().length >= 2) runSearch(query, { hasFullText: nextValue })
  }, [hasSearched, query, runSearch])

  const handleFiltersChange = useCallback((nextFilters: BookFilters) => {
    setFilters(nextFilters)
    if (hasSearched && query.trim().length >= 2) runSearch(query, { filters: nextFilters })
  }, [hasSearched, query, runSearch])

  const handleSortChange = useCallback((nextSort: SortOption) => {
    setSort(nextSort)
    if (hasSearched && query.trim().length >= 2) runSearch(query, { sort: nextSort })
  }, [hasSearched, query, runSearch])

  const handleSearch = useCallback(() => runSearch(query), [query, runSearch])
  const handleSuggestionSelect = useCallback((book: Book) => {
    const value = scope === 'author' ? (book.authors[0] ?? book.title) : book.title
    setFilters(EMPTY_FILTERS)
    runSearch(value, { filters: EMPTY_FILTERS })
  }, [runSearch, scope])
  const retry = useCallback(() => runSearch(query), [query, runSearch])

  return {
    ...search,
    sort,
    filters,
    hasFullText,
    handleQueryChange,
    handleClear,
    handleScopeChange,
    handleFullTextChange,
    handleFiltersChange,
    handleSortChange,
    handleSearch,
    handleSuggestionSelect,
    retry,
  }
}