import { DashLayout } from '@ui8kit/core'
import { ThemeProvider, lesseUITheme } from '@ui8kit/core'
import { useTheme } from '@ui8kit/core'
import { useEffect, useState } from 'react'
import Welcome from '../routes/Welcome'
import GetTable from '../routes/GetTable'

function RouterView() {
  const [route, setRoute] = useState<'welcome' | 'get-table'>(() => {
    const path = window.location.pathname
    if (path.startsWith('/get-table')) return 'get-table'
    return 'welcome'
  })

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname
      setRoute(path.startsWith('/get-table') ? 'get-table' : 'welcome')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const Page = route === 'get-table' ? GetTable : Welcome
  return <Page />
}

function AppShell() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  return (
    <DashLayout
      navbarProps={{ brand: 'Maker', isDarkMode, toggleDarkMode }}
      sidebar={null}
    >
      <RouterView />
    </DashLayout>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={lesseUITheme}>
      <AppShell />
    </ThemeProvider>
  )
}


