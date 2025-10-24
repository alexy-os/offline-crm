import { Block, Box, Button, Stack, Title } from '@ui8kit/core'
import type { ReactNode } from 'react'

export function RightSheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  // Placeholder: use UI8Kit Sheet component in app context; here we expose a simple panel shell
  return (
    <Block component="aside" position="fixed" w="full" h="full" bg="card" shadow="lg" data-role="right-sheet">
      <Box p="md">
        <Stack gap="md" p="sm">
          <Title size="lg">{title}</Title>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <div>{children}</div>
        </Stack>
      </Box>
    </Block>
  )
}


