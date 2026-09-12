import { memo, useEffect, useRef, useState } from 'react'
import { Grid, type CellComponentProps } from 'react-window'
import type { Book } from '../../types/book'
import { BookCard } from './BookCard'

const VIRTUAL_ROW_HEIGHT = 410
const VIRTUAL_VIEWPORT_ROWS = 2
const VIRTUAL_VIEWPORT_HEIGHT = VIRTUAL_ROW_HEIGHT * VIRTUAL_VIEWPORT_ROWS

type VirtualCellProps = {
  books: Book[]
  columnCount: number
}

type VirtualCellRenderProps = CellComponentProps<VirtualCellProps>

function VirtualBookCell({ ariaAttributes, books, columnCount, columnIndex, rowIndex, style }: VirtualCellRenderProps) {
  const book = books[rowIndex * columnCount + columnIndex]
  if (!book) return null

  return <div {...ariaAttributes} style={{ ...style, padding: '0 12px 18px 0' }}><BookCard book={book} stretch={false} /></div>
}

function getColumnCount(width: number): number {
  if (width < 560) return 1
  if (width < 760) return 2
  return 3
}

export const BookList = memo(function BookList({ books }: { books: Book[] }) {
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

  const rowCount = Math.ceil(books.length / columnCount)
  return (
    <div ref={listRef} className="w-full" aria-label="Book results">
      <Grid<VirtualCellProps>
        columnCount={columnCount}
        columnWidth={columnCount === 1 ? '100%' : `${100 / columnCount}%`}
        defaultHeight={VIRTUAL_VIEWPORT_HEIGHT}
        rowCount={rowCount}
        rowHeight={VIRTUAL_ROW_HEIGHT}
        overscanCount={2}
        cellComponent={VirtualBookCell}
        cellProps={{ books, columnCount }}
        style={{ width: '100%', height: `${VIRTUAL_VIEWPORT_HEIGHT}px` }}
      />
    </div>
  )
})
