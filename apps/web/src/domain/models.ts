export type TableEntity = {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string | null
}

export type ColumnType = 'text' | 'number' | 'date' | 'bool' | 'select' | 'json'

export type TableColumnEntity = {
  id: string
  tableId: string
  key: string
  name: string
  type: ColumnType
  position: number
  width?: number | null
  meta?: Record<string, unknown>
}

export type TableRowEntity = {
  id: string
  tableId: string
  position: number
  createdAt?: string
  updatedAt?: string
}

export type TableCellEntity = {
  id?: string
  rowId: string
  columnId: string
  value: unknown
  updatedAt?: string
}

export type GridColumnVM = {
  id: string
  key: string
  header: string
  type: ColumnType
}

export type GridRowVM = {
  rowId: string
  // Values by column key
  values: Record<string, unknown>
}

export type GridDataVM = {
  table: TableEntity
  columns: GridColumnVM[]
  rows: GridRowVM[]
  // Maps for reverse lookups
  columnKeyToId: Record<string, string>
  columnIdToKey: Record<string, string>
}
