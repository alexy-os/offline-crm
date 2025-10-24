import type { ColumnKind } from '../types'

export function defaultValueForKind(kind: ColumnKind): any {
  switch (kind) {
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'date':
      return ''
    case 'tags':
      return []
    case 'object':
      return {}
    default:
      return ''
  }
}


