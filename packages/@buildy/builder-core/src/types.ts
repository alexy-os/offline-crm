export type PrimitiveKind = 'text' | 'number' | 'select' | 'boolean' | 'date'
export type WidgetKind = 'tags' | 'sheet' | 'object'
export type ColumnKind = PrimitiveKind | WidgetKind

export interface BuilderColumn {
  key: string
  name: string
  kind: ColumnKind
  required?: boolean
  options?: string[]
  meta?: Record<string, unknown>
}

export interface BuilderFeatures {
  search: boolean
  sorting: boolean
  pagination: boolean
  create: boolean
  edit: boolean
  delete: boolean
  multiDelete: boolean
  columnsPanel: boolean
}

export interface BuilderConfig {
  tableName: string
  columns: BuilderColumn[]
  features: BuilderFeatures
}

export interface ColumnWidgetDefinition<TMeta = any> {
  id: WidgetKind | (string & {})
  label: string
  // Validate column.meta
  validate?(meta: unknown): meta is TMeta
  // Serialization hooks for cell values
  serialize?(value: unknown): unknown
  deserialize?(raw: unknown): unknown
}


