import { LoaderCircle } from 'lucide-react'
import styles from './States.module.css'

export function LoadingState() {
  return <div className={styles.loading} role="status"><LoaderCircle size={24} className={styles.spinner} />Loading…</div>
}
