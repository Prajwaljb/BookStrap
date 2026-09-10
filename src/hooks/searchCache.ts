import type { BookSearchPage } from '../services/openLibraryApi'

export const SEARCH_CACHE_SIZE = 12

export function readCachedPage(cache: Map<string, BookSearchPage>, key: string): BookSearchPage | undefined {
  const cachedPage = cache.get(key)
  if (!cachedPage) return undefined
  cache.delete(key)
  cache.set(key, cachedPage)
  return cachedPage
}

export function writeCachedPage(cache: Map<string, BookSearchPage>, key: string, page: BookSearchPage): void {
  cache.delete(key)
  cache.set(key, page)
  if (cache.size > SEARCH_CACHE_SIZE) cache.delete(cache.keys().next().value ?? '')
}
