import React, { useEffect, useState } from 'react'
import { Container, Stack, Button, Title, Text, Card, Group } from '@ui8kit/core'
import { supabase, checkTablesSchema } from '../lib/supabaseClient'
import { SupabaseTablesRepository, SupabaseColumnsRepository, SupabaseRowsRepository } from '@/infrastructure/supabase/SupabaseRepositories'
import { CreateTableUseCase, AddColumnUseCase, AddRowUseCase } from '@/application/usecases'

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
  const [schemaMissing, setSchemaMissing] = useState(false)
  const tablesRepo = new SupabaseTablesRepository()
  const columnsRepo = new SupabaseColumnsRepository()
  const rowsRepo = new SupabaseRowsRepository()
  const createTable = new CreateTableUseCase(tablesRepo)
  const addColumn = new AddColumnUseCase(columnsRepo)
  const addRow = new AddRowUseCase(rowsRepo)

  useEffect(() => {
    loadTables()
  }, [])

  async function loadTables() {
    setLoading(true)
    try {
      const schemaState = await checkTablesSchema()
      if (schemaState === 'missing') {
        setSchemaMissing(true)
        return
      }
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

    if (schemaMissing) {
      window.alert('Supabase schema is missing. Please run the SQL from supabase.sql in your project or click "Copy SQL" below.')
      return
    }

    try {
      const t = await createTable.execute(newTableName)
      const defaultColumns = Array.from({ length: columnCount }, (_, i) => String.fromCharCode(65 + i))
      for (const [i, key] of defaultColumns.entries()) {
        await addColumn.execute({ tableId: t.id, key, name: key, position: i, type: 'text' })
      }
      await addRow.execute({ tableId: t.id, position: 0 })

      const refreshed = await tablesRepo.listTables()
      setTables(refreshed as any)
      setNewTableName('')
      setColumnCount(3)
      window.alert('Table created successfully!')
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
        {schemaMissing && (
          <Card>
            <Stack gap="sm">
              <Title size="lg">Supabase schema is not initialized</Title>
              <Text>
                Please open Supabase SQL Editor and run the SQL from <code>apps/web/supabase.sql</code>. This will create the
                <code> public.tables </code> relation and policies.
              </Text>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button onClick={() => {
                  navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{"name":"","columns":[],"rows":[]}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT name_not_empty CHECK (name != '')
);
CREATE INDEX IF NOT EXISTS idx_tables_name ON public.tables(name);
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all users to read tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Allow users to insert tables" ON public.tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update tables" ON public.tables FOR UPDATE USING (true);
CREATE POLICY "Allow users to delete tables" ON public.tables FOR DELETE USING (true);
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_tables_updated_at ON public.tables;
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`)
                  window.alert('SQL copied to clipboard')
                }}>Copy SQL</Button>
                <Button onClick={() => {
                  const sql = `-- See apps/web/supabase.sql in the repo\n` +
                    `CREATE TABLE IF NOT EXISTS public.tables (\n` +
                    `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n` +
                    `  name TEXT NOT NULL UNIQUE,\n` +
                    `  payload JSONB NOT NULL DEFAULT '{"name":"","columns":[],"rows":[]}',\n` +
                    `  created_at TIMESTAMPTZ DEFAULT now(),\n` +
                    `  updated_at TIMESTAMPTZ DEFAULT now(),\n` +
                    `  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,\n` +
                    `  CONSTRAINT name_not_empty CHECK (name != '')\n` +
                    `);\n` +
                    `CREATE INDEX IF NOT EXISTS idx_tables_name ON public.tables(name);\n` +
                    `ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;\n` +
                    `CREATE POLICY "Allow all users to read tables" ON public.tables FOR SELECT USING (true);\n` +
                    `CREATE POLICY "Allow users to insert tables" ON public.tables FOR INSERT WITH CHECK (true);\n` +
                    `CREATE POLICY "Allow users to update tables" ON public.tables FOR UPDATE USING (true);\n` +
                    `CREATE POLICY "Allow users to delete tables" ON public.tables FOR DELETE USING (true);\n` +
                    `CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;\n` +
                    `DROP TRIGGER IF EXISTS update_tables_updated_at ON public.tables;\n` +
                    `CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();\n`
                  const blob = new Blob([sql], { type: 'text/sql' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'init_tables.sql'
                  a.click()
                  URL.revokeObjectURL(url)
                }}>Download SQL</Button>
              </div>
            </Stack>
          </Card>
        )}
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
