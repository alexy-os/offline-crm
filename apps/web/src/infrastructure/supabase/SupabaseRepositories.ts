import supabase from '@/lib/supabaseClient'
import { CellsRepository, ColumnsRepository, GridQueryService, RowsRepository, TablesRepository } from '@/domain/repositories'
import { GridDataVM, TableCellEntity, TableColumnEntity, TableEntity, TableRowEntity } from '@/domain/models'

export class SupabaseTablesRepository implements TablesRepository {
  async createTable(name: string): Promise<TableEntity> {
    const { data, error } = await supabase.from('tables').insert({ name }).select().single()
    if (error) throw new Error(error.message)
    return { id: data.id, name: data.name, createdAt: data.created_at, updatedAt: data.updated_at, createdBy: data.created_by }
  }

  async getTableById(id: string): Promise<TableEntity | null> {
    const { data, error } = await supabase.from('tables').select('*').eq('id', id).single()
    if (error) return null
    return { id: data.id, name: data.name, createdAt: data.created_at, updatedAt: data.updated_at, createdBy: data.created_by }
  }

  async getTableByName(name: string): Promise<TableEntity | null> {
    const { data, error } = await supabase.from('tables').select('*').eq('name', name).single()
    if (error) return null
    return { id: data.id, name: data.name, createdAt: data.created_at, updatedAt: data.updated_at, createdBy: data.created_by }
  }

  async listTables(): Promise<TableEntity[]> {
    const { data, error } = await supabase.from('tables').select('*').order('updated_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((t: any) => ({ id: t.id, name: t.name, createdAt: t.created_at, updatedAt: t.updated_at, createdBy: t.created_by }))
  }
}

export class SupabaseColumnsRepository implements ColumnsRepository {
  async listColumns(tableId: string): Promise<TableColumnEntity[]> {
    const { data, error } = await supabase.from('table_columns').select('*').eq('table_id', tableId).order('position', { ascending: true })
    if (error) throw new Error(error.message)
    return (data ?? []).map((c: any) => ({
      id: c.id,
      tableId: c.table_id,
      key: c.key,
      name: c.name,
      type: c.type,
      position: c.position,
      width: c.width ?? null,
      meta: c.meta ?? {}
    }))
  }

  async addColumn(input: Omit<TableColumnEntity, 'id'>): Promise<TableColumnEntity> {
    const payload = {
      table_id: input.tableId,
      key: input.key,
      name: input.name,
      type: input.type,
      position: input.position,
      width: input.width ?? null,
      meta: input.meta ?? {}
    }
    const { data, error } = await supabase.from('table_columns').insert(payload).select().single()
    if (error) throw new Error(error.message)
    return {
      id: data.id,
      tableId: data.table_id,
      key: data.key,
      name: data.name,
      type: data.type,
      position: data.position,
      width: data.width ?? null,
      meta: data.meta ?? {}
    }
  }

  async updateColumn(columnId: string, patch: Partial<TableColumnEntity>): Promise<void> {
    const payload: any = {}
    if (patch.name !== undefined) payload.name = patch.name
    if (patch.type !== undefined) payload.type = patch.type
    if (patch.position !== undefined) payload.position = patch.position
    if (patch.width !== undefined) payload.width = patch.width
    if (patch.meta !== undefined) payload.meta = patch.meta
    const { error } = await supabase.from('table_columns').update(payload).eq('id', columnId)
    if (error) throw new Error(error.message)
  }
}

export class SupabaseRowsRepository implements RowsRepository {
  async listRows(tableId: string, opts?: { limit?: number; offset?: number; order?: 'asc' | 'desc' }): Promise<TableRowEntity[]> {
    const { data, error } = await supabase
      .from('table_rows')
      .select('*')
      .eq('table_id', tableId)
      .order('position', { ascending: (opts?.order ?? 'asc') === 'asc' })
      .range(opts?.offset ?? 0, (opts?.offset ?? 0) + (opts?.limit ?? 500) - 1)
    if (error) throw new Error(error.message)
    return (data ?? []).map((r: any) => ({ id: r.id, tableId: r.table_id, position: r.position, createdAt: r.created_at, updatedAt: r.updated_at }))
  }

  async addRow(input: Omit<TableRowEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TableRowEntity> {
    const { data, error } = await supabase.from('table_rows').insert({ table_id: input.tableId, position: input.position }).select().single()
    if (error) throw new Error(error.message)
    return { id: data.id, tableId: data.table_id, position: data.position, createdAt: data.created_at, updatedAt: data.updated_at }
  }

  async deleteRow(rowId: string): Promise<void> {
    const { error } = await supabase.from('table_rows').delete().eq('id', rowId)
    if (error) throw new Error(error.message)
  }
}

export class SupabaseCellsRepository implements CellsRepository {
  async listCellsByRows(rowIds: string[]): Promise<TableCellEntity[]> {
    if (rowIds.length === 0) return []
    const { data, error } = await supabase.from('table_cells').select('*').in('row_id', rowIds)
    if (error) throw new Error(error.message)
    return (data ?? []).map((c: any) => ({ id: c.id, rowId: c.row_id, columnId: c.column_id, value: c.value, updatedAt: c.updated_at }))
  }

  async upsertCell(cell: TableCellEntity): Promise<void> {
    const payload = { row_id: cell.rowId, column_id: cell.columnId, value: cell.value, updated_at: new Date().toISOString() }
    const { error } = await supabase.from('table_cells').upsert(payload, { onConflict: 'row_id,column_id' })
    if (error) throw new Error(error.message)
  }

  async upsertCells(cells: TableCellEntity[]): Promise<void> {
    if (cells.length === 0) return
    const payload = cells.map((c) => ({ row_id: c.rowId, column_id: c.columnId, value: c.value, updated_at: new Date().toISOString() }))
    const { error } = await supabase.from('table_cells').upsert(payload, { onConflict: 'row_id,column_id' })
    if (error) throw new Error(error.message)
  }
}

export class SupabaseGridQueryService implements GridQueryService {
  constructor(
    private readonly tablesRepo: TablesRepository,
    private readonly columnsRepo: ColumnsRepository,
    private readonly rowsRepo: RowsRepository,
    private readonly cellsRepo: CellsRepository
  ) {}

  async loadGrid(tableId: string, opts?: { limit?: number; offset?: number }): Promise<GridDataVM> {
    const [table, columns, rows] = await Promise.all([
      this.tablesRepo.getTableById(tableId),
      this.columnsRepo.listColumns(tableId),
      this.rowsRepo.listRows(tableId, { limit: opts?.limit ?? 500, offset: opts?.offset ?? 0 })
    ])
    if (!table) throw new Error('Table not found')

    const rowIds = rows.map((r) => r.id)
    const cells = await this.cellsRepo.listCellsByRows(rowIds)

    const columnKeyToId: Record<string, string> = {}
    const columnIdToKey: Record<string, string> = {}
    const columnsVM = columns.map((c) => {
      columnKeyToId[c.key] = c.id
      columnIdToKey[c.id] = c.key
      return { id: c.id, key: c.key, header: c.name, type: c.type }
    })

    const cellByRow: Record<string, Record<string, unknown>> = {}
    for (const cell of cells) {
      const key = columnIdToKey[cell.columnId]
      if (!key) continue
      if (!cellByRow[cell.rowId]) cellByRow[cell.rowId] = {}
      cellByRow[cell.rowId][key] = cell.value
    }

    const rowsVM = rows.map((r) => ({ rowId: r.id, values: cellByRow[r.id] ?? {} }))
    return { table, columns: columnsVM, rows: rowsVM, columnKeyToId, columnIdToKey }
  }
}
