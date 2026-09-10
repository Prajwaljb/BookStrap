# BookStrap

BookStrap is a focused book search tool powered by the [Open Library Search API](https://openlibrary.org/dev/docs/api/search).

Search by book title or author, browse suggestions, filter results by author and publication year, sort titles, and load more results when needed.

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL shown by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Stack

- React + TypeScript + Vite
- Tailwind CSS for layout and styling
- Lucide for icons
- `react-window` for long result lists

## Project structure

```text
src/
├── App.tsx                         # Page orchestration and search flow
├── main.tsx                        # React entry point
├── index.css                       # Global styles and Tailwind setup
├── components/
│   ├── BookList/                   # Book cards and virtualized results
│   ├── FilterPanel/                # Author and publication-year filters
│   ├── SearchBar/                  # Search input, scope toggle, suggestions
│   ├── SortControl/                # Result sorting control
│   └── common/                     # Loading and error states
├── hooks/
│   └── useBookSearch.ts            # Search state, caching, cancellation, pagination
├── services/
│   └── openLibraryApi.ts           # Open Library requests and normalization
├── types/
│   └── book.ts                     # Shared TypeScript types
└── utils/
    └── bookUtils.ts                # Filtering, sorting, and author helpers
```
