import React, { useEffect, useState } from 'react'
import { Container, Stack, Button, Title, Text, Card, Group } from '@ui8kit/core'
import { supabase } from '../lib/supabaseClient'

type TableSchema = {
  id?: string
  name: string
  columns: string[]
  rows: Record<string, any>[]
  updated_at?: string
}

export default function TableManager(): React.ReactElement {
  const [tables, setTables] = useState<(TableSchema & { id: string; updated_at: string } & { payload?: TableSchema })[]>([])
  const [loading, setLoading] = useState(true)
  const [newTableName, setNewTableName] = useState('')
  const [columnCount, setColumnCount] = useState(3)

  useEffect(() => {
    loadTables()
  }, [])

  async function loadTables() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('tables').select('*').order('updated_at', { ascending: false })
      if (error) {
        window.alert('Load error: ' + error.message)
        return
      }
      if (data) {
        setTables(data as any)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load tables:', e)
    } finally {
      setLoading(false)
    }
  }

  async function createNewTable() {
    if (!newTableName.trim()) {
      window.alert('Table name is required')
      return
    }

    const defaultColumns = Array.from({ length: columnCount }, (_, i) => String.fromCharCode(65 + i))
    const newTable: TableSchema = {
      name: newTableName,
      columns: defaultColumns,
      rows: [Object.fromEntries(defaultColumns.map(c => [c, '']))]
    }

    try {
      const { data, error } = await supabase.from('tables').insert({
        name: newTableName,
        payload: newTable
      }).select().single()

      if (error) {
        window.alert('Create error: ' + error.message)
        return
      }

      if (data) {
        setTables([data as any, ...tables])
        setNewTableName('')
        setColumnCount(3)
        window.alert('Table created successfully!')
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to create table:', e)
      window.alert('Failed to create table')
    }
  }

  async function deleteTable(id: string, name: string) {
    if (!window.confirm(`Delete table "${name}"?`)) {
      return
    }

    try {
      const { error } = await supabase.from('tables').delete().eq('id', id)
      if (error) {
        window.alert('Delete error: ' + error.message)
        return
      }

      setTables(tables.filter(t => t.id !== id))
      window.alert('Table deleted')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete table:', e)
    }
  }

  return (
    <Container>
      <Stack gap="lg">
        <Card>
          <Stack gap="md">
            <Title size="lg">Create New Table</Title>
            <Group>
              <input
                type="text"
                placeholder="Table name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <select
                value={columnCount}
                onChange={(e) => setColumnCount(Number(e.target.value))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} columns</option>
                ))}
              </select>
              <Button onClick={createNewTable}>Create Table</Button>
            </Group>
          </Stack>
        </Card>

        <Card>
          <Stack gap="md">
            <Title size="lg">Your Tables</Title>
            {loading ? (
              <Text>Loading...</Text>
            ) : tables.length === 0 ? (
              <Text>No tables yet. Create one above!</Text>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {tables.map(table => {
                  const payload = table.payload || table
                  return (
                    <div
                      key={table.id}
                      style={{
                        padding: '16px',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <Text size="md">{table.name}</Text>
                        <Text size="sm" color="gray">
                          {payload.columns?.length || 0} columns • {payload.rows?.length || 0} rows
                        </Text>
                      </div>
                      <Group>
                        <Button
                          onClick={() => window.location.href = `/table/${table.id}`}
                        >
                          Open
                        </Button>
                        <Button
                          onClick={() => deleteTable(table.id, table.name)}
                        >
                          Delete
                        </Button>
                      </Group>
                    </div>
                  )
                })}
              </div>
            )}
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}
