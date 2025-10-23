import { CellsRepository, ColumnsRepository, GridQueryService, RowsRepository, TablesRepository } from '@/domain/repositories'
import { GridDataVM } from '@/domain/models'

export class LoadGridUseCase {
  constructor(private gridService: GridQueryService) {}
  execute(tableId: string, opts?: { limit?: number; offset?: number }): Promise<GridDataVM> {
    return this.gridService.loadGrid(tableId, opts)
  }
}

export class UpdateCellUseCase {
  constructor(private cellsRepo: CellsRepository) {}
  async execute(args: { rowId: string; columnId: string; value: unknown }): Promise<void> {
    await this.cellsRepo.upsertCell({ rowId: args.rowId, columnId: args.columnId, value: args.value })
  }
}

export class AddRowUseCase {
  constructor(private rowsRepo: RowsRepository) {}
  async execute(args: { tableId: string; position: number }): Promise<void> {
    await this.rowsRepo.addRow({ tableId: args.tableId, position: args.position })
  }
}

export class AddColumnUseCase {
  constructor(private columnsRepo: ColumnsRepository) {}
  async execute(args: { tableId: string; key: string; name: string; position: number; type?: string }): Promise<void> {
    await this.columnsRepo.addColumn({ tableId: args.tableId, key: args.key, name: args.name, position: args.position, type: (args.type as any) ?? 'text', width: null, meta: {} })
  }
}

export class CreateTableUseCase {
  constructor(private tablesRepo: TablesRepository) {}
  execute(name: string) {
    return this.tablesRepo.createTable(name)
  }
}
