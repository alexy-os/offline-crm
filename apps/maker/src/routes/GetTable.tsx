import { Block, Box, Button, Container, Group, Stack, Text, Title } from '@ui8kit/core'
import { Input, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Switch } from '@ui8kit/form'
import { useMemo, useState } from 'react'
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

type ColumnKind = 'text' | 'number' | 'select' | 'boolean' | 'date'

interface BuilderColumn {
  key: string
  name: string
  kind: ColumnKind
}

interface BuilderConfig {
  tableName: string
  columns: BuilderColumn[]
  features: {
    search: boolean
    sorting: boolean
    pagination: boolean
    create: boolean
    edit: boolean
    delete: boolean
    multiDelete: boolean
  }
}

const defaultConfig: BuilderConfig = {
  tableName: 'users',
  columns: [
    { key: 'name', name: 'Name', kind: 'text' },
    { key: 'age', name: 'Age', kind: 'number' },
    { key: 'gender', name: 'Gender', kind: 'select' },
    { key: 'email', name: 'Email', kind: 'text' },
  ],
  features: {
    search: true,
    sorting: true,
    pagination: true,
    create: true,
    edit: true,
    delete: true,
    multiDelete: true,
  },
}

type Row = Record<string, any> & { id: string }

const initialRows: Row[] = [
  { id: '1', name: 'Jane Doe', age: 30, gender: 'female', email: 'jane@test.com' },
  { id: '2', name: 'Bob Smith', age: 28, gender: 'male', email: 'bob@test.com' },
]

function buildColumns(defs: BuilderColumn[]): ColumnDef<Row, any>[] {
  return defs.map((c) => ({ accessorKey: c.key, header: c.name }))
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

  const columns = useMemo(() => buildColumns(config.columns), [config.columns])

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: config.features.sorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: config.features.search ? getFilteredRowModel() : undefined,
    getPaginationRowModel: config.features.pagination ? getPaginationRowModel() : undefined,
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

  const uiCode = generateUI(config)
  const typesCode = generateTypes(config)
  const sqlCode = generateSQL(config)

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
            <Text size="sm" c="muted">Define columns, toggle features, preview table, export artifacts.</Text>
          </Box>

          <BuilderEditor value={config} onChange={setConfig} />

          <Box p="md" bg="card">
            <Text fw="bold">Preview</Text>
            <div className="rounded-md border mt-2">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(hg => (
                    <TableRow key={hg.id}>
                      {hg.headers.map(h => (
                        <TableHead key={h.id}>
                          {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(r => (
                    <TableRow key={r.id}>
                      {r.getVisibleCells().map(c => (
                        <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Box>
        </Stack>
      </Container>
    </Block>
  )
}

function BuilderEditor({ value, onChange }: { value: BuilderConfig; onChange: (v: BuilderConfig) => void }) {
  const [name, setName] = useState(value.tableName)
  const [cols, setCols] = useState<BuilderColumn[]>(value.columns)
  const [features, setFeatures] = useState(value.features)

  const addColumn = () => {
    const idx = cols.length + 1
    setCols([...cols, { key: `field_${idx}`, name: `Field ${idx}`, kind: 'text' }])
  }

  const updateColumn = (i: number, next: Partial<BuilderColumn>) => {
    setCols(cols.map((c, idx) => (idx === i ? { ...c, ...next } : c)))
  }

  const removeColumn = (i: number) => setCols(cols.filter((_, idx) => idx !== i))

  const apply = () => onChange({ tableName: name || 'table', columns: cols, features })

  return (
    <Box p="md" bg="card">
      <Stack gap="md">
        <Title size="lg">Definition</Title>
        <Group gap="md">
          <div className="grid gap-2">
            <label>Table name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button onClick={addColumn}>Add column</Button>
          <Button variant="secondary" onClick={apply}>Apply</Button>
        </Group>

        <div className="grid gap-3">
          {cols.map((c, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3">
                <label>Key</label>
                <Input value={c.key} onChange={(e) => updateColumn(i, { key: e.target.value })} />
              </div>
              <div className="col-span-3">
                <label>Name</label>
                <Input value={c.name} onChange={(e) => updateColumn(i, { name: e.target.value })} />
              </div>
              <div className="col-span-3">
                <label>Type</label>
                <Select value={c.kind} onChange={(e) => updateColumn(i, { kind: e.target.value as ColumnKind })}>
                  <option value="text">text</option>
                  <option value="number">number</option>
                  <option value="select">select</option>
                  <option value="boolean">boolean</option>
                  <option value="date">date</option>
                </Select>
              </div>
              <div className="col-span-3">
                <Button variant="destructive" onClick={() => removeColumn(i)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>

        <Title size="lg">Features</Title>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(features).map(([k, v]) => (
            <label key={k} className="flex items-center gap-2">
              <Switch checked={v} onChange={(e) => setFeatures({ ...features, [k]: (e.target as HTMLInputElement).checked })} />
              <span>{k}</span>
            </label>
          ))}
        </div>
      </Stack>
    </Box>
  )
}


