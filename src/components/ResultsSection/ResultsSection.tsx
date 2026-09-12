import { lazy, Suspense, useMemo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ErrorState } from '../common/ErrorState'
import { LoadingState } from '../common/LoadingState'
import { Button } from '../common/Button'
import { EMPTY_FILTERS } from '../../hooks/useBookSearchController'
import { filterBooks, getAuthors } from '../../utils/bookUtils'
import type { Book, BookFilters, SearchScope, SortOption } from '../../types/book'

const FilterPanel = lazy(() => import('../FilterPanel/FilterPanel').then(({ FilterPanel }) => ({ default: FilterPanel })))
const SortControl = lazy(() => import('../SortControl/SortControl').then(({ SortControl }) => ({ default: SortControl })))
const BookList = lazy(() => import('../BookList/BookList').then(({ BookList }) => ({ default: BookList })))

const formatCount = (value: number) => new Intl.NumberFormat('en-US').format(value)

type ResultsSectionProps = {
  results: Book[]
  filters: BookFilters
  availableAuthors: string[]
  scope: SearchScope
  sort: SortOption
  totalResults: number
  hasSearched: boolean
  isSearching: boolean
  error: string | null
  loadMoreError: string | null
  canLoadMore: boolean
  isLoadingMore: boolean
  onRetry: () => void
  onFiltersChange: (filters: BookFilters) => void
  onSortChange: (sort: SortOption) => void
  onLoadMore: () => void
}

export function ResultsSection({
  results,
  filters,
  availableAuthors,
  scope,
  sort,
  totalResults,
  hasSearched,
  isSearching,
  error,
  loadMoreError,
  canLoadMore,
  isLoadingMore,
  onRetry,
  onFiltersChange,
  onSortChange,
  onLoadMore,
}: ResultsSectionProps) {
  const filteredBooks = useMemo(() => filterBooks(results, filters), [results, filters])
  const currentAuthors = useMemo(() => getAuthors(results), [results])
  const authors = useMemo(() => Array.from(new Set([...availableAuthors, ...currentAuthors])).sort((a, b) => a.localeCompare(b)), [availableAuthors, currentAuthors])
  const hasActiveFilters = Boolean((scope === 'book' && filters.author) || filters.minYear || filters.maxYear)
  const resultCount = totalResults > results.length
    ? `${formatCount(results.length)} LOADED / ${formatCount(totalResults)} TOTAL`
    : `${formatCount(results.length)} LOADED`

  if (!hasSearched) return null

  return (
    <section className="pt-1" aria-label="Search results">
      <div className="flex items-end justify-between gap-5">
        <h2 className="m-0 text-2xl font-extrabold leading-none tracking-[-0.06em]">Results</h2>
        {results.length > 0 && <span className="mb-0.5 font-mono text-[10px] tracking-[0.08em]">{resultCount}</span>}
      </div>
      <div className="my-[19px] h-px bg-[var(--color-black)]" />

      {error && <ErrorState onRetry={onRetry} />}
      {isSearching ? <LoadingState /> : results.length > 0 || hasActiveFilters ? (
        <Suspense fallback={<LoadingState />}>
          <div className="grid items-start gap-[26px] min-[701px]:grid-cols-[205px_minmax(0,1fr)]">
            <FilterPanel filters={filters} authors={authors} showAuthorFilter={scope === 'book'} onApply={onFiltersChange} onClear={() => onFiltersChange(EMPTY_FILTERS)} />
            <section className="min-w-0">
              <div className="mb-4 flex min-h-10 justify-end gap-4">
                <SortControl value={sort} onChange={onSortChange} />
              </div>
              {filteredBooks.length > 0 ? <BookList books={filteredBooks} /> : (
                <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-black)] p-4" role="status">
                  <span>No titles match these filters.</span>
                  <Button type="button" onClick={() => onFiltersChange(EMPTY_FILTERS)}>Reset <ArrowUpRight size={14} /></Button>
                </div>
              )}
              {loadMoreError && <div className="mt-4"><ErrorState message={loadMoreError} onRetry={onLoadMore} /></div>}
              {canLoadMore && <div className="mt-6 flex justify-center"><Button type="button" onClick={onLoadMore} disabled={isLoadingMore}>{isLoadingMore ? 'Loading...' : 'Load more'}</Button></div>}
            </section>
          </div>
        </Suspense>
      ) : !error ? <p className="py-6 font-semibold">No books found.</p> : null}
    </section>
  )
}
