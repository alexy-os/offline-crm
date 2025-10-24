import type { BuilderConfig } from '../types'

export function generateUI(config: BuilderConfig): string {
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
    .map((c) => `${c.key}: ${mapTsType(c.kind)}`)
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

function pascal(name: string): string {
  return name.replace(/(^|[\W_])(\w)/g, (_, __, c) => (c ? c.toUpperCase() : ''))
}

function mapTsType(kind: string): string {
  switch (kind) {
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'tags':
      return 'string[]'
    case 'object':
      return 'Record<string, unknown>'
    default:
      return 'string'
  }
}


