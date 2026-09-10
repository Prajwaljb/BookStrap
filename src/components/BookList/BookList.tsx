import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Grid } from 'react-window'
import type { Book } from '../../types/book'
import { BookCard } from './BookCard'

const VIRTUALIZATION_THRESHOLD = 40
const VIRTUAL_ROW_HEIGHT = 370

type VirtualCellProps = {
  books: Book[]
  columnCount: number
}

type VirtualCellRenderProps = VirtualCellProps & {
  columnIndex: number
  rowIndex: number
  style: CSSProperties
}

function VirtualBookCell({ books, columnCount, columnIndex, rowIndex, style }: VirtualCellRenderProps) {
  const book = books[rowIndex * columnCount + columnIndex]
  if (!book) return null

  return <div style={{ ...style, padding: '0 12px 18px 0' }}><BookCard book={book} stretch={false} /></div>
}

function getColumnCount(width: number): number {
  if (width < 560) return 1
  if (width < 760) return 2
  return 3
}

export function BookList({ books }: { books: Book[] }) {
  const listRef = useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = useState(2)

  useEffect(() => {
    const element = listRef.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => setColumnCount(getColumnCount(entry.contentRect.width)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (books.length === 0) return null

  if (books.length < VIRTUALIZATION_THRESHOLD) {
    return <div ref={listRef} className="grid gap-4 lg:gap-5" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>{books.map((book) => <BookCard key={book.id} book={book} />)}</div>
  }

  const rowCount = Math.ceil(books.length / columnCount)
  return (
    <div ref={listRef} className="w-full" aria-label="Book results">
      <Grid<VirtualCellProps>
        columnCount={columnCount}
        columnWidth={columnCount === 1 ? '100%' : `${100 / columnCount}%`}
        defaultHeight={720}
        rowCount={rowCount}
        rowHeight={VIRTUAL_ROW_HEIGHT}
        overscanCount={2}
        cellComponent={VirtualBookCell}
        cellProps={{ books, columnCount }}
        style={{ width: '100%', height: '720px' }}
      />
    </div>
  )
}
