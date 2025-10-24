import { Activity, useEffect, useState } from 'react'
import { Box, Button, Stack, Title } from '@ui8kit/core'
import { Sheet } from '@ui8kit/core'
import { Input, Select } from '@ui8kit/form'
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

  const addColumn = () => {
    const idx = cols.length + 1
    setCols([...cols, { key: `field_${idx}`, name: `Field ${idx}`, kind: 'text' as ColumnKind }])
  }

  const updateColumn = (i: number, next: Partial<BuilderColumn>) => {
    setCols(cols.map((c, idx) => (idx === i ? { ...c, ...next } : c)))
  }

  const removeColumn = (i: number) => setCols(cols.filter((_, idx) => idx !== i))

  const apply = () => onApply({ ...value, tableName: name || 'table', columns: cols })

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
                <Input
                  value={current[c.key] ?? ''}
                  onChange={(e) => setField(c.key, (e.target as HTMLInputElement).value)}
                />
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


