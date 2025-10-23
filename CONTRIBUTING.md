# Contributing Guide

This document describes the architecture, setup steps, and development workflows for the Offline CRM tables app.

## Architecture Overview (Clean Architecture)

```
apps/web/src/
├── application/                 # Use cases (business flows)
│   └── usecases.ts
├── domain/                      # Entities & repository contracts
│   ├── models.ts
│   └── repositories.ts
├── infrastructure/              # Implementations (Supabase, JSON, etc.)
│   ├── json/
│   │   └── JsonIO.ts
│   └── supabase/
│       └── SupabaseRepositories.ts
├── ui/                          # UI widgets (tanstack table wrapper)
│   └── TableGrid.tsx
├── components/                  # Screens
│   └── TableApp.tsx
├── pages/
│   └── TableManager.tsx
└── lib/
    └── supabaseClient.ts
```

- Domain layer is framework-agnostic (only types and interfaces).
- Application layer orchestrates domain repositories (use cases).
- Infrastructure layer provides Supabase-backed repositories and JSON I/O utilities.
- UI layer contains reusable grid components (tanstack/react-table).
- Screens/pages compose use cases and UI widgets.

## Supabase Setup

1) Create a project at Supabase
2) Open SQL Editor and run the normalized schema (once):

```sql
create extension if not exists "pgcrypto";

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint name_not_empty check (name <> '')
);

create table if not exists public.table_columns (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id) on delete cascade,
  key text not null,
  name text not null,
  type text not null default 'text',
  position int not null default 0,
  width int,
  meta jsonb not null default '{}',
  unique (table_id, key),
  unique (table_id, position)
);

create table if not exists public.table_rows (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id) on delete cascade,
  position int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (table_id, position)
);

create table if not exists public.table_cells (
  id uuid primary key default gen_random_uuid(),
  row_id uuid not null references public.table_rows(id) on delete cascade,
  column_id uuid not null references public.table_columns(id) on delete cascade,
  value jsonb,
  updated_at timestamptz default now(),
  unique (row_id, column_id)
);

create index if not exists idx_tables_name on public.tables(name);
create index if not exists idx_cols_table on public.table_columns(table_id, position);
create index if not exists idx_rows_table on public.table_rows(table_id, position);
create index if not exists idx_cells_row on public.table_cells(row_id);
create index if not exists idx_cells_col on public.table_cells(column_id);

alter table public.tables enable row level security;
alter table public.table_columns enable row level security;
alter table public.table_rows enable row level security;
alter table public.table_cells enable row level security;

create policy if not exists "tables_select_all" on public.tables for select using (true);
create policy if not exists "tables_ins_all"   on public.tables for insert with check (true);
create policy if not exists "tables_upd_all"   on public.tables for update using (true);
create policy if not exists "tables_del_all"   on public.tables for delete using (true);

create policy if not exists "cols_sel" on public.table_columns for select using (true);
create policy if not exists "cols_mut" on public.table_columns for all using (true) with check (true);

create policy if not exists "rows_sel" on public.table_rows for select using (true);
create policy if not exists "rows_mut" on public.table_rows for all using (true) with check (true);

create policy if not exists "cells_sel" on public.table_cells for select using (true);
create policy if not exists "cells_mut" on public.table_cells for all using (true) with check (true);

create or replace function update_ts() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists trg_tables_ts on public.tables;
create trigger trg_tables_ts before update on public.tables for each row execute function update_ts();

drop trigger if exists trg_rows_ts on public.table_rows;
create trigger trg_rows_ts before update on public.table_rows for each row execute function update_ts();

drop trigger if exists trg_cells_ts on public.table_cells;
create trigger trg_cells_ts before update on public.table_cells for each row execute function update_ts();
```

3) Settings → API → Exposed Schemas must include `public`.
4) Create `.env.local` in `apps/web`:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_KEY=<your-anon-key>
```

Restart dev server after changing env.

## Development

- Install deps at monorepo root: `bun install`
- Run dev: `cd apps/web && bun run dev`
- Type check: `bun run build` (includes TS checks)

### Adding features
- Add or modify use cases in `application/usecases.ts`.
- Extend repository interfaces in `domain/repositories.ts`.
- Implement infra in `infrastructure/*`.
- Use `ui/TableGrid.tsx` for grid features (sorting, filtering, pagination can be added via tanstack plugins and server-side queries).

### JSON Import/Export
- Normalized export (tables, columns, rows, cells): `SupabaseJsonIOService.exportNormalized(tableId)`
- Legacy export compatible with payload: `exportLegacyPayload(tableId)`
- Normalized/legacy imports create a new table and populate columns/rows/cells.

### Local Data Policy
- We avoid storing critical entities in localStorage. Export valuable data to JSON instead. Ephemeral UI state may still be kept client-side.

### Coding guidelines
- Use English in code comments.
- Keep domain pure and framework-agnostic.
- Avoid catching errors without surfacing actionable messages.
- Prefer small, composable use cases over massive services.

## Roadmap Notes
- Pagination: extend `RowsRepository.listRows` to fetch server-side pages.
- Filtering/Sorting: add server-side query parameters and tanstack state sync.
- Labels/Views: extend schema with `table_labels` and `table_row_labels` or a `views` table.
- Column types: widen `type` and add validators/renderers.
