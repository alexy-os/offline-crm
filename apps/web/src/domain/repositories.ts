import { TableEntity, TableColumnEntity, TableRowEntity, TableCellEntity, GridDataVM } from './models'

export interface TablesRepository {
  createTable(name: string): Promise<TableEntity>
  getTableById(id: string): Promise<TableEntity | null>
  getTableByName(name: string): Promise<TableEntity | null>
  listTables(): Promise<TableEntity[]>
}

export interface ColumnsRepository {
  listColumns(tableId: string): Promise<TableColumnEntity[]>
  addColumn(input: Omit<TableColumnEntity, 'id'>): Promise<TableColumnEntity>
  updateColumn(columnId: string, patch: Partial<TableColumnEntity>): Promise<void>
}

export interface RowsRepository {
  listRows(tableId: string, opts?: { limit?: number; offset?: number; order?: 'asc' | 'desc' }): Promise<TableRowEntity[]>
  addRow(input: Omit<TableRowEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TableRowEntity>
  deleteRow(rowId: string): Promise<void>
}

export interface CellsRepository {
  listCellsByRows(rowIds: string[]): Promise<TableCellEntity[]>
  upsertCell(cell: TableCellEntity): Promise<void>
  upsertCells(cells: TableCellEntity[]): Promise<void>
}

export interface GridQueryService {
  loadGrid(tableId: string, opts?: { limit?: number; offset?: number }): Promise<GridDataVM>
}

export type NormalizedExport = {
  table: TableEntity
  columns: TableColumnEntity[]
  rows: TableRowEntity[]
  cells: TableCellEntity[]
}

export interface JsonIOService {
  exportNormalized(tableId: string): Promise<NormalizedExport>
  importNormalized(data: NormalizedExport): Promise<TableEntity>
  // legacy payload compatibility
  exportLegacyPayload(tableId: string): Promise<{ name: string; columns: string[]; rows: Record<string, unknown>[] }>
  importLegacyPayload(payload: { name: string; columns: string[]; rows: Record<string, unknown>[] }): Promise<TableEntity>
}
