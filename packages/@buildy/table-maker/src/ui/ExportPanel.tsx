import { Box, Button, Stack, Text, Title } from '@ui8kit/core'
import { generateTypes, generateUI, generateSQLNormalized, type BuilderConfig } from '@buildy/builder-core'

export function ExportPanel({ config, rows }: { config: BuilderConfig; rows: any[] }) {
  const ui = generateUI(config)
  const types = generateTypes(config)
  const sql = generateSQLNormalized(config)
  const json = JSON.stringify(rows ?? [], null, 2)

  const download = (filename: string, content: string, type = 'text/plain') => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box p="md" bg="card">
      <Stack gap="md" p="sm">
        <Title size="lg">Export</Title>
        <Text size="sm" c="muted">Copy or download generated artifacts.</Text>
        <Stack gap="sm">
          <Button onClick={() => navigator.clipboard.writeText(ui)}>Copy UI</Button>
          <Button onClick={() => navigator.clipboard.writeText(types)}>Copy Types</Button>
          <Button onClick={() => navigator.clipboard.writeText(sql)}>Copy SQL</Button>
          <Button onClick={() => navigator.clipboard.writeText(json)}>Copy JSON</Button>
          <Button variant="secondary" onClick={() => download('ui.tsx', ui)}>Download UI</Button>
          <Button variant="secondary" onClick={() => download('types.ts', types)}>Download Types</Button>
          <Button variant="secondary" onClick={() => download('schema.sql', sql)}>Download SQL</Button>
          <Button variant="secondary" onClick={() => download('data.json', json, 'application/json')}>Download JSON</Button>
        </Stack>
      </Stack>
    </Box>
  )
}


