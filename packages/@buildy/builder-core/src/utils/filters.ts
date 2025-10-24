import type { BuilderConfig } from '../types'

export function makeGlobalFilter(config: BuilderConfig, enabledTextCols: string[]) {
  const set = new Set(enabledTextCols)
  return (row: any, _columnId: string, filterValue: any) => {
    if (!filterValue) return true
    const query = String(filterValue).toLowerCase()
    for (const key of set) {
      const val = row.getValue(key)
      if (String(val ?? '').toLowerCase().includes(query)) return true
    }
    return false
  }
}


