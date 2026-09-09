export type Book = {
  id: string
  title: string
  authors: string[]
  firstPublishYear: number | null
  coverId: number | null
}

export type SortOption = 'relevance' | 'title-asc' | 'title-desc'
export type SearchScope = 'book' | 'author'

export type BookFilters = {
  author: string
  minYear: string
  maxYear: string
}
