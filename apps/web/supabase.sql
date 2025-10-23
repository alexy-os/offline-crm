-- Normalized schema for scalable spreadsheets
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

drop policy if exists "tables_select_all" on public.tables;
create policy "tables_select_all" on public.tables for select using (true);
drop policy if exists "tables_ins_all" on public.tables;
create policy "tables_ins_all"   on public.tables for insert with check (true);
drop policy if exists "tables_upd_all" on public.tables;
create policy "tables_upd_all"   on public.tables for update using (true);
drop policy if exists "tables_del_all" on public.tables;
create policy "tables_del_all"   on public.tables for delete using (true);

drop policy if exists "cols_sel" on public.table_columns;
create policy "cols_sel" on public.table_columns for select using (true);
drop policy if exists "cols_mut" on public.table_columns;
create policy "cols_mut" on public.table_columns for all using (true) with check (true);

drop policy if exists "rows_sel" on public.table_rows;
create policy "rows_sel" on public.table_rows for select using (true);
drop policy if exists "rows_mut" on public.table_rows;
create policy "rows_mut" on public.table_rows for all using (true) with check (true);

drop policy if exists "cells_sel" on public.table_cells;
create policy "cells_sel" on public.table_cells for select using (true);
drop policy if exists "cells_mut" on public.table_cells;
create policy "cells_mut" on public.table_cells for all using (true) with check (true);

create or replace function update_ts() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists trg_tables_ts on public.tables;
create trigger trg_tables_ts before update on public.tables for each row execute function update_ts();

drop trigger if exists trg_rows_ts on public.table_rows;
create trigger trg_rows_ts before update on public.table_rows for each row execute function update_ts();

drop trigger if exists trg_cells_ts on public.table_cells;
create trigger trg_cells_ts before update on public.table_cells for each row execute function update_ts();
