-- See apps/web/supabase.sql in the repo
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{"name":"","columns":[],"rows":[]}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT name_not_empty CHECK (name != '')
);
CREATE INDEX IF NOT EXISTS idx_tables_name ON public.tables(name);
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all users to read tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Allow users to insert tables" ON public.tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update tables" ON public.tables FOR UPDATE USING (true);
CREATE POLICY "Allow users to delete tables" ON public.tables FOR DELETE USING (true);
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_tables_updated_at ON public.tables;
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
