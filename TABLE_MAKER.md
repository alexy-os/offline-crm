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

- Top toggles: a horizontal list of toggle buttons above the builder form and table preview:
  - Pagination, Sorting, Create, Edit, Delete, MultiDelete, Search
- Right Sheet panel: a slide-over panel for add-ons and editors (opens from the right):
  - Column visibility manager, per-row editor, add-row form, and future extensions
- Header area above table content:
  - Search input placeholder “Filter usernames…” (visible when Search is enabled)
  - “Columns” button opens the Right Sheet with column visibility controls
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
- Toggle visible columns via “Columns” button → Right Sheet.
- When MultiDelete is enabled, a selection column appears with header and row checkboxes.

4) Add/Edit/Delete rows
- Add Row opens the Right Sheet with a dynamic form built from column types.
- Edit Row opens the Right Sheet with the same dynamic form populated with row values.
- Delete Row action is available per-row; MultiDelete aggregates selected rows.

5) Export artifacts
- Copy or Download UI, Types, and SQL for use in the target app/backend.

## Functional Requirements

### Feature Toggles

- Pagination: Show page controls and use TanStack pagination row model.
- Sorting: Enable header sort handlers and show sort indicators.
- Search: Show a single search input that filters a designated column.
- Create/Edit/Delete: When enabled, the exported UI must expose handler props for CRUD workflows; in the preview, we may keep stubs or a simple dialog.
- MultiDelete: Enable row selection UI and aggregate delete action.
- Columns Panel: A “Columns” button opens a visibility panel listing all columns with checkboxes.

### Row Add/Delete (MVP)

- Add Row: top-right button in the header group; opens Right Sheet with generated form.
- Edit Row: per-row action; opens Right Sheet with the same form and current row data.
- Delete Row: per-row action; confirmation in-sheet.
- MultiDelete: bulk action enabled when any rows are selected.

Generated UI must surface `onCreate`, `onUpdate`, `onDelete`, and `onMultiDelete` props so host apps can wire data sources (JSON, Supabase, etc.).

### Column Widgets (Extensible Cell Types)

- Concept: a “widget” is a column type that controls cell rendering, editing UI, filtering UI, and data serialization.
- Separation of concerns:
  - Table = TanStack Table + `@ui8kit/form` primitives (sorting, filtering, pagination, selection, visibility)
  - Widgets = pluggable renderers and editors for cells/filters

MVP widgets available in the Builder:
- tags: multiple labels/tags chip set; editor is a multi-select; value is an array in JSON (stored in `table_cells.value` jsonb)
- sheet: renders a button in the cell; clicking opens the Right Sheet with configurable content (e.g., row inspector/editor)
- object: displays a compact JSON preview; editor is a JSON textarea/viewer; value stored as JSON in `table_cells.value`

Notes:
- Primitive kinds (text, number, boolean, date, select) remain supported for simple columns.
- Widgets are first-class `ColumnKind` values; SQL export writes the `type` equal to the widget id (e.g., `tags`, `sheet`, `object`).
- For select and tags, we may attach options metadata on the column (`meta.options`).

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
 - For widget columns, preview uses the widget renderers; editing opens the Right Sheet.

### Export: UI Code

- Output a self-contained React component that:
  - Accepts `data` as props with generated row type
  - Configures `useReactTable` with the selected features
  - Renders `@ui8kit/form` table primitives
  - Includes column definitions based on builder configuration
 - Wires widget renderers for `ColumnDef.cell` and editors via a Right Sheet

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

Updated for widgets:

```ts
type PrimitiveKind = 'text' | 'number' | 'select' | 'boolean' | 'date'
type WidgetKind = 'tags' | 'sheet' | 'object'
type ColumnKind = PrimitiveKind | WidgetKind
```

### Export: SQL (Supabase)

- We target the normalized schema described in CONTRIBUTING/`apps/web/supabase.sql`:
  - Insert one `tables` record with `name = tableName`
  - Insert one row per column into `table_columns` with `key`, `name`, `type`, `position`
- The generated SQL should not drop/create the normalized schema; it assumes the schema already exists.
 - Widget type is written to `table_columns.type` as its id (`tags`, `sheet`, `object`). Cell values are stored in `table_cells.value` (jsonb), allowing arrays/objects for tags/object. The `sheet` widget stores no value by itself unless configured.

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
  kind: ColumnKind // supports both primitive kinds and widget kinds
  required?: boolean
  options?: string[] // for select/tags
  meta?: Record<string, unknown> // widget-specific metadata
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

### Widget Architecture for Scale

- Domain contract:
  - `ColumnWidgetDefinition` with: `id`, `label`, `schema` (column meta validation), `renderCell`, `renderEditor`, optional `renderFilter`, and `serialize`/`deserialize` strategies.
- Registry:
  - `widgets/index.ts` exports a registry map; the Builder lists available widgets from the registry.
- Codegen:
  - ColumnDef includes `cell` using the widget renderer; editors live in a Right Sheet.
  - Types derive from widget contracts (e.g., `tags` → `string[]`, `object` → `Record<string, unknown>`).
- Server adapters (future):
  - Map widget values to backend fields (jsonb, arrays, relations) per adapter (Supabase, REST).

## Visual & Theming

- Use `@ui8kit/core` primitives and tokens. No Radix/Shadcn components.
- Respect dark mode, rounded, spacing, and color tokens from the theme.

## Accessibility

- All interactive controls must be keyboard accessible and labeled.
- Search input has an associated label (visually hidden where appropriate).
- Column menu options are reachable via keyboard.
- Focus states respect `ring` tokens.
 - Right Sheet must trap focus and restore it on close.

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
- Feature toggles live above the form/preview and immediately reflect in the table (search/sort/pagination/selection).
- Column visibility is managed via the Right Sheet panel.
- Add Row and Edit Row use the Right Sheet with a generated form matching column kinds and widgets.
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

## Appendix — jQuery DataTables → TanStack Table Mapping (What to Adopt)

- Sorting: built-in sorting state → `getSortedRowModel` with header toggle handlers.
- Global search and column filters: global input + optional per-column filter UIs → `getFilteredRowModel` and column filterFns.
- Pagination: client/server pagination → `getPaginationRowModel` or server adapter.
- Column visibility: show/hide columns → `column.getIsVisible()`, `toggleVisibility` (exposed in Right Sheet).
- Column sizing/reorder: optional in MVP; available via TanStack column sizing and ordering.
- Row selection: single/multi select → `rowSelection` state and checkbox column; bulk actions (MultiDelete).
- Fixed header/responsive: handle with CSS and container layout (UI8Kit primitives). Virtualization optional via `@tanstack/react-virtual`.
- Export buttons (CSV/Excel/Print): considered future extension; Builder focuses on code/types/SQL export.
- Inline editing (DataTables Editor): adopt as Right Sheet editing to keep layout stable and accessible.


