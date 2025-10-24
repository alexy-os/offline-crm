import { Activity, useEffect, useState } from 'react'
import { Box, Button, Stack, Title } from '@ui8kit/core'
import { Sheet } from '@ui8kit/core'
import { Input, Select, Textarea } from '@ui8kit/form'
import type { BuilderConfig, BuilderColumn, ColumnKind } from '@buildy/builder-core'

export function TableEditorSheet({
  value,
  onChange,
  mode = 'table',
  row,
  onSaveRow,
  openSignal,
}: {
  value: BuilderConfig
  onChange: (v: BuilderConfig) => void
  mode?: 'table' | 'row'
  row?: Record<string, any> | null
  onSaveRow?: (next: Record<string, any>) => void
  openSignal?: number
}) {
  useEffect(() => {
    if (openSignal !== undefined) {
      const input = document.getElementById('editor-sheet') as HTMLInputElement | null
      if (input) input.checked = true
    }
  }, [openSignal])

  const title = mode === 'row' ? 'Row Editor' : 'Table Editor'

  return (
    <Sheet id="editor-sheet" side="right" size="2xl" showTrigger={false} title={title}>
      <Activity mode={'visible'}>
        {mode === 'row' ? (
          <RowEditorForm
            value={value}
            row={row || {}}
            onApply={(next) => onSaveRow?.(next)}
          />
        ) : (
          <EditorForm value={value} onApply={onChange} />
        )}
      </Activity>
    </Sheet>
  )
}

function EditorForm({ value, onApply }: { value: BuilderConfig; onApply: (v: BuilderConfig) => void }) {
  const [name, setName] = useState(value.tableName)
  const [cols, setCols] = useState<BuilderColumn[]>(value.columns)
  const [rawOptions, setRawOptions] = useState<Record<string, string>>({})

  const addColumn = () => {
    const idx = cols.length + 1
    setCols([...cols, { key: `field_${idx}`, name: `Field ${idx}`, kind: 'text' as ColumnKind }])
  }

  const updateColumn = (i: number, next: Partial<BuilderColumn>) => {
    setCols(cols.map((c, idx) => (idx === i ? { ...c, ...next } : c)))
  }

  const removeColumn = (i: number) => setCols(cols.filter((_, idx) => idx !== i))

  const apply = () => {
    const nextCols = cols.map((c) => {
      if (c.kind === 'select' || c.kind === 'tags') {
        const text = rawOptions[c.key] ?? formatOptions(c)
        return {
          ...c,
          meta: { ...(c.meta || {}), options: parseOptions(text) }
        }
      }
      return c
    })
    onApply({ ...value, tableName: name || 'table', columns: nextCols })
  }

  return (
    <Box p="md" bg="card">
      <Stack gap="md">
        <Title size="lg">Definition</Title>
        <div className="flex items-center gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={addColumn}>Add column</Button>
          <label htmlFor="editor-sheet">
            <Button variant="secondary" onClick={apply}>Apply</Button>
          </label>
        </div>

        <div className="grid gap-3">
          {cols.map((c, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3">
                <label>Key</label>
                <Input value={c.key} onChange={(e) => updateColumn(i, { key: (e.target as HTMLInputElement).value })} />
              </div>
              <div className="col-span-3">
                <label>Name</label>
                <Input value={c.name} onChange={(e) => updateColumn(i, { name: (e.target as HTMLInputElement).value })} />
              </div>
              <div className="col-span-3">
                <label>Type</label>
                <Select value={c.kind} onChange={(e) => updateColumn(i, { kind: (e.target as HTMLSelectElement).value as ColumnKind })}>
                  <option value="text">text</option>
                  <option value="number">number</option>
                  <option value="select">select</option>
                  <option value="boolean">boolean</option>
                  <option value="date">date</option>
                  <option value="tags">tags</option>
                  <option value="sheet">sheet</option>
                  <option value="object">object</option>
                </Select>
              </div>
              <div className="col-span-3">
                <Button variant="destructive" onClick={() => removeColumn(i)}>Remove</Button>
              </div>
              {(c.kind === 'select' || c.kind === 'tags') && (
                <div className="col-span-12">
                  <label>Options (separate by comma , or |; use "value:Label" or just value)</label>
                  <Textarea
                    placeholder={c.kind === 'select' ? 'male:Male, female:Female' : 'tag1, tag2, tag3'}
                    value={rawOptions[c.key] ?? formatOptions(c)}
                    onChange={(e) => setRawOptions((r) => ({ ...r, [c.key]: (e.target as HTMLTextAreaElement).value }))}
                    onBlur={(e) => {
                      const text = (e.target as HTMLTextAreaElement).value
                      updateColumn(i, { meta: { ...(c.meta || {}), options: parseOptions(text) } })
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <label htmlFor="editor-sheet">
          <Button variant="primary" onClick={apply}>Save</Button>
        </label>
      </Stack>
    </Box>
  )
}

function RowEditorForm({ value, row, onApply }: { value: BuilderConfig; row: Record<string, any>; onApply: (next: Record<string, any>) => void }) {
  const [current, setCurrent] = useState<Record<string, any>>(row)

  const setField = (key: string, val: any) => setCurrent((r) => ({ ...r, [key]: val }))
  const apply = () => onApply(current)

  return (
    <Box p="md" bg="card">
      <Stack gap="md">
        <Title size="lg">Row</Title>
        <div className="grid gap-3">
          {value.columns.map((c) => (
            <div key={c.key} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">
                <label>{c.name}</label>
              </div>
              <div className="col-span-8">
                {c.kind === 'number' ? (
                  <Input
                    type="number"
                    value={current[c.key] ?? 0}
                    onChange={(e) => setField(c.key, Number((e.target as HTMLInputElement).value))}
                  />
                ) : c.kind === 'boolean' ? (
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!current[c.key]}
                      onChange={(e) => setField(c.key, (e.target as HTMLInputElement).checked)}
                    />
                  </label>
                ) : c.kind === 'select' ? (
                  <Select
                    value={current[c.key] ?? ''}
                    onChange={(e) => setField(c.key, (e.target as HTMLSelectElement).value)}
                  >
                    {(Array.isArray((c as any).meta?.options) ? (c as any).meta.options : []).map((opt: any) => (
                      <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                ) : c.kind === 'tags' ? (
                  <Input
                    placeholder="comma separated"
                    value={Array.isArray(current[c.key]) ? (current[c.key] as any[]).join(', ') : ''}
                    onChange={(e) => setField(c.key, (e.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean))}
                  />
                ) : c.kind === 'object' ? (
                  <Textarea
                    value={JSON.stringify(current[c.key] ?? {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const val = JSON.parse((e.target as HTMLTextAreaElement).value)
                        setField(c.key, val)
                      } catch {}
                    }}
                  />
                ) : (
                  <Input
                    value={current[c.key] ?? ''}
                    onChange={(e) => setField(c.key, (e.target as HTMLInputElement).value)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <label htmlFor="editor-sheet">
          <Button variant="primary" onClick={apply}>Save</Button>
        </label>
      </Stack>
    </Box>
  )
}

function parseOptions(text: string): Array<{ value: string; label: string }> {
  return text
    .split(/[\n,|]+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((segment) => {
      const [v, ...rest] = segment.split(':')
      const value = (v || '').trim()
      const label = rest.length ? rest.join(':').trim() : value
      return { value, label }
    })
}

function formatOptions(c: BuilderColumn): string {
  const opts = (c as any).meta?.options as Array<{ value: string; label: string }> | undefined
  if (!Array.isArray(opts)) return ''
  // Use comma-separated output to be robust when newlines are not available
  return opts.map((o) => `${o.value}:${o.label}`).join(', ')
}


