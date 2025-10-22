# Offline CRM — Setup & Usage Guide

This is an Airtable-like table management application built with React, @ui8kit components, and Supabase sync capabilities. It works offline as a PWA and syncs with Supabase when connected.

## Features

✅ **Create & Manage Tables** — Create tables directly in the app with customizable columns
✅ **Inline Cell Editing** — Edit cells in place without modal popups
✅ **JSON Import/Export** — Import tables from JSON files or export for backup
✅ **Supabase Sync** — Push/pull tables to/from Supabase for team collaboration
✅ **Offline First** — Works completely offline using localStorage
✅ **Modern UI** — Built with @ui8kit components for beautiful, consistent design

## Prerequisites

- Node.js 18+ installed
- Supabase project with a free tier account
- Git

## Step 1: Setup Supabase Database

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Go to the **SQL Editor** section
4. Create a new query and copy the entire contents of `apps/web/supabase.sql`
5. Run the SQL to create the `tables` table and enable Row Level Security (RLS)

```sql
-- This will create:
-- - public.tables table with payload storage
-- - Automatic updated_at timestamps
-- - RLS policies for security
-- - Index on table name for fast lookups
```

## Step 2: Configure Environment Variables

1. In your Supabase project, go to **Settings > API**
2. Copy your **Supabase URL** and **Supabase Key** (anon public key)
3. Create or update `.env.local` in the `apps/web` folder:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here
```

⚠️ **Important**: The Supabase Key is intentionally public (anon key). For production, implement proper authentication and RLS policies.

## Step 3: Install Dependencies & Run

```bash
# Install all dependencies across the monorepo
bun install

# Start the development server
cd apps/web
bun run dev

# The app will be available at http://localhost:5000
```

## Usage

### Creating a Table

1. Click **"Create New Table"** on the home page
2. Enter a table name (must be unique)
3. Select number of columns (A, B, C, ... Z)
4. Click **Create Table**

### Editing Data

1. Click **Open** next to any table to view it
2. Click on any cell and type to edit inline
3. Changes are automatically saved to localStorage

### Syncing with Supabase

#### Push to Supabase (Upload)
```
📤 Sync Push
```
Uploads your local changes to Supabase. Creates the table if it doesn't exist, updates if it does.

#### Pull from Supabase (Download)
```
📥 Sync Pull
```
Downloads the latest version from Supabase, overwriting local changes.

### Import/Export

#### Export Table as JSON
```
📥 Export JSON
```
Downloads your table as a `.json` file for backup or sharing.

#### Import from JSON
```
📤 Import JSON
```
Select a previously exported JSON file to import data.

## Architecture

```
apps/web/
├── src/
│   ├── components/
│   │   └── TableApp.tsx          # Main table editor component
│   ├── pages/
│   │   └── TableManager.tsx       # Table list & creation page
│   ├── lib/
│   │   └── supabaseClient.ts      # Supabase initialization
│   ├── App.tsx                    # Router & app shell
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── supabase.sql                   # Database schema
├── vite.config.ts                 # Vite configuration
└── package.json

packages/@ui8kit/
├── core/                          # UI components (Button, Card, etc.)
└── form/                          # Form components (Table, Input, etc.)
```

## Data Schema

Tables are stored in Supabase with the following structure:

```typescript
{
  id: UUID                    // Unique identifier
  name: string               // Table name (unique)
  payload: {
    name: string             // Table name
    columns: string[]        // Column identifiers (A, B, C, ...)
    rows: Record[]           // Array of row objects
    updated_at?: string
  }
  created_at: timestamp      // Automatically set
  updated_at: timestamp      // Automatically updated
  created_by: UUID           // Optional user ID
}
```

## Example JSON Format

```json
{
  "name": "Contacts",
  "columns": ["Name", "Email", "Phone"],
  "rows": [
    { "Name": "John Doe", "Email": "john@example.com", "Phone": "555-1234" },
    { "Name": "Jane Smith", "Email": "jane@example.com", "Phone": "555-5678" }
  ]
}
```

## Offline Sync Strategy

1. **Local Storage** — All edits are saved locally to `localStorage`
2. **Push** — Click "Sync Push" when ready to upload to Supabase
3. **Pull** — Click "Sync Pull" to download remote changes
4. **Conflict Resolution** — Last write wins (simple CRDT approach can be added later)

## Troubleshooting

### Error: "Could not find the table 'public.tables'"
**Solution**: Run the SQL migration from `apps/web/supabase.sql` in your Supabase SQL Editor

### Error: "Supabase Key not configured"
**Solution**: Check your `.env.local` file has `VITE_SUPABASE_KEY` set correctly

### Changes not syncing
**Solution**: 
- Check browser console (F12) for errors
- Verify Supabase connection is working
- Ensure table exists in Supabase (create one via the app first)

### PWA Offline Mode
Currently, the app uses localStorage for offline support. To add full PWA capabilities:
1. Configure `vite.config.ts` with PWA plugin
2. Add `public/manifest.json` for installable PWA
3. Implement service worker for automatic sync queue

## Next Steps

- [ ] Add filtering and sorting UI
- [ ] Implement row selection and bulk operations
- [ ] Add column customization (rename, type, etc.)
- [ ] Implement conflict resolution for concurrent edits
- [ ] Convert to full PWA with service worker
- [ ] Add user authentication via Supabase Auth
- [ ] Implement real-time sync using Supabase subscriptions

## License

See LICENSE.md in the root directory.
