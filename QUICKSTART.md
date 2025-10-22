# Quick Start Checklist

Follow these steps to get your Offline CRM running in minutes:

## 1️⃣ Supabase Setup (5 min)

- [ ] Go to [supabase.com](https://supabase.com) and create a free project
- [ ] In your project, go to **SQL Editor**
- [ ] Create a new query
- [ ] Paste contents from `apps/web/supabase.sql` and run it
- [ ] ✅ Database is ready!

## 2️⃣ Environment Configuration (2 min)

- [ ] Create file: `apps/web/.env.local`
- [ ] Get your credentials from Supabase **Settings > API**:
  - Copy **Project URL** → `VITE_SUPABASE_URL`
  - Copy **anon public key** → `VITE_SUPABASE_KEY`
- [ ] Paste into `.env.local`:
  ```env
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_KEY=eyJxxxxxxx
  ```
- [ ] ✅ Config complete!

## 3️⃣ Install & Run (5 min)

```bash
# Navigate to project
cd e:\_@Bun\@offline-crm

# Install all dependencies
bun install

# Start dev server
cd apps/web && bun run dev
```

- [ ] Open http://localhost:5000 in browser
- [ ] ✅ App is running!

## 4️⃣ Test It Out (3 min)

### Create a Table
- [ ] Click "Create New Table"
- [ ] Enter name: "Test" 
- [ ] Select 3 columns
- [ ] Click "Create Table"
- [ ] ✅ Table created in Supabase!

### Edit Data
- [ ] Click "Open" on your table
- [ ] Click any cell and type something
- [ ] Click another cell
- [ ] ✅ Changes saved automatically!

### Sync to Cloud
- [ ] Click "📤 Sync Push"
- [ ] You should see "Pushed table to Supabase"
- [ ] Go to Supabase > Tables > `public.tables` to verify
- [ ] ✅ Synced to cloud!

### Export for Backup
- [ ] Click "📥 Export JSON"
- [ ] File `Test.json` downloads
- [ ] ✅ Backed up!

## ✅ All Done! You're Ready to Use

**Features Available:**
- ✅ Create unlimited tables
- ✅ Edit cells inline
- ✅ Push to Supabase / Pull from Supabase
- ✅ Import/Export JSON
- ✅ Works offline with localStorage
- ✅ Beautiful UI with @ui8kit

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Table not found" error | Run SQL migration in Supabase SQL Editor |
| "No tables showing" | Refresh page, check browser console (F12) |
| Changes not saving | Check if localStorage is enabled (F12 > Application) |
| Can't push to Supabase | Verify `VITE_SUPABASE_KEY` in `.env.local` |

## 📚 Need More Help?

- Read full setup guide: `SETUP_GUIDE.md`
- See implementation details: `IMPLEMENTATION_SUMMARY.md`
- Check component code: `apps/web/src/`

## 🚀 Next Steps

After confirming everything works:

1. **Explore the UI** — Create a few test tables with different data
2. **Test Sync** — Edit locally, push to Supabase, pull it back
3. **Backup Data** — Export a table as JSON, then reimport it
4. **Read Docs** — Check `SETUP_GUIDE.md` for advanced features
5. **Deploy** — When ready: `bun run build`

---

**⏱️ Total Setup Time: ~15 minutes**

Once set up, the app works immediately—no more configuration needed! 🎉
