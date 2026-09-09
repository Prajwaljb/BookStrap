import { useMemo, useState } from 'react'
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

function App() {
  const search = useBookSearch()
  const [sort, setSort] = useState<SortOption>('relevance')
  const [filters, setFilters] = useState<BookFilters>(EMPTY_FILTERS)
  const filteredBooks = useMemo(() => sortBooks(filterBooks(search.results, filters), sort), [search.results, filters, sort])
  const authors = useMemo(() => getAuthors(search.results), [search.results])

  const handleQueryChange = (value: string) => {
    if (!value.trim()) {
      search.searchNow('')
      setFilters(EMPTY_FILTERS)
      return
    }
    search.setQuery(value)
  }

  const handleClear = () => {
    search.searchNow('')
    setFilters(EMPTY_FILTERS)
  }

  return (
    <div className="app-shell">
      <main className="tool-shell">
        <Container maxWidth="lg" className="tool-container">
          <header className="top-line"><Typography className="signature">PRAJWAL JB — FERGUSON</Typography></header>
          <section className="tool-intro">
            <Typography variant="h1">Find a book.</Typography>
            <SearchBar query={search.query} suggestions={search.suggestions} isSuggesting={search.isSuggesting} onQueryChange={handleQueryChange} onSearch={() => search.searchNow()} onSuggestionSelect={(book) => search.searchNow(book.title)} onClear={handleClear} onDismissSuggestions={search.clearSuggestions} />
          </section>

          {search.hasSearched && <section className="results-section" aria-label="Search results">
            <div className="content-heading"><Typography variant="h2">Results</Typography>{search.results.length > 0 && <Typography className="result-count">{search.results.length.toString().padStart(2, '0')} FOUND</Typography>}</div>
            <div className="section-rule" />
            {search.error && <ErrorState onRetry={() => search.searchNow()} />}
            {search.isSearching ? <LoadingState /> : search.results.length > 0 ? (
              <div className="catalog-layout">
                <FilterPanel filters={filters} authors={authors} onChange={setFilters} onClear={() => setFilters(EMPTY_FILTERS)} />
                <section className="results-column">
                  <div className="results-toolbar"><Typography variant="body2" color="text.secondary">{filteredBooks.length} of {search.results.length} titles</Typography><SortControl value={sort} onChange={setSort} /></div>
                  {filteredBooks.length > 0 ? <BookList books={filteredBooks} /> : <Alert severity="info">No titles match these filters. <Button onClick={() => setFilters(EMPTY_FILTERS)} endIcon={<ArrowUpRight size={14} />}>Reset</Button></Alert>}
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
