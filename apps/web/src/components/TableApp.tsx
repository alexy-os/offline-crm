import React, { useEffect, useMemo, useState } from 'react'
import { Container, Box, Stack, Button, Title, Text, Card } from '@ui8kit/core'
import { Label, Input } from '@ui8kit/form'
import { supabase, checkTablesSchema } from '../lib/supabaseClient'
import { SupabaseCellsRepository, SupabaseColumnsRepository, SupabaseGridQueryService, SupabaseRowsRepository, SupabaseTablesRepository } from '@/infrastructure/supabase/SupabaseRepositories'
import { LoadGridUseCase, UpdateCellUseCase } from '@/application/usecases'
import { TableGrid } from '@/ui/TableGrid'

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

  // Clean architecture services for normalized schema
  const tablesRepo = useMemo(() => new SupabaseTablesRepository(), [])
  const columnsRepo = useMemo(() => new SupabaseColumnsRepository(), [])
  const rowsRepo = useMemo(() => new SupabaseRowsRepository(), [])
  const cellsRepo = useMemo(() => new SupabaseCellsRepository(), [])
  const gridService = useMemo(() => new SupabaseGridQueryService(tablesRepo, columnsRepo, rowsRepo, cellsRepo), [tablesRepo, columnsRepo, rowsRepo, cellsRepo])
  const loadGrid = useMemo(() => new LoadGridUseCase(gridService), [gridService])
  const updateCell = useMemo(() => new UpdateCellUseCase(cellsRepo), [cellsRepo])

  const [grid, setGrid] = useState<any | null>(null)

  useEffect(() => {
    async function fetchGrid() {
      if (!tableId) return
      try {
        const g = await loadGrid.execute(tableId, { limit: 500, offset: 0 })
        setGrid(g)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Grid load failed', e)
      }
    }
    fetchGrid()
  }, [tableId, loadGrid])

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

    const schemaState = await checkTablesSchema()
    if (schemaState === 'missing') {
      window.alert('Supabase schema is missing. Open Table Manager to copy SQL and initialize.')
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
        // Upsert by name to allow first-time creation via editor as well
        const { error } = await supabase.from('tables').upsert({
          name: table.name,
          payload: table,
          updated_at: new Date().toISOString()
        }, { onConflict: 'name' })

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
            <Box display="flex" gap={8} wrap="wrap">
              <Button onClick={() => syncWithSupabase('pull')}>📥 Sync Pull</Button>
              <Button onClick={() => syncWithSupabase('push')}>📤 Sync Push</Button>
              <Button onClick={handleExport}>📥 Export JSON</Button>
              <Label style={{ display: 'inline-block' }}>
                <Input type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
                <Button>📤 Import JSON</Button>
              </Label>
            </Box>
          </Stack>
        </Card>

        {grid && (
          <TableGrid
            data={grid}
            onCellChange={async ({ rowId, columnKey, value }) => {
              const colId = grid.columnKeyToId[columnKey]
              if (!colId) return
              await updateCell.execute({ rowId, columnId: colId, value })
              setGrid({
                ...grid,
                rows: grid.rows.map((r: any) => (r.rowId === rowId ? { ...r, values: { ...r.values, [columnKey]: value } } : r))
              })
            }}
          />
        )}
      </Stack>
    </Container>
  )
}


