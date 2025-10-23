import React, { useMemo } from 'react'
import { useReactTable, getCoreRowModel, ColumnDef, flexRender } from '@tanstack/react-table'
import { GridDataVM } from '@/domain/models'
import { Button, Card, Stack } from '@ui8kit/core'

export type TableGridProps = {
  data: GridDataVM
  onCellChange: (args: { rowId: string; columnKey: string; value: unknown }) => void
}

export function TableGrid({ data, onCellChange }: TableGridProps): React.ReactElement {
  const columns = useMemo<ColumnDef<any>[]>(() => {
    return data.columns.map((c) => ({
      accessorKey: c.key,
      header: c.header,
      cell: ({ getValue, row, column }) => {
        const value = getValue() ?? ''
        const rowId = data.rows[row.index].rowId
        const columnKey = String(column.id)
        return (
          <input
            value={String(value ?? '')}
            onChange={(e) => onCellChange({ rowId, columnKey, value: e.target.value })}
            style={{ width: '100%', border: 'none', background: 'transparent', padding: '4px' }}
          />
        )
      }
    }))
  }, [data.columns, data.rows, onCellChange])

  const tableInstance = useReactTable({
    data: data.rows.map((r) => r.values),
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <Card>
      <Stack gap="sm">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {tableInstance.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tableInstance.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Stack>
    </Card>
  )
}
