## Plan: Extract reusable packages from Maker (for offline CRM/CMS builders)

Goal: Keep the Maker app as a thin host and split reusable logic into two packages:
- @buildy/table-maker: UI/UX for table building and preview (TanStack + UI8Kit)
- @buildy/builder-core (proposed name): framework-agnostic core (schema, widgets, codegen, adapters, storage)

Rationale for the second package name
- "builder-core" reflects logic independent of tables and even UI: schema, widgets, exports, storage, and adapters. It can power forms, lists, or other data views.

---

What stays in apps/maker (host dev app)
- Pages: Welcome, Table Builder (get-table)
- Wiring the theme/layout (UI8Kit ThemeProvider + DashLayout)
- Demo-only state and sample data
- Composition of components exported by @buildy/table-maker
- No business logic (no codegen, widgets registry, or data engines here)

What goes to @buildy/table-maker (UI package)
- Feature Toggles Bar (top horizontal switches)
- Column Editor (keys, labels, kind selection)
- Right Sheet Panel (slide-over):
  - Column visibility manager
  - Row add/edit forms (use widgets from builder-core)
  - Future add-ons (column filters, column sizing)
- Preview Table (TanStack Table + @ui8kit/form Table): sorting, search, pagination, selection, column visibility, widgets rendering
- Export Panel: copy/download UI, Types, SQL (calls generator APIs from builder-core)
- React hooks for builder UI state (e.g., `useBuilderState`, `useRightSheet`)
- UI-only utilities (no schema/serialization/SQL inside this package)

What goes to @buildy/builder-core (framework-agnostic core)
- Types and schema
  - `BuilderConfig`, `BuilderColumn`, `ColumnKind`, `PrimitiveKind`, `WidgetKind`
  - Validation (zod or TS guards)
- Widgets system (pluggable)
  - `ColumnWidgetDefinition` contract: id, label, schema(meta), renderCell signature, editor contract, optional filter, serialize/deserialize
  - Built-ins: `tags`, `sheet`, `object`
  - Registry and registration API: `registerWidget`, `getWidget`, `listWidgets`
- Code generation
  - `generateTypes(config): string`
  - `generateUI(config): string` (target: TanStack + @ui8kit/form)
  - `generateSQLNormalized(config): string` (Supabase normalized model)
  - Pluggable targets (future): REST handlers, GraphQL SDL, etc.
- Import/Export
  - JSON import/export of BuilderConfig, dataset samples
- Adapters
  - Supabase (normalized) SQL adapter
  - Offline storage adapter (JSON/IndexedDB/Dexie) with simple CRUD for dev
- No React dependency; pure TypeScript where possible

---

Monorepo structure (proposed)

```
apps/
  maker/                 # host app, dev UX
packages/
  @buildy/
    table-maker/
      src/
        components/      # TogglesBar, ColumnEditor, RightSheet, PreviewTable, ExportPanel
        hooks/           # useBuilderState, useRightSheet
        index.ts
    builder-core/
      src/
        domain/          # types, schema, validation
        widgets/         # tags/, sheet/, object/, registry.ts
        codegen/         # types.ts, ui.tsx, sql.supabase.ts
        adapters/        # storage/offline, backend/supabase
        io/              # import-export json
        index.ts
```

Public APIs (first pass)
- @buildy/builder-core
  - Types: `BuilderConfig`, `BuilderColumn`, `ColumnKind`, `WidgetKind`, `PrimitiveKind`
  - Widgets: `registerWidget(def)`, `getWidget(id)`, `listWidgets()`
  - Codegen: `generateTypes(config)`, `generateUI(config)`, `generateSQLNormalized(config)`
  - IO: `exportConfig(config)`, `importConfig(json)`, `exportSampleData(rows)`, `importSampleData(json)`
  - Adapters: `createOfflineStore()`, `supabase.generateSQL(config)`
- @buildy/table-maker
  - `<TableBuilder />` high-level component (accepts `config`, emits `onConfigChange`)
  - `<PreviewTable />` (accepts `config`, `rows`, feature flags)
  - `<RightSheet />` and composables for editor panels
  - `<ExportPanel />` (uses builder-core codegen)
  - Hooks: `useBuilderState(initialConfig)`, `useRightSheet()`

Dependency direction
- apps/maker → @buildy/table-maker → @buildy/builder-core
- @buildy/builder-core has no dependency on React/UI libraries.

---

Milestones & sequencing
1) Extract domain types and validation into @buildy/builder-core
2) Implement widgets registry with three built-ins: `tags`, `sheet`, `object`
3) Move existing generators to builder-core; stabilize signatures (`generateTypes`, `generateUI`, `generateSQLNormalized`)
4) Add offline storage adapter (JSON in-memory + IndexedDB/Dexie); expose CRUD helpers for dev
5) Refactor Maker to use @buildy/table-maker consuming builder-core APIs
6) Implement Right Sheet-driven editors using widgets
7) Harden PreviewTable features (sorting/search/pagination/visibility/selection) with controlled state
8) Finalize export panel (copy/download); wire to codegen
9) Write README and usage examples for both packages
10) Version, build, and publish (workspace:*, peer deps: react for table-maker; none for builder-core)

Non-goals for the extraction phase
- Backend synchronization or conflict resolution (future CRDT/OT)
- Complex widgets beyond the initial three
- Server-side pagination/filters (can be added via adapters later)

Quality gates
- Type-safe public APIs, documented with examples
- No React in builder-core; no business logic in table-maker
- Unit tests for codegen and widgets serialization
- E2E smoke in apps/maker (page renders, toggles affect preview, exports succeed)

Offline-first considerations
- All generated UI must work with purely local stores (offline adapter)
- Exports should keep normalized SQL optional; JSON export always available
- BuilderConfig must be serializable and stable across versions (add version field)

Future directions
- More widgets (reference/lookup, attachments, rating, color, user)
- Server adapters (REST, GraphQL, direct Supabase client)
- Layout builders (forms/list views) backed by the same builder-core


