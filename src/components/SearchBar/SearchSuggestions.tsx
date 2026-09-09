import { CircularProgress, List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material'
import type { Book } from '../../types/book'

type SearchSuggestionsProps = {
  suggestions: Book[]
  loading: boolean
  onSelect: (book: Book) => void
}

export function SearchSuggestions({ suggestions, loading, onSelect }: SearchSuggestionsProps) {
  if (!loading && suggestions.length === 0) return null

  return (
    <Paper className="suggestions-popover" elevation={0} component="div">
      {loading ? (
        <div className="suggestions-loading"><CircularProgress size={18} /><Typography variant="body2">Finding books…</Typography></div>
      ) : (
        <List disablePadding>
          {suggestions.map((book) => (
            <ListItemButton key={book.id} onClick={() => onSelect(book)}>
              <ListItemText
                primary={book.title}
                secondary={book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'}
                primaryTypographyProps={{ noWrap: true, fontWeight: 600 }}
                secondaryTypographyProps={{ noWrap: true }}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  )
}
