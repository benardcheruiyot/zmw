import './App.css'
import ApplicationPage from './pages/ApplicationPage'
import ListPage from './pages/ListPage'

function App() {
  const pathname = window.location.pathname

  if (pathname === '/list') {
    return <ListPage />
  }

  return <ApplicationPage />
}

export default App
