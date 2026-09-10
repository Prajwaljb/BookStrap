import { memo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { getCoverUrl } from '../../services/openLibraryApi'
import type { Book } from '../../types/book'
import styles from './BookCard.module.css'

export const BookCard = memo(function BookCard({ book, stretch = true }: { book: Book; stretch?: boolean }) {
  const coverUrl = getCoverUrl(book.coverId)
  const [coverLoadFailed, setCoverLoadFailed] = useState(false)
  const authorLabel = book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'
  const showCover = coverUrl !== null && !coverLoadFailed

  return (
    <article className={`${styles.card} ${stretch ? '' : styles.cardCompact}`}>
      {showCover ? (
        <img loading="lazy" decoding="async" src={coverUrl} alt={`Cover of ${book.title}`} className={styles.cover} onError={() => setCoverLoadFailed(true)} />
      ) : (
        <div className={styles.noCover} aria-label="No cover available"><BookOpen size={34} /></div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>{authorLabel}</p>
        <div className={styles.meta}>
          {book.firstPublishYear ? <span className={styles.year}>{book.firstPublishYear}</span> : <span className={styles.missingYear}>Year unavailable</span>}
        </div>
      </div>
    </article>
  )
})
