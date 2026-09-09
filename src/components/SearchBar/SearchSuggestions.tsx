import CircularProgress from '@mui/material/CircularProgress'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import type { Book, SearchScope } from '../../types/book'

type SearchSuggestionsProps = {
  suggestions: Book[]
  loading: boolean
  scope: SearchScope
  activeIndex: number
  onActiveChange: (index: number) => void
  onSelect: (book: Book) => void
}

export function SearchSuggestions({ suggestions, loading, scope, activeIndex, onActiveChange, onSelect }: SearchSuggestionsProps) {
  if (!loading && suggestions.length === 0) return null

  return (
    <Paper className="absolute left-0 right-0 top-[68px] z-10 overflow-hidden rounded-[14px] border border-black shadow-[4px_4px_0_#000]" elevation={0} component="div" role="listbox" aria-label={scope === 'author' ? 'Author suggestions' : 'Book suggestions'}>
      {loading ? (
        <div className="flex items-center gap-2 p-4"><CircularProgress size={17} color="inherit" /><Typography variant="body2">Finding {scope === 'author' ? 'authors' : 'books'}…</Typography></div>
      ) : (
        <List disablePadding>
          {suggestions.map((book, index) => (
            <ListItemButton key={book.id} selected={index === activeIndex} onMouseEnter={() => onActiveChange(index)} onClick={() => onSelect(book)} role="option" aria-selected={index === activeIndex} sx={{ py: 1.25, px: 2, '&.Mui-selected, &:hover': { color: '#fff', backgroundColor: '#000' } }}>
              <ListItemText primary={scope === 'author' ? (book.authors[0] ?? book.title) : book.title} secondary={scope === 'author' ? undefined : (book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author')} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  )
}
