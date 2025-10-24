import { Block, Box, Button, Container, Group, Stack, Text, Title } from '@ui8kit/core'
import { Input, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Switch, Checkbox } from '@ui8kit/form'
import { useEffect, useMemo, useState } from 'react'
import { TogglesBar, TableEditorSheet, ExportPanel, SchemaPreview } from '@buildy/table-maker'
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type SortingState, type ColumnFiltersState } from '@tanstack/react-table'
import type { BuilderConfig as CoreConfig, ColumnKind as CoreKind } from '@buildy/builder-core'
import { generateTypes as coreGenerateTypes, generateUI as coreGenerateUI, generateSQLNormalized, defaultValueForKind, makeGlobalFilter } from '@buildy/builder-core'

type ColumnKind = CoreKind

interface BuilderColumn {
  key: string
  name: string
  kind: ColumnKind
}

interface BuilderConfig extends CoreConfig {}

const defaultConfig: BuilderConfig = {
  tableName: 'users',
  columns: [
    { key: 'name', name: 'Name', kind: 'text' },
    { key: 'age', name: 'Age', kind: 'number' },
    { key: 'gender', name: 'Gender', kind: 'select' },
    { key: 'email', name: 'Email', kind: 'text' },
  ],
  features: {
    search: false,
    sorting: false,
    pagination: false,
    create: false,
    edit: false,
    delete: false,
    multiDelete: false,
    columnsPanel: false,
  },
}

type Row = Record<string, any> & { id: string }

const initialRows: Row[] = [
  { id: '1', name: 'Jane Doe', age: 30, gender: 'female', email: 'jane@test.com' },
  { id: '2', name: 'Bob Smith', age: 28, gender: 'male', email: 'bob@test.com' },
]

function buildColumns(
  defs: BuilderColumn[],
  features: BuilderConfig['features'],
  onEdit: (r: Row) => void,
  onDelete: (id: string) => void
): ColumnDef<Row, any>[] {
  const cols: ColumnDef<Row, any>[] = []

  if (features.multiDelete) {
    cols.push({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected((e.target as HTMLInputElement).checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected((e.target as HTMLInputElement).checked)}
          aria-label="Select row"
        />
      )
    })
  }

  for (const c of defs) cols.push({ accessorKey: c.key, header: c.name })

  if (features.edit || features.delete) {
    cols.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Group gap="sm">
          {features.edit && <Button variant="outline" onClick={() => onEdit(row.original)}>Edit</Button>}
          {features.delete && <Button variant="destructive" onClick={() => onDelete(row.original.id)}>Delete</Button>}
        </Group>
      )
    })
  }

  return cols
}


function generateTypes(config: BuilderConfig): string {
  const fields = config.columns.map((c) => `  ${c.key}: ${c.kind === 'number' ? 'number' : c.kind === 'boolean' ? 'boolean' : 'string'};`).join('\n')
  return `export interface ${pascal(config.tableName)}Row {\n${fields}\n}`
}

function generateUI(config: BuilderConfig): string {
  const rowType = pascal(config.tableName) + 'Row'
  const columnsArray = config.columns
    .map((c) => `  { accessorKey: '${c.key}', header: '${c.name}' }`)
    .join(',\n')
  const sortingImports = config.features.sorting ? `, getSortedRowModel` : ''
  const searchImports = config.features.search ? `, getFilteredRowModel` : ''
  const paginationImports = config.features.pagination ? `, getPaginationRowModel` : ''

  return `import { ColumnDef, useReactTable, getCoreRowModel${sortingImports}${searchImports}${paginationImports} } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui8kit/form'

export type ${rowType} = { ${config.columns
    .map((c) => `${c.key}: ${c.kind === 'number' ? 'number' : c.kind === 'boolean' ? 'boolean' : 'string'}`)
    .join('; ')} }

const columns: ColumnDef<${rowType}>[] = [\n${columnsArray}\n]

export function GeneratedTable({ data }: { data: ${rowType}[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ${config.features.sorting ? 'getSortedRowModel: getSortedRowModel(),' : ''}
    ${config.features.search ? 'getFilteredRowModel: getFilteredRowModel(),' : ''}
    ${config.features.pagination ? 'getPaginationRowModel: getPaginationRowModel(),' : ''}
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder ? null : (h.column.columnDef.header as any)}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{String(cell.getValue() ?? '')}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}`
}

function generateSQL(config: BuilderConfig): string {
  const colsInsert = config.columns
    .map((c, idx) => `select new_table.id, '${c.key}', '${c.name}', '${c.kind}', ${idx}::int, null::int, '{}'::jsonb`)
    .join('\nunion all\n')

  return `-- Requires normalized schema (tables, table_columns, table_rows, table_cells)\n-- If not installed, run apps/web/supabase.sql first.\nwith new_table as (\n  insert into public.tables(name) values ('${config.tableName}')\n  returning id\n)\ninsert into public.table_columns (table_id, key, name, type, position, width, meta)\n${colsInsert};`
}

function sqlType(kind: ColumnKind): string {
  switch (kind) {
    case 'number': return 'int';
    case 'boolean': return 'boolean';
    case 'date': return 'timestamptz';
    default: return 'text';
  }
}

function pascal(name: string) {
  return name.replace(/(^|[_-])(\w)/g, (_, __, c) => c.toUpperCase())
}

export default function GetTable() {
  const [config, setConfig] = useState<BuilderConfig>(defaultConfig)
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [enabledTextCols, setEnabledTextCols] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('maker:features')
      if (raw) {
        const saved = JSON.parse(raw) as BuilderConfig['features']
        setConfig((c) => ({ ...c, features: { ...c.features, ...saved } }))
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('maker:features', JSON.stringify(config.features))
    } catch {}
  }, [config.features])

  // Keep enabled text columns in sync with current columns; default enable all text columns
  useEffect(() => {
    const textKeys = config.columns.filter((c) => c.kind === 'text').map((c) => c.key)
    setEnabledTextCols((prev) => {
      const prevSet = new Set(prev)
      const next: string[] = []
      for (const k of textKeys) {
        // preserve previous toggle when possible; enable newly added by default
        if (prevSet.has(k)) next.push(k)
        else next.push(k)
      }
      return next
    })
  }, [config.columns])

  const columns = useMemo(
    () =>
      buildColumns(
        config.columns,
        config.features,
        (record) => {
          // open row editor in sheet via openSignal and mode=row
          setEditor({ mode: 'row', row: record, signal: Date.now() })
        },
        (id) => setRows((rs) => rs.filter((r) => r.id !== id))
      ),
    [config.columns, config.features]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: config.features.sorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: config.features.search ? getFilteredRowModel() : undefined,
    getPaginationRowModel: config.features.pagination ? getPaginationRowModel() : undefined,
    globalFilterFn: makeGlobalFilter(config, enabledTextCols),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, rowSelection },
  })

  const download = (filename: string, content: string, type = 'text/plain') => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const uiCode = coreGenerateUI(config)
  const typesCode = coreGenerateTypes(config)
  const sqlCode = generateSQLNormalized(config)

  const [editor, setEditor] = useState<{ mode: 'table' | 'row'; row?: Row | null; signal?: number }>({ mode: 'table' })

  return (
    <Block component="section" py="xl">
      <Container>
        <Stack gap="lg">
          <Group justify="between" align="center">
            <Title size="2xl">Table Builder</Title>
            <Group gap="sm">
              <Button onClick={() => navigator.clipboard.writeText(uiCode)}>Copy UI</Button>
              <Button onClick={() => navigator.clipboard.writeText(typesCode)}>Copy Types</Button>
              <Button onClick={() => navigator.clipboard.writeText(sqlCode)}>Copy SQL</Button>
              <Button variant="secondary" onClick={() => download('ui.tsx', uiCode, 'text/plain')}>Download UI</Button>
              <Button variant="secondary" onClick={() => download('types.ts', typesCode, 'text/plain')}>Download Types</Button>
              <Button variant="secondary" onClick={() => download('schema.sql', sqlCode, 'text/plain')}>Download SQL</Button>
            </Group>
          </Group>

          <Box p="md" bg="card">
            <Stack gap="md">
              <TogglesBar
                features={config.features}
                onChange={(next) => setConfig((c) => ({ ...c, features: next }))}
              />
              <Group justify="between" align="center">
                {config.features.search && (
                  <div className="flex flex-col gap-1">
                    <Input
                      placeholder="Filter..."
                      value={(table.getState().globalFilter as string) ?? ''}
                      onChange={(e) => table.setGlobalFilter((e.target as HTMLInputElement).value)}
                      className="max-w-sm"
                    />
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {config.columns
                        .filter((c) => c.kind === 'text')
                        .map((c) => (
                          <label key={c.key} className="inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={enabledTextCols.includes(c.key)}
                              onChange={(e) => {
                                const checked = (e.target as HTMLInputElement).checked
                                setEnabledTextCols((prev) => {
                                  const set = new Set(prev)
                                  if (checked) set.add(c.key)
                                  else set.delete(c.key)
                                  return Array.from(set)
                                })
                              }}
                            />
                            {c.name}
                          </label>
                        ))}
                    </div>
                  </div>
                )}
                <Group gap="sm">
                  {config.features.multiDelete && Object.keys(rowSelection).length > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        const ids = new Set(
                          table.getFilteredSelectedRowModel().rows.map((r) => (r.original as Row).id)
                        )
                        setRows((rs) => rs.filter((r) => !ids.has(r.id)))
                        setRowSelection({})
                      }}
                    >
                      Delete Selected ({Object.keys(rowSelection).length})
                    </Button>
                  )}
                  {config.features.create && (
                    <Button
                      onClick={() => {
                        const id = String(Date.now())
                        const newRow: Row = { id }
                        for (const c of config.columns) newRow[c.key] = defaultValueForKind(c.kind)
                        setRows((rs) => [...rs, newRow])
                        setEditor({ mode: 'row', row: newRow, signal: Date.now() })
                      }}
                    >
                      Add Row
                    </Button>
                  )}
                </Group>
              </Group>
              <Text size="sm" c="muted">Define columns, toggle features, preview table, export artifacts.</Text>
            </Stack>
          </Box>

          <div className="flex gap-2">
            <label htmlFor="editor-sheet">
              <Button variant="secondary" onClick={() => setEditor({ mode: 'table', signal: Date.now() })}>Table Editor</Button>
            </label>
          </div>
          <TableEditorSheet
            value={config}
            onChange={setConfig}
            mode={editor.mode}
            row={editor.row}
            onSaveRow={(next) => {
              setRows((rs) => rs.map((r) => (r.id === editor.row?.id ? { ...r, ...next } : r)))
            }}
            openSignal={editor.signal}
          />

          <Box p="md" bg="card">
            <Text fw="bold">Preview</Text>
            <div className="rounded-md border mt-2">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(hg => (
                    <TableRow key={hg.id}>
                      {hg.headers.map(h => (
                        <TableHead key={h.id}>
                          {h.isPlaceholder ? null : (
                            <div className="flex items-center">
                              {flexRender(h.column.columnDef.header, h.getContext())}
                              {config.features.sorting && h.column.getCanSort() && (
                                <Button variant="ghost" onClick={h.column.getToggleSortingHandler()}>
                                  {h.column.getIsSorted() === 'asc' ? '↑' : h.column.getIsSorted() === 'desc' ? '↓' : '↕'}
                                </Button>
                              )}
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(r => (
                    <TableRow key={r.id} data-state={r.getIsSelected() && 'selected'}>
                      {r.getVisibleCells().map(c => (
                        <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Box>
          {config.features.pagination && (
            <Group justify="end" gap="sm">
              <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </Group>
          )}

          <ExportPanel config={config} rows={rows} />
          <SchemaPreview config={config} rows={rows} />
        </Stack>
      </Container>
    </Block>
  )
}

