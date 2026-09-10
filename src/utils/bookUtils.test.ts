import { describe, expect, it } from 'vitest'
import { filterBooks, getAuthors } from './bookUtils'
import type { Book } from '../types/book'

const books: Book[] = [
  { id: '1', title: 'First', authors: ['J. K. Rowling'], firstPublishYear: 1997, coverId: null },
  { id: '2', title: 'Second', authors: ['J. K. Rowling', 'Editor'], firstPublishYear: 2001, coverId: null },
  { id: '3', title: 'Third', authors: ['Other Author'], firstPublishYear: null, coverId: null },
]

describe('filterBooks', () => {
  it('filters by exact author', () => {
    expect(filterBooks(books, { author: 'J. K. Rowling', minYear: '', maxYear: '' })).toHaveLength(2)
  })

  it('excludes books without years when a year filter is active', () => {
    expect(filterBooks(books, { author: '', minYear: '2000', maxYear: '' }).map((book) => book.id)).toEqual(['2'])
  })

  it('supports inclusive year ranges', () => {
    expect(filterBooks(books, { author: '', minYear: '1997', maxYear: '2001' })).toHaveLength(2)
  })
})

describe('getAuthors', () => {
  it('returns unique authors in alphabetical order', () => {
    expect(getAuthors(books)).toEqual(['Editor', 'J. K. Rowling', 'Other Author'])
  })
})
