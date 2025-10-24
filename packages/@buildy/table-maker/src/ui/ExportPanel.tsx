import { Box, Button, Stack, Text, Title } from '@ui8kit/core'
import { generateTypes, generateUI, generateSQLNormalized, type BuilderConfig } from '@buildy/builder-core'

export function ExportPanel({ config }: { config: BuilderConfig }) {
  const ui = generateUI(config)
  const types = generateTypes(config)
  const sql = generateSQLNormalized(config)

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
      <Stack gap="md">
        <Title size="lg">Export</Title>
        <Text size="sm" c="muted">Copy or download generated artifacts.</Text>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => navigator.clipboard.writeText(ui)}>Copy UI</Button>
          <Button onClick={() => navigator.clipboard.writeText(types)}>Copy Types</Button>
          <Button onClick={() => navigator.clipboard.writeText(sql)}>Copy SQL</Button>
          <Button variant="secondary" onClick={() => download('ui.tsx', ui)}>Download UI</Button>
          <Button variant="secondary" onClick={() => download('types.ts', types)}>Download Types</Button>
          <Button variant="secondary" onClick={() => download('schema.sql', sql)}>Download SQL</Button>
        </div>
      </Stack>
    </Box>
  )
}


