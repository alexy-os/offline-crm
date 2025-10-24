import { useState } from 'react'
import { Activity } from 'react'
import { Box, Button, Stack, Title } from '@ui8kit/core'
import { Sheet, SheetTrigger } from '@ui8kit/core'
import { Input, Select } from '@ui8kit/form'
import type { BuilderConfig, BuilderColumn, ColumnKind } from '@buildy/builder-core'

export function TableEditorSheet({ value, onChange }: { value: BuilderConfig; onChange: (v: BuilderConfig) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <SheetTrigger htmlFor="table-editor-sheet" variant="secondary" onClick={() => setOpen(true)}>
        Table Editor
      </SheetTrigger>
      <Sheet id="table-editor-sheet" side="right" size="2xl" showTrigger={false} title="Table Editor">
        <Activity mode={open ? 'visible' : 'hidden'}>
          <EditorForm
            value={value}
            onApply={(next) => onChange(next)}
            onClose={() => setOpen(false)}
          />
        </Activity>
      </Sheet>
    </div>
  )
}

function EditorForm({ value, onApply, onClose }: { value: BuilderConfig; onApply: (v: BuilderConfig) => void; onClose: () => void }) {
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
          <label htmlFor="table-editor-sheet">
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

        <div className="flex gap-2">
          <label htmlFor="table-editor-sheet">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </label>
          <label htmlFor="table-editor-sheet">
            <Button variant="primary" onClick={apply}>Save</Button>
          </label>
        </div>
      </Stack>
    </Box>
  )
}


