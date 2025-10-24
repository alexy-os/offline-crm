import { useMemo, useState } from 'react'
import { Box, Button, Group, Stack, Title, Text } from '@ui8kit/core'
import { generateTypes, generateSQLNormalized, generateUI, type BuilderConfig } from '@buildy/builder-core'

export function SchemaPreview({ config, rows }: { config: BuilderConfig; rows: any[] }) {
  const [mode, setMode] = useState<'types' | 'sql' | 'json' | 'ui'>('types')

  const content = useMemo(() => {
    switch (mode) {
      case 'types':
        return generateTypes(config)
      case 'sql':
        return generateSQLNormalized(config)
      case 'ui':
        return generateUI(config)
      case 'json':
        return JSON.stringify(rows ?? [], null, 2)
    }
  }, [mode, config, rows])

  const filename = mode === 'types' ? 'types.ts' : mode === 'sql' ? 'schema.sql' : mode === 'ui' ? 'ui.tsx' : 'data.json'
  const mime = mode === 'json' ? 'application/json' : 'text/plain'

  const download = () => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box p="md" bg="card">
      <Stack gap="sm">
        <Title size="lg">Schema Preview</Title>
        <Group gap="sm" align="center">
          <Button variant={mode === 'types' ? 'primary' : 'secondary'} onClick={() => setMode('types')}>Types</Button>
          <Button variant={mode === 'sql' ? 'primary' : 'secondary'} onClick={() => setMode('sql')}>SQL</Button>
          <Button variant={mode === 'ui' ? 'primary' : 'secondary'} onClick={() => setMode('ui')}>UI</Button>
          <Button variant={mode === 'json' ? 'primary' : 'secondary'} onClick={() => setMode('json')}>JSON</Button>
          <Group gap="sm">
            <Button onClick={() => navigator.clipboard.writeText(content)}>Copy</Button>
            <Button variant="secondary" onClick={download}>Download</Button>
          </Group>
        </Group>
        <div className="rounded-md border bg-background overflow-auto max-h-[400px]">
          <pre className="text-xs p-3 whitespace-pre-wrap">
            <code>{content}</code>
          </pre>
        </div>
      </Stack>
    </Box>
  )
}


