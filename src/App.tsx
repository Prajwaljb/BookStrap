import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { ArrowUpRight } from 'lucide-react'
import { ErrorState } from './components/common/ErrorState'
import { LoadingState } from './components/common/LoadingState'
import { SearchBar } from './components/SearchBar/SearchBar'
import { useBookSearch } from './hooks/useBookSearch'
import { filterBooks, getAuthors, sortBooks } from './utils/bookUtils'
import type { BookFilters, SearchScope, SortOption } from './types/book'

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
  const search = useBookSearch()
  const [sort, setSort] = useState<SortOption>('relevance')
  const [filters, setFilters] = useState<BookFilters>(EMPTY_FILTERS)
  const [authorOptions, setAuthorOptions] = useState<string[]>([])
  const filterRequestTimerRef = useRef<number | null>(null)
  const filteredBooks = useMemo(() => sortBooks(filterBooks(search.results, filters), sort), [search.results, filters, sort])
  const currentAuthors = useMemo(() => getAuthors(search.results), [search.results])
  const hasActiveFilters = Boolean((search.scope === 'book' && filters.author) || filters.minYear || filters.maxYear)
  const resultCount = search.totalResults > search.results.length
    ? `${formatCount(search.results.length)} LOADED / ${formatCount(search.totalResults)} TOTAL`
    : `${formatCount(search.results.length)} LOADED`

  useEffect(() => () => {
    if (filterRequestTimerRef.current !== null) window.clearTimeout(filterRequestTimerRef.current)
  }, [])

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
      if (filterRequestTimerRef.current !== null) window.clearTimeout(filterRequestTimerRef.current)
    }
    search.setQuery(value)
  }

  const handleClear = () => {
    search.searchNow('')
    setFilters(EMPTY_FILTERS)
  }

  const handleScopeChange = (scope: SearchScope) => {
    if (filterRequestTimerRef.current !== null) window.clearTimeout(filterRequestTimerRef.current)
    search.setScope(scope)
    setFilters(EMPTY_FILTERS)
    search.searchNow('')
  }

  const handleFiltersChange = (nextFilters: BookFilters) => {
    setFilters(nextFilters)
    if (filterRequestTimerRef.current !== null) window.clearTimeout(filterRequestTimerRef.current)
    if (!search.hasSearched || search.query.trim().length < 2) return

    filterRequestTimerRef.current = window.setTimeout(() => {
      search.searchNow(search.query, buildSearchQuery(search.query, nextFilters, search.scope))
    }, 260)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="min-h-screen">
        <div className="mx-auto max-w-[1200px] px-6 pb-10 pt-6 max-[900px]:px-6 max-[700px]:px-5 max-[700px]:pt-[18px]">
          <header className="flex items-center justify-between gap-6 border-b border-black pb-4 font-mono text-[10px] tracking-[.08em]">
            <span>BOOKSTRAP</span>
            <span className="whitespace-nowrap">PRAJWAL JB — FERGUSON</span>
          </header>

          <section className="max-w-[720px] pb-12 pt-[72px] max-[700px]:pb-10 max-[700px]:pt-14">
            <h1 className="mb-4 text-[clamp(52px,8vw,78px)] font-extrabold leading-[.95] tracking-[-.085em]">Find a book.</h1>
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
            <section className="pt-1" aria-label="Search results">
              <div className="flex items-end justify-between gap-5">
                <h2 className="m-0 text-2xl font-extrabold leading-none tracking-[-.06em]">Results</h2>
                {search.results.length > 0 && <span className="mb-0.5 font-mono text-[10px] tracking-[.08em]">{resultCount}</span>}
              </div>
              <div className="my-[19px] h-px bg-black" />

              {search.error && <ErrorState onRetry={() => search.searchNow(search.query, buildSearchQuery(search.query, filters, search.scope))} />}
              {search.isSearching ? <LoadingState /> : search.results.length > 0 ? (
                <Suspense fallback={<LoadingState />}>
                  <div className="grid grid-cols-[205px_minmax(0,1fr)] items-start gap-[26px] max-[700px]:grid-cols-1 max-[700px]:gap-[18px]">
                    <FilterPanel filters={filters} authors={authorOptions} showAuthorFilter={search.scope === 'book'} onApply={handleFiltersChange} onClear={() => handleFiltersChange(EMPTY_FILTERS)} />
                    <section className="min-w-0">
                      <div className="mb-4 flex min-h-10 justify-end gap-4"><SortControl value={sort} onChange={setSort} /></div>
                      {filteredBooks.length > 0 ? <BookList books={filteredBooks} /> : <Alert severity="info" action={<Button color="inherit" onClick={() => handleFiltersChange(EMPTY_FILTERS)} endIcon={<ArrowUpRight size={14} />}>Reset</Button>}>No titles match these filters.</Alert>}
                      {search.loadMoreError && <ErrorState message={search.loadMoreError} onRetry={() => search.loadMore()} className="mt-4" />}
                      {search.canLoadMore && <div className="mt-6 flex justify-center"><Button variant="outlined" onClick={() => search.loadMore()} disabled={search.isLoadingMore} sx={{ color: '#000', borderColor: '#000', borderRadius: '10px', '&:hover': { color: '#fff', backgroundColor: '#000', borderColor: '#000' } }}>{search.isLoadingMore ? 'Loading…' : 'Load more'}</Button></div>}
                    </section>
                  </div>
                </Suspense>
              ) : !search.error ? <p className="py-6 font-semibold">No books found.</p> : null}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
