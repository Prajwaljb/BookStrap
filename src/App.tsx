import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ErrorState } from './components/common/ErrorState'
import { LoadingState } from './components/common/LoadingState'
import { SearchBar } from './components/SearchBar/SearchBar'
import { useBookSearch } from './hooks/useBookSearch'
import { filterBooks, getAuthors } from './utils/bookUtils'
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
                      <div className="mb-4 flex min-h-10 justify-end gap-4"><SortControl value={sort} onChange={handleSortChange} /></div>
                      {filteredBooks.length > 0 ? <BookList books={filteredBooks} /> : <div className="flex items-center justify-between gap-4 rounded-[12px] border border-black bg-white p-4" role="status"><span>No titles match these filters.</span><button type="button" className="inline-flex items-center gap-1 rounded-[8px] border border-black px-3 py-2 text-sm font-bold hover:bg-black hover:text-white" onClick={() => handleFiltersChange(EMPTY_FILTERS)}>Reset <ArrowUpRight size={14} /></button></div>}
                      {search.loadMoreError && <ErrorState message={search.loadMoreError} onRetry={() => search.loadMore()} className="mt-4" />}
                      {search.canLoadMore && <div className="mt-6 flex justify-center"><button type="button" className="rounded-[10px] border border-black px-4 py-2 font-bold hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-50" onClick={() => search.loadMore()} disabled={search.isLoadingMore}>{search.isLoadingMore ? 'Loading…' : 'Load more'}</button></div>}
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
