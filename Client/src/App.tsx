import './index.css'
import Login from './views/Login'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from './components/mode-toggle'
  
function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <ModeToggle />
        <Login />
      </Router>
  </ThemeProvider>
  )
}

export default App
