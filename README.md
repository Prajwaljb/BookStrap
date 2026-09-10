# BookStrap

BookStrap is a focused book search tool powered by the [Open Library Search API](https://openlibrary.org/dev/docs/api/search).

Search by book title or author, browse suggestions, filter results by author and publication year, sort titles, and load more results when needed.

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL shown by Vite.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Production build

```bash
npm run build
npm run preview
```

## Stack

- React + TypeScript + Vite
- CSS Modules for component styling, with shared design tokens
- Tailwind CSS tooling available for utility layout work
- Lucide for icons
- `react-window` for long result lists

## Project structure

```text
src/
├── App.tsx                         # Page orchestration and search flow
├── main.tsx                        # React entry point
├── index.css                       # Global styles and font setup
├── components/
│   ├── BookList/                   # Book cards and virtualized results
│   ├── FilterPanel/                # Author and publication-year filters
│   ├── SearchBar/                  # Search input, scope toggle, suggestions
│   ├── SortControl/                # Result sorting control
│   └── common/                     # Loading and error states
├── hooks/
│   ├── useBookSearch.ts            # Coordinates search state and public actions
│   ├── useSuggestions.ts           # Debounced suggestions and suggestion cache
│   ├── searchResults.ts            # Pagination and server-side sort requests
│   └── searchCache.ts              # Small LRU page cache
├── services/
│   └── openLibraryApi.ts           # Open Library requests and normalization
├── types/
│   └── book.ts                     # Shared TypeScript types
└── utils/
    └── bookUtils.ts                # Filtering and author helpers
```
