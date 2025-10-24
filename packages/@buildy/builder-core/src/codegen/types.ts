import type { BuilderConfig } from '../types'

export function generateTypes(config: BuilderConfig): string {
  const typeName = pascal(config.tableName) + 'Row'
  const fields = config.columns
    .map((c) => `  ${c.key}: ${mapTsType(c.kind)};`)
    .join('\n')
  return `export interface ${typeName} {\n${fields}\n}`
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


