import { Button, Group } from '@ui8kit/core'
import type { BuilderFeatures } from '@buildy/builder-core'

type FeatureKey = keyof BuilderFeatures

const orderedKeys: FeatureKey[] = [
  'pagination',
  'sorting',
  'create',
  'edit',
  'delete',
  'multiDelete',
  'search',
  // columnsPanel is intentionally omitted from the Top toggles
]

const labels: Record<FeatureKey, string> = {
  pagination: 'Pagination',
  sorting: 'Sorting',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  multiDelete: 'MultiDelete',
  search: 'Search',
  columnsPanel: 'Columns',
}

export function TogglesBar({ features, onChange }: { features: BuilderFeatures; onChange: (next: BuilderFeatures) => void }) {
  const toggle = (key: FeatureKey) => {
    if (!(key in features)) return
    onChange({ ...features, [key]: !features[key] })
  }

  return (
    <Group gap="sm" wrap="wrap">
      {orderedKeys.map((key) => (
        <Button key={key} variant={features[key] ? 'primary' : 'secondary'} onClick={() => toggle(key)}>
          {labels[key]}
        </Button>
      ))}
    </Group>
  )
}


