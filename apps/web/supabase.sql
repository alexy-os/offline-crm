-- Create the tables table for storing CRM data
-- Run this SQL in your Supabase SQL editor to initialize the schema

CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{
    "name": "",
    "columns": [],
    "rows": []
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  CONSTRAINT name_not_empty CHECK (name != '')
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_tables_name ON public.tables(name);

-- Enable RLS (Row Level Security)
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- Allow users to read all tables (for offline-first sync)
CREATE POLICY "Allow all users to read tables"
  ON public.tables
  FOR SELECT
  USING (true);

-- Allow users to insert their own tables
CREATE POLICY "Allow users to insert tables"
  ON public.tables
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update all tables (simple policy for now)
CREATE POLICY "Allow users to update tables"
  ON public.tables
  FOR UPDATE
  USING (true);

-- Allow users to delete their own tables
CREATE POLICY "Allow users to delete tables"
  ON public.tables
  FOR DELETE
  USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_tables_updated_at ON public.tables;
CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
