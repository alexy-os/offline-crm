import type { ColumnWidgetDefinition, WidgetKind } from '../types'

const registry = new Map<string, ColumnWidgetDefinition>()

export function registerWidget(def: ColumnWidgetDefinition): void {
  registry.set(def.id, def)
}

export function getWidget(id: string): ColumnWidgetDefinition | undefined {
  return registry.get(id)
}

export function listWidgets(): ColumnWidgetDefinition[] {
  return Array.from(registry.values())
}

// Built-ins minimal stubs
registerWidget({ id: 'tags' as WidgetKind, label: 'Tags' })
registerWidget({ id: 'sheet' as WidgetKind, label: 'Sheet' })
registerWidget({ id: 'object' as WidgetKind, label: 'Object' })


