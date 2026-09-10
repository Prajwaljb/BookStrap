type ErrorStateProps = {
  onRetry: () => void
  message?: string
  className?: string
}
import styles from './States.module.css'

export function ErrorState({ onRetry, message = 'Something went wrong while searching.', className = '' }: ErrorStateProps) {
  return <div className={`${styles.error} ${className}`} role="alert"><span>{message}</span><button type="button" className={styles.retry} onClick={onRetry}>Try again</button></div>
}
