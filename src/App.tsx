import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Button, Container, Typography } from '@mui/material'
import { ArrowUpRight } from 'lucide-react'
import { BookList } from './components/BookList/BookList'
import { ErrorState } from './components/common/ErrorState'
import { LoadingState } from './components/common/LoadingState'
import { FilterPanel } from './components/FilterPanel/FilterPanel'
import { SearchBar } from './components/SearchBar/SearchBar'
import { SortControl } from './components/SortControl/SortControl'
import { useBookSearch } from './hooks/useBookSearch'
import { filterBooks, getAuthors, sortBooks } from './utils/bookUtils'
import type { BookFilters, SortOption } from './types/book'

const EMPTY_FILTERS: BookFilters = { author: '', minYear: '', maxYear: '' }
const formatCount = (value: number) => new Intl.NumberFormat('en-US').format(value)

function buildFilteredQuery(query: string, filters: BookFilters): string {
  const terms = [query.trim()]
  if (filters.author) terms.push(`author:"${filters.author.replaceAll('"', '\\"')}"`)
  if (filters.minYear || filters.maxYear) terms.push(`first_publish_year:[${filters.minYear || '*'} TO ${filters.maxYear || '*'}]`)
  return terms.filter(Boolean).join(' ')
}

function App() {
  const search = useBookSearch()
  const [sort, setSort] = useState<SortOption>('relevance')
  const [filters, setFilters] = useState<BookFilters>(EMPTY_FILTERS)
  const filterRequestTimerRef = useRef<number | null>(null)
  const filteredBooks = useMemo(() => sortBooks(filterBooks(search.results, filters), sort), [search.results, filters, sort])
  const authors = useMemo(() => getAuthors(search.results), [search.results])
  const hasActiveFilters = Boolean(filters.author || filters.minYear || filters.maxYear)
  const resultCount = search.totalResults > search.results.length
    ? `${formatCount(search.results.length)} LOADED / ${formatCount(search.totalResults)} TOTAL`
    : `${formatCount(search.results.length)} LOADED`

  const handleQueryChange = (value: string) => {
    if (!value.trim()) {
      search.searchNow('')
      setFilters(EMPTY_FILTERS)
      return
    }
    if (value.trim() !== search.query.trim() && hasActiveFilters) {
      setFilters(EMPTY_FILTERS)
      if (filterRequestTimerRef.current !== null) window.clearTimeout(filterRequestTimerRef.current)
    }
    search.setQuery(value)
  }

  const handleClear = () => {
    search.searchNow('')
    setFilters(EMPTY_FILTERS)
  }

  const handleFiltersChange = (nextFilters: BookFilters) => {
    setFilters(nextFilters)
    if (filterRequestTimerRef.current !== null) window.clearTimeout(filterRequestTimerRef.current)
    if (!search.hasSearched || search.query.trim().length < 2) return

    filterRequestTimerRef.current = window.setTimeout(() => {
      search.searchNow(search.query, buildFilteredQuery(search.query, nextFilters))
    }, 260)
  }

  useEffect(() => () => {
    if (filterRequestTimerRef.current !== null) window.clearTimeout(filterRequestTimerRef.current)
  }, [])

  return (
    <div className="app-shell">
      <main className="tool-shell">
        <Container maxWidth="lg" className="tool-container">
          <header className="top-line"><Typography className="brand-name">BOOKSTRAP</Typography><Typography className="signature">PRAJWAL JB — FERGUSON</Typography></header>
          <section className="tool-intro">
            <Typography variant="h1">Find a book.</Typography>
            <SearchBar query={search.query} suggestions={search.suggestions} isSuggesting={search.isSuggesting} onQueryChange={handleQueryChange} onSearch={() => search.searchNow()} onSuggestionSelect={(book) => { setFilters(EMPTY_FILTERS); search.searchNow(book.title) }} onClear={handleClear} onDismissSuggestions={search.clearSuggestions} />
          </section>

          {search.hasSearched && <section className="results-section" aria-label="Search results">
            <div className="content-heading"><Typography variant="h2">Results</Typography>{search.results.length > 0 && <Typography className="result-count">{resultCount}</Typography>}</div>
            <div className="section-rule" />
            {search.error && <ErrorState onRetry={() => search.searchNow()} />}
            {search.isSearching ? <LoadingState /> : search.results.length > 0 ? (
              <div className="catalog-layout">
                <FilterPanel filters={filters} authors={authors} onApply={handleFiltersChange} onClear={() => handleFiltersChange(EMPTY_FILTERS)} />
                <section className="results-column">
                  <div className="results-toolbar"><SortControl value={sort} onChange={setSort} /></div>
                  {filteredBooks.length > 0 ? <BookList books={filteredBooks} /> : <Alert severity="info">No titles match these filters. <Button onClick={() => setFilters(EMPTY_FILTERS)} endIcon={<ArrowUpRight size={14} />}>Reset</Button></Alert>}
                  {search.loadMoreError && <Alert severity="error" className="load-more-error">{search.loadMoreError} <Button onClick={() => search.loadMore()}>Try again</Button></Alert>}
                  {search.canLoadMore && <div className="load-more-row"><Button variant="outlined" onClick={() => search.loadMore()} disabled={search.isLoadingMore}>{search.isLoadingMore ? 'Loading…' : 'Load more'}</Button></div>}
                </section>
              </div>
            ) : !search.error ? <Typography className="no-results">No books found.</Typography> : null}
          </section>}

        </Container>
      </main>
    </div>
  )
}

export default App
