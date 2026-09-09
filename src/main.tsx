import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import App from './App'
import './index.css'

const theme = createTheme({
  palette: {
    primary: { main: '#000000' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#000000', secondary: '#000000' },
  },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700 } } },
    MuiAlert: { styleOverrides: { root: { color: '#000000', backgroundColor: '#ffffff', border: '1px solid #000000' }, icon: { color: '#000000' } } },
  },
})

createRoot(document.getElementById('root')!).render(<StrictMode><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></StrictMode>)
