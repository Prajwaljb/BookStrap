import { Grid } from '@mui/material'
import type { Book } from '../../types/book'
import { BookCard } from './BookCard'

export function BookList({ books }: { books: Book[] }) {
  return (
    <Grid container spacing={{ xs: 2, sm: 2.5 }}>
      {books.map((book) => <Grid key={book.id} item xs={12} sm={6} lg={4}><BookCard book={book} /></Grid>)}
    </Grid>
  )
}
