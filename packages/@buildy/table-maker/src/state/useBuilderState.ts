import { useMemo, useState } from 'react'
import type { BuilderConfig } from '@buildy/builder-core'

export function useBuilderState(initial: BuilderConfig) {
  const [config, setConfig] = useState<BuilderConfig>(initial)
  const api = useMemo(() => ({
    setTableName: (name: string) => setConfig((c) => ({ ...c, tableName: name })),
    setColumns: (fn: (cols: BuilderConfig['columns']) => BuilderConfig['columns']) =>
      setConfig((c) => ({ ...c, columns: fn(c.columns) })),
    setFeatures: (fn: (f: BuilderConfig['features']) => BuilderConfig['features']) =>
      setConfig((c) => ({ ...c, features: fn(c.features) })),
  }), [])
  return { config, setConfig, api }
}


