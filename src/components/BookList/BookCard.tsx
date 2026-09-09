import { useState } from 'react'
import { Card, CardContent, CardMedia, Chip, Typography } from '@mui/material'
import { BookOpen } from 'lucide-react'
import { getCoverUrl } from '../../services/openLibraryApi'
import type { Book } from '../../types/book'

export function BookCard({ book }: { book: Book }) {
  const coverUrl = getCoverUrl(book.coverId)
  const [coverLoadFailed, setCoverLoadFailed] = useState(false)
  const authorLabel = book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'
  const showCover = coverUrl !== null && !coverLoadFailed

  return (
    <Card className="book-card" component="article" elevation={0}>
      {showCover ? (
        <CardMedia component="img" image={coverUrl} alt={`Cover of ${book.title}`} className="book-cover" onError={() => setCoverLoadFailed(true)} />
      ) : (
        <div className="book-cover book-cover-placeholder" aria-label="No cover available"><BookOpen size={34} /></div>
      )}
      <CardContent className="book-card-content">
        <Typography variant="h3" className="book-title">{book.title}</Typography>
        <Typography variant="body2" className="book-author">{authorLabel}</Typography>
        <div className="book-meta">
          {book.firstPublishYear ? <Chip label={book.firstPublishYear} size="small" className="year-chip" /> : <Typography variant="caption" color="text.secondary">Year unavailable</Typography>}
        </div>
      </CardContent>
    </Card>
  )
}
