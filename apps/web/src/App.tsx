import { Block, Container, Button, Title, Stack } from '@ui8kit/core'
import { ThemeProvider, useTheme, lesseUITheme } from '@ui8kit/core' // skyOSTheme, modernUITheme, lesseUITheme
import TableManager from './pages/TableManager'
import TableApp from './components/TableApp'
import { useState, useEffect } from 'react'

function AppContent() {
  const { toggleDarkMode, isDarkMode } = useTheme()
  const [currentPage, setCurrentPage] = useState<'manager' | 'table'>('manager')
  const [currentTableId, setCurrentTableId] = useState<string | undefined>()

  useEffect(() => {
    const path = window.location.pathname
    if (path.startsWith('/table/')) {
      const tableId = path.split('/')[2]
      setCurrentTableId(tableId)
      setCurrentPage('table')
    } else {
      setCurrentPage('manager')
    }

    const handlePopState = () => {
      const newPath = window.location.pathname
      if (newPath.startsWith('/table/')) {
        const tableId = newPath.split('/')[2]
        setCurrentTableId(tableId)
        setCurrentPage('table')
      } else {
        setCurrentPage('manager')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigateToManager = () => {
    window.history.pushState({}, '', '/')
    setCurrentPage('manager')
  }

  return (
    <Block variant="section" py="xl">
      <Container>
        <Stack gap="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title size="3xl">Offline CRM — Tables</Title>
            <Button variant={isDarkMode ? 'primary' : 'secondary'} onClick={toggleDarkMode}>
              {!isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </Button>
          </div>

          {currentPage === 'manager' ? (
            <TableManager />
          ) : (
            <div>
              <Button onClick={handleNavigateToManager} style={{ marginBottom: '16px' }}>
                ← Back to Tables
              </Button>
              <TableApp tableId={currentTableId} />
            </div>
          )}
        </Stack>
      </Container>
    </Block>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={lesseUITheme}>
      <AppContent />
    </ThemeProvider>
  )
}
