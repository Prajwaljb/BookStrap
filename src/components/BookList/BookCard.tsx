import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { getCoverUrl } from '../../services/openLibraryApi'
import type { Book } from '../../types/book'

export function BookCard({ book, stretch = true }: { book: Book; stretch?: boolean }) {
  const coverUrl = getCoverUrl(book.coverId)
  const [coverLoadFailed, setCoverLoadFailed] = useState(false)
  const authorLabel = book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'
  const showCover = coverUrl !== null && !coverLoadFailed

  return (
    <article className={`${stretch ? 'h-full' : ''} overflow-hidden rounded-[14px] border border-black bg-white [contain-intrinsic-size:420px] [content-visibility:auto] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]`}>
      {showCover ? (
        <img loading="lazy" decoding="async" src={coverUrl} alt={`Cover of ${book.title}`} className="h-[205px] w-full bg-black object-cover object-[center_20%] grayscale contrast-[1.2]" onError={() => setCoverLoadFailed(true)} />
      ) : (
        <div className="grid h-[205px] place-items-center bg-black text-white" aria-label="No cover available"><BookOpen size={34} /></div>
      )}
      <div className="p-3.5">
        <h3 className="line-clamp-2 min-h-[39px] text-[17px] font-extrabold leading-[1.15] tracking-[-.04em]">{book.title}</h3>
        <p className="mt-2 truncate text-sm">{authorLabel}</p>
        <div className="mt-3.5 flex min-h-[22px] items-center">
          {book.firstPublishYear ? <span className="inline-flex h-[21px] items-center rounded-[6px] bg-black px-2 font-mono text-[10px] text-white">{book.firstPublishYear}</span> : <span className="text-xs">Year unavailable</span>}
        </div>
      </div>
    </article>
  )
}
