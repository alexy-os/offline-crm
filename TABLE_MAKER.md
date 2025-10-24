## Maker — Table Builder (Product Specification)

This document describes the MVP of the Table Builder shown in the provided design (left feature toggles, search, sortable table, column visibility menu, pagination). The spec is written for engineers to implement using UI8Kit, TanStack Table, and the monorepo conventions.

### Goals

- Provide a DEV-only builder to configure interactive data tables for admin apps.
- Let users preview table behavior instantly (sorting, search, pagination, selection).
- Export generated artifacts the app can use directly:
  - UI component code (React + @tanstack/react-table + `@ui8kit/form` Table)
  - TypeScript types for the row shape
  - SQL for Supabase (normalized schema entries)

### Non-Goals (MVP)

- No server persistence of builder configs (may use local storage temporarily).
- No backend CRUD scaffolding beyond SQL for table/columns metadata.
- No advanced field editors (file upload, nested tables) in MVP.

## UX Overview

- Left rail: feature toggles rendered as pill buttons, each can be enabled/disabled:
  - Pagination, Sorting, Create, Edit, Delete, MultiDelete, Search
- Header row above table content:
  - Search input placeholder “Filter usernames…” (visible when Search is enabled)
  - “Columns” button to toggle column visibility panel
- Table: columns Name, Age, Gender, Email with sortable headers (when Sorting is enabled)
- Footer: pagination controls “Previous”/“Next” (when Pagination is enabled)

### Primary User Flows

1) Configure features
- Toggle features in the left rail. The preview immediately reflects the change.

2) Define columns
- Add, rename, change type of columns. The preview table updates live.

3) Preview interactions
- Search filters rows by a default column (e.g., “name”).
- Click headers to sort asc/desc/none.
- Toggle visible columns via “Columns” menu.
- When MultiDelete is enabled, a selection column appears with header and row checkboxes.

4) Export artifacts
- Copy or Download UI, Types, and SQL for use in the target app/backend.

## Functional Requirements

### Feature Toggles

- Pagination: Show page controls and use TanStack pagination row model.
- Sorting: Enable header sort handlers and show sort indicators.
- Search: Show a single search input that filters a designated column.
- Create/Edit/Delete: When enabled, the exported UI must expose handler props for CRUD workflows; in the preview, we may keep stubs or a simple dialog.
- MultiDelete: Enable row selection UI and aggregate delete action.
- Columns Panel: A “Columns” button opens a visibility panel listing all columns with checkboxes.

### Column Definition

- Each column has:
  - key: string (unique, used as accessorKey)
  - name: string (header label)
  - kind: one of: text | number | select | boolean | date
  - optional: required?: boolean
  - optional: options?: string[] (for select)

### Preview Table

- Built with `@tanstack/react-table` and `@ui8kit/form` `Table`, `TableHead`, `TableRow`, `TableCell`.
- Sorting, search, pagination, selection are enabled strictly via the toggles.
- The table preview uses sample data matching current column definitions.

### Export: UI Code

- Output a self-contained React component that:
  - Accepts `data` as props with generated row type
  - Configures `useReactTable` with the selected features
  - Renders `@ui8kit/form` table primitives
  - Includes column definitions based on builder configuration

### Export: Types

- Generate a TypeScript `Row` interface from the column definitions:

```ts
type ColumnKind = 'text' | 'number' | 'select' | 'boolean' | 'date'
export interface UsersRow {
  name: string
  age: number
  gender: string
  email: string
}
```

### Export: SQL (Supabase)

- We target the normalized schema described in CONTRIBUTING/`apps/web/supabase.sql`:
  - Insert one `tables` record with `name = tableName`
  - Insert one row per column into `table_columns` with `key`, `name`, `type`, `position`
- The generated SQL should not drop/create the normalized schema; it assumes the schema already exists.

### Copy/Download Actions

- Provide buttons to copy or download each artifact:
  - UI (e.g., `ui.tsx`)
  - Types (e.g., `types.ts`)
  - SQL (e.g., `schema.sql`)

## Data Model (Builder)

```ts
type ColumnKind = 'text' | 'number' | 'select' | 'boolean' | 'date'

interface BuilderColumn {
  key: string
  name: string
  kind: ColumnKind
  required?: boolean
  options?: string[]
}

interface BuilderFeatures {
  search: boolean
  sorting: boolean
  pagination: boolean
  create: boolean
  edit: boolean
  delete: boolean
  multiDelete: boolean
  columnsPanel: boolean
}

interface BuilderConfig {
  tableName: string
  columns: BuilderColumn[]
  features: BuilderFeatures
}
```

## Clean Architecture Placement

- Presentation: Builder UI (pages/components) under `apps/maker/src` using UI8Kit and TanStack.
- Domain: BuilderConfig types and validation are framework-agnostic.
- Application: Generation use-cases (UI/Types/SQL strings) as pure functions.
- Infrastructure: None required for MVP; optional local storage persistence.

## Visual & Theming

- Use `@ui8kit/core` primitives and tokens. No Radix/Shadcn components.
- Respect dark mode, rounded, spacing, and color tokens from the theme.

## Accessibility

- All interactive controls must be keyboard accessible and labeled.
- Search input has an associated label (visually hidden where appropriate).
- Column menu options are reachable via keyboard.
- Focus states respect `ring` tokens.

## Validation & Error States

- Column key uniqueness must be enforced at edit time.
- Disallow empty table name and empty column name.
- If export fails (e.g., clipboard API), show a non-blocking error message.

## Performance

- Keep preview dataset small in DEV.
- Avoid unnecessary re-renders (memoize columns).
- Future: support virtualization for large previews.

## Analytics/Telemetry (Optional, DEV-only)

- Track which features are frequently toggled to inform defaults.

## Acceptance Criteria

- Feature toggles immediately reflect in the preview (search/sort/pagination/selection).
- Column visibility can be changed via the Columns panel.
- Exports produce:
  - Valid TypeScript types matching current columns
  - A compilable React UI component using TanStack + UI8Kit
  - SQL statements inserting into `tables` and `table_columns`
- Copy to clipboard works in modern browsers; downloads create files with expected names.

## Future Extensions

- Per-column filter UIs and multi-field search.
- Column formatting (currency, date, chips), validation, and custom cell renderers.
- CRUD form generator using `@ui8kit/form` controls per column kind.
- Backend persistence for BuilderConfig and export bundles.


