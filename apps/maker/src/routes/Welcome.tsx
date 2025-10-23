import { Block, Box, Button, Container, Group, Stack, Text, Title } from '@ui8kit/core'

export default function Welcome() {
  const go = (path: string) => {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <Block component="section" py="xl">
      <Container>
        <Stack gap="lg">
          <Title size="3xl">Maker — Table Builder</Title>
          <Text c="muted">Build tables, CRUD forms, and export UI + schema + SQL.</Text>
          <Group gap="md">
            <Button variant="primary" onClick={() => go('/get-table')}>Start Table Builder</Button>
          </Group>
          <Box p="md" bg="card">
            <Text size="sm">Follow Clean Architecture and UI8Kit system. Backend: Supabase SQL from export.</Text>
          </Box>
        </Stack>
      </Container>
    </Block>
  )
}


