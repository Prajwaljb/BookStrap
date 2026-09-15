import { describe, expect, it } from 'vitest'
import { shouldAutoSearchOnScopeChange } from './useBookSearchController'

describe('shouldAutoSearchOnScopeChange', () => {
  it('does not trigger a search before the user has pressed search', () => {
    expect(shouldAutoSearchOnScopeChange({
      hasSearched: false,
      query: 'harry',
      currentScope: 'book',
      nextScope: 'author',
    })).toBe(false)
  })

  it('only auto-runs when a real search already exists', () => {
    expect(shouldAutoSearchOnScopeChange({
      hasSearched: true,
      query: 'harry',
      currentScope: 'book',
      nextScope: 'author',
    })).toBe(true)
  })

  it('ignores short queries even after a prior search', () => {
    expect(shouldAutoSearchOnScopeChange({
      hasSearched: true,
      query: 'h',
      currentScope: 'book',
      nextScope: 'author',
    })).toBe(false)
  })
})
