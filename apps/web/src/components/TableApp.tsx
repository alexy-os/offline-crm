import React, { useEffect, useMemo, useState } from 'react'
import { Container, Stack, Button, Title, Text, Card } from '@ui8kit/core'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@ui8kit/form'
import { supabase } from '../lib/supabaseClient'

type TableSchema = {
  id?: string
  name: string
  columns: string[]
  rows: Record<string, any>[]
  updated_at?: string
}

type TableRecord = {
  id: string
  name: string
  payload: TableSchema
  updated_at: string
}

const LOCAL_STORAGE_KEY = 'offline-crm-table'

interface TableAppProps {
  tableId?: string
}

export default function TableApp({ tableId }: TableAppProps): React.ReactElement {
  const [table, setTable] = useState<TableSchema>({ name: 'Default', columns: ['A', 'B', 'C'], rows: [{ A: '', B: '', C: '' }] })
  const [loading, setLoading] = useState(!!tableId)

  useEffect(() => {
    if (tableId) {
      loadTableFromSupabase(tableId)
    } else {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (raw) {
        try {
          setTable(JSON.parse(raw) as TableSchema)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Failed to parse local table', e)
        }
      }
    }
  }, [tableId])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(table))
  }, [table])

  async function loadTableFromSupabase(id: string) {
    try {
      const { data, error } = await supabase.from('tables').select('*').eq('id', id).single()
      if (error) {
        window.alert('Load error: ' + error.message)
        return
      }
      if (data) {
        setTable((data as TableRecord).payload)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load table:', e)
    } finally {
      setLoading(false)
    }
  }

  const headerRow = useMemo(() => table.columns, [table.columns])

  function handleCellChange(rowIndex: number, colId: string, value: any): void {
    setTable((prev) => {
      const rows = [...prev.rows]
      rows[rowIndex] = { ...rows[rowIndex], [colId]: value }
      return { ...prev, rows }
    })
  }

  async function syncWithSupabase(direction: 'pull' | 'push') {
    if (!supabase) {
      window.alert('Supabase client not configured')
      return
    }

    if (direction === 'pull') {
      try {
        const { data, error } = await supabase.from('tables').select('*').eq('name', table.name).single()
        if (error) {
          window.alert('Pull error: ' + error.message)
          return
        }
        if (data) {
          setTable((data as TableRecord).payload)
          window.alert('Pulled table from Supabase')
        } else {
          window.alert('No remote table found')
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Pull failed:', e)
        window.alert('Pull failed')
      }
    } else {
      try {
        const { error } = await supabase.from('tables').update({
          payload: table,
          updated_at: new Date().toISOString()
        }).eq('name', table.name)

        if (error) {
          window.alert('Push error: ' + error.message)
          return
        }
        window.alert('Pushed table to Supabase')
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Push failed:', e)
        window.alert('Push failed')
      }
    }
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as TableSchema
        setTable(parsed)
        window.alert('Imported table JSON')
      } catch (err) {
        window.alert('Failed to parse JSON')
      }
    }
    reader.readAsText(file)
    e.currentTarget.value = ''
  }

  function handleExport(): void {
    const blob = new Blob([JSON.stringify(table, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${table.name || 'table'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <Container><Text>Loading table...</Text></Container>
  }

  return (
    <Container>
      <Stack gap="lg">
        <Card>
          <Stack gap="sm">
            <Title size="lg">{table.name}</Title>
            <Text>Columns: {table.columns.join(', ')}</Text>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button onClick={() => syncWithSupabase('pull')}>📥 Sync Pull</Button>
              <Button onClick={() => syncWithSupabase('push')}>📤 Sync Push</Button>
              <Button onClick={handleExport}>📥 Export JSON</Button>
              <label style={{ display: 'inline-block' }}>
                <input type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
                <Button>📤 Import JSON</Button>
              </label>
            </div>
          </Stack>
        </Card>

        <Table>
          <TableHeader>
            <TableRow>
              {headerRow.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.rows.map((r, ri) => (
              <TableRow key={ri}>
                {headerRow.map((col) => (
                  <TableCell key={col}>
                    <input
                      value={r[col] ?? ''}
                      onChange={(e) => handleCellChange(ri, col, e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        padding: '4px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Container>
  )
}


