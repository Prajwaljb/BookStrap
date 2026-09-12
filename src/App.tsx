import { SearchBar } from './components/SearchBar/SearchBar'
import { ResultsSection } from './components/ResultsSection/ResultsSection'
import { useBookSearchController } from './hooks/useBookSearchController'

function App() {
  const search = useBookSearchController()

  return (
    <div className="min-h-screen bg-[var(--color-white)] text-[var(--color-black)]">
      <main className="min-h-screen">
        <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-[18px] min-[701px]:px-6 min-[701px]:pt-6">
          <header className="flex items-center justify-between gap-6 border-b border-[var(--color-black)] pb-4 font-mono text-[10px] tracking-[0.08em]">
            <span>BOOKSTRAP</span>
            <span className="whitespace-nowrap">PRAJWAL JB — FERGUSON</span>
          </header>

          <section className="max-w-[720px] py-14 min-[701px]:pb-12 min-[701px]:pt-[72px]">
            <h1 className="m-0 mb-4 text-[clamp(52px,8vw,78px)] font-extrabold leading-[0.95] tracking-[-0.085em]">Find a book.</h1>
            <SearchBar
              query={search.query}
              scope={search.scope}
              hasFullText={search.hasFullText}
              suggestions={search.suggestions}
              isSuggesting={search.isSuggesting}
              onQueryChange={search.handleQueryChange}
              onScopeChange={search.handleScopeChange}
              onFullTextChange={search.handleFullTextChange}
              onSearch={search.handleSearch}
              onSuggestionSelect={search.handleSuggestionSelect}
              onClear={search.handleClear}
              onDismissSuggestions={search.clearSuggestions}
            />
          </section>

          <ResultsSection
            results={search.results}
            filters={search.filters}
            availableAuthors={search.availableAuthors}
            scope={search.scope}
            sort={search.sort}
            totalResults={search.totalResults}
            hasSearched={search.hasSearched}
            isSearching={search.isSearching}
            error={search.error}
            loadMoreError={search.loadMoreError}
            canLoadMore={search.canLoadMore}
            isLoadingMore={search.isLoadingMore}
            onRetry={search.retry}
            onFiltersChange={search.handleFiltersChange}
            onSortChange={search.handleSortChange}
            onLoadMore={search.loadMore}
          />
        </div>
      </main>
    </div>
  )
}

export default App
