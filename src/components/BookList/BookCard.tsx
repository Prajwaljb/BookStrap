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
    <Card className="h-full overflow-hidden rounded-[14px] border border-black bg-white transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]" component="article" elevation={0}>
      {showCover ? (
        <CardMedia component="img" image={coverUrl} alt={`Cover of ${book.title}`} className="h-[205px] w-full bg-black object-cover object-[center_20%] grayscale contrast-[1.2]" onError={() => setCoverLoadFailed(true)} />
      ) : (
        <div className="grid h-[205px] place-items-center bg-black text-white" aria-label="No cover available"><BookOpen size={34} /></div>
      )}
      <CardContent className="p-3.5 last:pb-3.5">
        <Typography component="h3" className="line-clamp-2 min-h-[39px] text-[17px] font-extrabold leading-[1.15] tracking-[-.04em]">{book.title}</Typography>
        <Typography component="p" className="mt-2 truncate text-sm">{authorLabel}</Typography>
        <div className="mt-3.5 flex min-h-[22px] items-center">
          {book.firstPublishYear ? <Chip label={book.firstPublishYear} size="small" sx={{ height: 21, color: '#fff', backgroundColor: '#000', borderRadius: '6px', fontFamily: 'DM Mono, monospace', fontSize: 10 }} /> : <Typography component="span" className="text-xs">Year unavailable</Typography>}
        </div>
      </CardContent>
    </Card>
  )
}
