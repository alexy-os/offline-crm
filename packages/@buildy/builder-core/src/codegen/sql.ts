import type { BuilderConfig } from '../types'

export function generateSQLNormalized(config: BuilderConfig): string {
  const colsInsert = config.columns
    .map((c, idx) => `select new_table.id, '${c.key}', '${c.name}', '${c.kind}', ${idx}::int, null::int, '{}'::jsonb`)
    .join('\nunion all\n')

  return `-- Requires normalized schema (tables, table_columns, table_rows, table_cells)\n-- If not installed, run apps/web/supabase.sql first.\nwith new_table as (\n  insert into public.tables(name) values ('${config.tableName}')\n  returning id\n)\ninsert into public.table_columns (table_id, key, name, type, position, width, meta)\n${colsInsert};`
}


