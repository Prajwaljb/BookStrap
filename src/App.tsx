import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ErrorState } from './components/common/ErrorState'
import { LoadingState } from './components/common/LoadingState'
import { SearchBar } from './components/SearchBar/SearchBar'
import { useBookSearch } from './hooks/useBookSearch'
import { filterBooks, getAuthors } from './utils/bookUtils'
import type { BookFilters, SearchScope, SortOption } from './types/book'
import styles from './styles/layout.module.css'

const FilterPanel = lazy(() => import('./components/FilterPanel/FilterPanel').then(({ FilterPanel }) => ({ default: FilterPanel })))
const SortControl = lazy(() => import('./components/SortControl/SortControl').then(({ SortControl }) => ({ default: SortControl })))
const BookList = lazy(() => import('./components/BookList/BookList').then(({ BookList }) => ({ default: BookList })))

const EMPTY_FILTERS: BookFilters = { author: '', minYear: '', maxYear: '' }
const formatCount = (value: number) => new Intl.NumberFormat('en-US').format(value)

function buildSearchQuery(query: string, filters: BookFilters, scope: SearchScope): string {
  const field = scope === 'author' ? 'author' : 'title'
  const escapedQuery = query.trim().replaceAll('"', '\\"')
  const terms = [`${field}:"${escapedQuery}"`]
  if (scope === 'book' && filters.author) terms.push(`author:"${filters.author.replaceAll('"', '\\"')}"`)
  if (filters.minYear || filters.maxYear) terms.push(`first_publish_year:[${filters.minYear || '*'} TO ${filters.maxYear || '*'}]`)
  return terms.filter(Boolean).join(' ')
}

function App() {
  const [sort, setSort] = useState<SortOption>('relevance')
  const search = useBookSearch(sort)
  const [filters, setFilters] = useState<BookFilters>(EMPTY_FILTERS)
  const [authorOptions, setAuthorOptions] = useState<string[]>([])
  const filteredBooks = useMemo(() => filterBooks(search.results, filters), [search.results, filters])
  const currentAuthors = useMemo(() => getAuthors(search.results), [search.results])
  const hasActiveFilters = Boolean((search.scope === 'book' && filters.author) || filters.minYear || filters.maxYear)
  const resultCount = search.totalResults > search.results.length
    ? `${formatCount(search.results.length)} LOADED / ${formatCount(search.totalResults)} TOTAL`
    : `${formatCount(search.results.length)} LOADED`

  useEffect(() => {
    if (!filters.author && !search.isSearching) setAuthorOptions(currentAuthors)
  }, [currentAuthors, filters.author, search.isSearching])

  const handleQueryChange = (value: string) => {
    if (!value.trim()) {
      search.searchNow('')
      setFilters(EMPTY_FILTERS)
      return
    }
    if (value.trim() !== search.query.trim() && hasActiveFilters) {
      setFilters(EMPTY_FILTERS)
    }
    search.setQuery(value)
  }

  const handleClear = () => {
    search.searchNow('')
    setFilters(EMPTY_FILTERS)
  }

  const handleScopeChange = (scope: SearchScope) => {
    search.setScope(scope)
    setFilters(EMPTY_FILTERS)
    search.searchNow('')
  }

  const handleFiltersChange = (nextFilters: BookFilters) => {
    setFilters(nextFilters)
    if (!search.hasSearched || search.query.trim().length < 2) return
    search.searchNow(search.query, buildSearchQuery(search.query, nextFilters, search.scope))
  }

  const handleSortChange = (nextSort: SortOption) => {
    setSort(nextSort)
    if (search.hasSearched && search.query.trim().length >= 2) {
      search.searchNow(search.query, buildSearchQuery(search.query, filters, search.scope), nextSort)
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span>BOOKSTRAP</span>
            <span className={styles.name}>PRAJWAL JB — FERGUSON</span>
          </header>

          <section className={styles.hero}>
            <h1 className={styles.title}>Find a book.</h1>
            <SearchBar
              query={search.query}
              scope={search.scope}
              suggestions={search.suggestions}
              isSuggesting={search.isSuggesting}
              onQueryChange={handleQueryChange}
              onScopeChange={handleScopeChange}
              onSearch={() => search.searchNow(search.query, buildSearchQuery(search.query, filters, search.scope))}
              onSuggestionSelect={(book) => { const value = search.scope === 'author' ? (book.authors[0] ?? book.title) : book.title; setFilters(EMPTY_FILTERS); search.searchNow(value, buildSearchQuery(value, EMPTY_FILTERS, search.scope)) }}
              onClear={handleClear}
              onDismissSuggestions={search.clearSuggestions}
            />
          </section>

          {search.hasSearched && (
            <section className={styles.results} aria-label="Search results">
              <div className={styles.resultsHeading}>
                <h2 className={styles.resultsTitle}>Results</h2>
                {search.results.length > 0 && <span className={styles.resultCount}>{resultCount}</span>}
              </div>
              <div className={styles.rule} />

              {search.error && <ErrorState onRetry={() => search.searchNow(search.query, buildSearchQuery(search.query, filters, search.scope))} />}
              {search.isSearching ? <LoadingState /> : search.results.length > 0 ? (
                <Suspense fallback={<LoadingState />}>
                  <div className={styles.resultsLayout}>
                    <FilterPanel filters={filters} authors={authorOptions} showAuthorFilter={search.scope === 'book'} onApply={handleFiltersChange} onClear={() => handleFiltersChange(EMPTY_FILTERS)} />
                    <section className={styles.resultsContent}>
                      <div className={styles.sortRow}><SortControl value={sort} onChange={handleSortChange} /></div>
                      {filteredBooks.length > 0 ? <BookList books={filteredBooks} /> : <div className={styles.empty} role="status"><span>No titles match these filters.</span><button type="button" className={styles.button} onClick={() => handleFiltersChange(EMPTY_FILTERS)}>Reset <ArrowUpRight size={14} /></button></div>}
                      {search.loadMoreError && <div className={styles.loadMoreError}><ErrorState message={search.loadMoreError} onRetry={() => search.loadMore()} /></div>}
                      {search.canLoadMore && <div className={styles.loadMoreRow}><button type="button" className={styles.loadMore} onClick={() => search.loadMore()} disabled={search.isLoadingMore}>{search.isLoadingMore ? 'Loading…' : 'Load more'}</button></div>}
                    </section>
                  </div>
                </Suspense>
              ) : !search.error ? <p className={styles.noBooks}>No books found.</p> : null}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
