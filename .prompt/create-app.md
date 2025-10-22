# Monorepo Setup with Git Submodule (Turbo + Vite SWC + Bun)

This manual shows how to create a fresh monorepo that uses a Git submodule for UI libraries, run a working Vite app (Hello World) that imports `@ui8kit/core/Button`, and maintain or remove the submodule cleanly.

Important: Cloning a repository that contains submodules will produce an empty directory for the submodule until you run:

```bash
git submodule update --init --recursive
```

## Prerequisites

- Git 2.40+
- Bun 1.1.30 (recommended)
- macOS/Linux/Windows with terminal access

## Target Structure

```
your-monorepo/
  apps/
    web/                   # Vite + React (SWC) app
  packages/
    @ui8kit/
      core/                # Git submodule: https://github.com/ui8kit/core
```

## 1) Initialize the Monorepo

```bash
mkdir your-monorepo && cd your-monorepo
git init

echo node_modules> .gitignore
echo dist>> .gitignore
echo build>> .gitignore

mkdir -p apps/web packages
```

## 2) Root Config Files

Create `package.json` in the repository root (aligns with provided example):

```json
{
  "name": "@ui8kit/workspace",
  "version": "0.0.1",
  "private": true,
  "license": "GPL-3.0",
  "type": "module",
  "author": {
    "name": "buildy",
    "url": "https://ui.buildy.tw"
  },
  "workspaces": [
    "apps/*",
    "packages/*",
    "packages/@ui8kit/*"
  ],
  "scripts": {
    "dev": "bunx turbo run dev",
    "build": "bunx turbo run build",
    "test": "bunx turbo run test",
    "lint": "bunx turbo run lint",
    "dev:web": "bunx turbo run dev --filter=./apps/web",
    "build:web": "bunx turbo run build --filter=./apps/web"
  },
  "packageManager": "bun@1.1.30",
  "devDependencies": {
    "turbo": "^2.5.6"
  }
}
```

Create `turbo.json` in the repository root:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    }
  }
}
```

Create base `tsconfig.json` in the repository root (paths align with submodule contents):

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Base TypeScript Config",
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "preserveWatchOutput": true,
    "composite": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@ui8kit/core": ["./packages/@ui8kit/core/src"],
      "@ui8kit/core/*": ["./packages/@ui8kit/core/src/*"]
    }
  },
  "exclude": ["node_modules", "dist", "build"]
}
```

## 3) Add the `@ui8kit` Submodule

Place the UI kit as a Git submodule at `packages/@ui8kit/core`:

```bash
git submodule add https://github.com/ui8kit/core.git packages/@ui8kit/core
git submodule update --init --recursive
```

Notes:

- If you cloned without `--recurse-submodules`, `packages/@ui8kit/core` will be empty until you run the update command above.
- To clone and populate submodules in one step, use: `git clone --recurse-submodules <repo-url>`.

## 4) Create the Vite App in `apps/web`

Create `apps/web/package.json` (aligned with the provided example):

```json
{
  "name": "@ui8kit/web",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ui8kit/core": "workspace:*",
  },
  "devDependencies": {
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.18",
    "class-variance-authority": "^0.7.0",
    "postcss": "^8.4.35",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}
```

Create `apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@ui8kit/core": ["../../packages/@ui8kit/core/src"],
      "@ui8kit/core/*": ["../../packages/@ui8kit/core/src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

Create `apps/web/vite.config.ts`:

```ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig(({ mode }) => {
  // loadEnv is imported but not used in this configuration, which is acceptable.
  // The 'mode' parameter is also not directly used in the returned config object, which is fine.

  return {
    plugins: [react()],
    resolve: {
      preserveSymlinks: true,
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ui8kit/core': path.resolve(__dirname, '../../packages/@ui8kit/core/src')
      }
    },
    server: { port: 5000 }
  }
})
```

Create `apps/web/src/main.tsx`:

```tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

Create a simple Hello World using `@ui8kit/core` at `apps/web/src/App.tsx`:

```tsx
import { Block, Container, Button, Title, Text, Stack } from '@ui8kit/core'
import { ThemeProvider, useTheme, lesseUITheme } from '@ui8kit/core' // skyOSTheme, modernUITheme, lesseUITheme

function AppContent() {
  const { toggleDarkMode, isDarkMode } = useTheme()

  return (
    <Block variant="section" py="xl">
      <Container>
      <Stack gap="lg" align="center" ta="center">
      <Title size="4xl">Welcome to UI8Kit</Title>
      <Text>Create beautiful web applications with ease using our UI components</Text>
        <Button variant={isDarkMode ? 'primary' : 'secondary'} onClick={toggleDarkMode}>
          {!isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </Button>
        </Stack>
      </Container>
    </Block>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={lesseUITheme}>
      <AppContent />
    </ThemeProvider>
  )
}
```

Create `apps/web/index.html`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>UI8Kit Web App Starter</title>
    <meta name="description" content="UI8Kit/Web - A smarty web application starter based on UI8Kit components">
    <meta name="keywords" content="UI8Kit, UI React Library, Web App React, UI8Kit Web App, UI8Kit React, React Web App Starter">
    <meta name="author" content="ui8kit">
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">
    <meta name="google" content="notranslate">
    <meta name="google" content="notranslate">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMGFlZDEiIHN0cm9rZS13aWR0aD0iMi4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1hdG9tLWljb24gbHVjaWRlLWF0b20iPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEiLz48cGF0aCBkPSJNMjAuMiAyMC4yYzIuMDQtMi4wMy4wMi03LjM2LTQuNS0xMS45LTQuNTQtNC41Mi05Ljg3LTYuNTQtMTEuOS00LjUtMi4wNCAyLjAzLS4wMiA3LjM2IDQuNSAxMS45IDQuNTQgNC41MiA5Ljg3IDYuNTQgMTEuOSA0LjVaIi8+PHBhdGggZD0iTTE1LjcgMTUuN2M0LjUyLTQuNTQgNi41NC05Ljg3IDQuNS0xMS45LTIuMDMtMi4wNC03LjM2LS4wMi0xMS45IDQuNS00LjUyIDQuNTQtNi41NCA5Ljg3LTQuNSAxMS45IDIuMDMgMi4wNCA3LjM2LjAyIDExLjktNC41WiIvPjwvc3ZnPg==" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
  </html>
```

Create `apps/web/tailwind.config.js`:

```js
/** @type {import('tailwindcss3').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/@ui8kit/core/src/**/*.{ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        serif: ['var(--font-serif)', 'serif'],
      },
      boxShadow: {
        '2xs': 'var(--shadow-2xs)',
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
      letterSpacing: {
        tighter: 'calc(var(--tracking-normal) - 0.05em)',
        tight: 'calc(var(--tracking-normal) - 0.025em)',
        normal: 'var(--tracking-normal)',
        wide: 'calc(var(--tracking-normal) + 0.025em)',
        wider: 'calc(var(--tracking-normal) + 0.05em)',
        widest: 'calc(var(--tracking-normal) + 0.1em)',
      },
      spacing: {
        'xs': 'calc(var(--spacing) * 1)',
        'sm': 'calc(var(--spacing) * 2)',
        'md': 'calc(var(--spacing) * 3)',
        'lg': 'calc(var(--spacing) * 4)',
        'xl': 'calc(var(--spacing) * 6)',
        '2xl': 'calc(var(--spacing) * 8)',
      },
    },
  },
  plugins: [],
}
```

Create `apps/web/postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```
Create `apps/web/src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Roboto:ital,wght@0,100..900;1,100..900&family=Fira+Code:wght@300..700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 97.2549%;
    --foreground: 240 3.3333% 11.7647%;
    --card: 0 0% 100%;
    --card-foreground: 240 3.3333% 11.7647%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 3.3333% 11.7647%;
    --primary: 187.4739 173.4032% 31.3580%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 94.1176%;
    --secondary-foreground: 0 0% 29.0196%;
    --muted: 0 0% 94.1176%;
    --muted-foreground: 240 2.2222% 44.1176%;
    --accent: 203.9916 96.5418% 93.6698%;
    --accent-foreground: 196.6949 85.4389% 14.5510%;
    --destructive: 358.7594 101.8439% 69.8357%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 87.8431%;
    --input: 0 0% 100%;
    --ring: 187.4739 173.4032% 31.3580%;
    --chart-1: 187.4739 173.4032% 31.3580%;
    --chart-2: 164.7862 160.6702% 31.9404%;
    --chart-3: 46.8179 100.7390% 59.5298%;
    --chart-4: 358.7594 101.8439% 69.8357%;
    --chart-5: 270.7222 110.5994% 75.2991%;
    --sidebar: 0 0% 100%;
    --sidebar-foreground: 0 0% 29.0196%;
    --sidebar-primary: 187.4739 173.4032% 31.3580%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 186.1272 175.0225% 34.5777%;
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-border: 0 0% 87.8431%;
    --sidebar-ring: 187.4739 173.4032% 31.3580%;
    --font-sans: Outfit, sans-serif;
    --font-serif: Roboto, sans-serif;
    --font-mono: Fira Code, monospace;
    --radius: 0.625rem;
    --shadow-2xs: 0 0 25px 5px hsl(0 0% 0% / 0.01);
    --shadow-xs: 0 0 25px 5px hsl(0 0% 0% / 0.01);
    --shadow-sm: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 1px 2px 4px hsl(0 0% 0% / 0.01);
    --shadow: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 1px 2px 4px hsl(0 0% 0% / 0.01);
    --shadow-md: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 2px 4px 4px hsl(0 0% 0% / 0.01);
    --shadow-lg: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 4px 6px 4px hsl(0 0% 0% / 0.01);
    --shadow-xl: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 8px 10px 4px hsl(0 0% 0% / 0.01);
    --shadow-2xl: 0 0 25px 5px hsl(0 0% 0% / 0.03);
    --tracking-normal: normal;
    --spacing: 0.25rem;
  }
  
  .dark {
    --background: 0 0% 7.0588%;
    --foreground: 0 0% 87.8431%;
    --card: 0 0% 11.7647%;
    --card-foreground: 0 0% 87.8431%;
    --popover: 0 0% 11.7647%;
    --popover-foreground: 0 0% 87.8431%;
    --primary: 189.9661 161.8632% 27.5935%;
    --primary-foreground: 183.1588 99.9180% 96.2486%;
    --secondary: 0 0% 16.4706%;
    --secondary-foreground: 0 0% 80%;
    --muted: 0 0% 16.4706%;
    --muted-foreground: 0 0% 62.7451%;
    --accent: 196.6949 85.4389% 14.5510%;
    --accent-foreground: 186.1272 175.0225% 34.5777%;
    --destructive: 358.7594 101.8439% 69.8357%;
    --destructive-foreground: 0 0% 100%;
    --border: 0 0% 20%;
    --input: 0 0% 11.7647%;
    --ring: 189.9661 161.8632% 27.5935%;
    --chart-1: 189.9661 161.8632% 27.5935%;
    --chart-2: 164.7862 160.6702% 31.9404%;
    --chart-3: 46.6817 159.6637% 38.5235%;
    --chart-4: 358.7594 101.8439% 69.8357%;
    --chart-5: 256.1554 109.0025% 76.8871%;
    --sidebar: 0 0% 11.7647%;
    --sidebar-foreground: 0 0% 80%;
    --sidebar-primary: 189.9661 161.8632% 27.5935%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 187.4739 173.4032% 31.3580%;
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-border: 0 0% 20%;
    --sidebar-ring: 189.9661 161.8632% 27.5935%;
    --font-sans: Outfit, sans-serif;
    --font-serif: Roboto, sans-serif;
    --font-mono: Fira Code, monospace;
    --radius: 0.625rem;
    --shadow-2xs: 0 0 25px 5px hsl(0 0% 0% / 0.01);
    --shadow-xs: 0 0 25px 5px hsl(0 0% 0% / 0.01);
    --shadow-sm: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 1px 2px 4px hsl(0 0% 0% / 0.01);
    --shadow: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 1px 2px 4px hsl(0 0% 0% / 0.01);
    --shadow-md: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 2px 4px 4px hsl(0 0% 0% / 0.01);
    --shadow-lg: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 4px 6px 4px hsl(0 0% 0% / 0.01);
    --shadow-xl: 0 0 25px 5px hsl(0 0% 0% / 0.01), 0 8px 10px 4px hsl(0 0% 0% / 0.01);
    --shadow-2xl: 0 0 25px 5px hsl(0 0% 0% / 0.03);
  }
}

/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE/Edge legacy */
}

@supports (scrollbar-width: none) {
  /* Firefox */
  .scrollbar-hide {
    scrollbar-width: none;
  }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

::-webkit-scrollbar {
  @apply w-1.5;
}

::-webkit-scrollbar-track {
  @apply bg-transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
  @apply bg-secondary rounded cursor-pointer;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  @apply bg-primary;
}
```

## 5) Install and Run

From the monorepo root:

```bash
bun install

# If submodule dir is empty after clone:
git submodule update --init --recursive

# Start all dev tasks (Turbo)
bun run dev

# Or start only the web app
bun run dev:web
```

Open `http://localhost:5000` and you should see a page with a "Welcome Page" title and an `@ui8kit/core` `<Button>`.

# Use case

## 6) Using the Submodule Like a Local Directory

- The submodule is used as if it were a regular directory inside the repo.
- Vite resolves the sources directly with `preserveSymlinks: true` and alias mapping to `../../packages/@ui8kit/*/src`.
- You can import components like normal:

```ts
import { Button } from '@ui8kit/core'
```

- From the app, the submodule path is reachable via `../../packages/@ui8kit/core/*`. 
- From the repo root, it is `./packages/@ui8kit/core/*`.

## 7) Daily Submodule Operations

- Update submodule to the latest on its default branch:

```bash
cd packages/@ui8kit/core
git fetch
git checkout main
git pull --ff-only
cd ../../
git add packages/@ui8kit/core
git commit -m "chore(submodule): bump @ui8kit/core to latest"
```

- Pull monorepo and update submodules to recorded commits:

```bash
git pull --recurse-submodules
git submodule update --init --recursive
```

- See submodule status:

```bash
git submodule status --recursive
```

## 8) Remove the Submodule Cleanly

If you need to remove `packages/@ui8kit/core` completely from Git tracking and your working tree:

```bash
# 1) De-initialize from Git config
git submodule deinit -f packages/@ui8kit/core

# 2) Remove the submodule entry from the index and working tree
git rm -f packages/@ui8kit/core

# 3) Remove the internal Git data for the submodule
rm -rf .git/modules/packages/@ui8kit/core/

# 4) (Optional) Clean any remaining references in .gitmodules (if present)
sed -i.bak "/packages\/@ui8kit\/core/,+2d" .gitmodules || true

# Commit the removal
git commit -m "chore: remove @ui8kit/core submodule"
```

What this accomplishes:
- Removed the submodule config from `.git/config` (via deinit)
- Deleted `.git/modules/packages/@ui8kit/core/` (internal Git data)
- Cleaned the Git index (removed submodule entry)
- Removed the working directory `packages/@ui8kit/core` (via `git rm`)

After this, `git submodule update --init --recursive` will work again, and the submodule is fully removed from version control.

## 9) Critical Notes and Best Practices for Git Submodules

- Clone correctly: Prefer `git clone --recurse-submodules` to avoid empty submodule directories.
- Commit the pointer: The parent repo tracks a specific commit of the submodule. When you update the submodule, commit the updated pointer in the parent repo.
- Avoid duplicate React copies: Ensure Vite `resolve.dedupe` includes `react` and `react-dom`, and set `preserveSymlinks: true`.
- Use workspace ranges: In the app `package.json`, depend on `@ui8kit/*` as `workspace:*` to use local sources directly.
- Align TS and Vite resolution: Mirror TS `paths` and Vite `alias` so IDE and bundler resolve the same sources.
- CI: Add `git submodule update --init --recursive` before install/build steps.
- Security: Submodules reference external repos. Pin to trusted branches/commits and review updates.
- Reproducibility: Use fixed Bun version (`bun@1.1.30`) and leverage Turbo for caching.

## 10) Quick Start (All Steps Together)

```bash
# 0) New repo
mkdir your-monorepo && cd your-monorepo && git init

# 1) Add configs (root package.json, turbo.json, tsconfig.json)
#    Create apps/web and packages directories

# 2) Add submodule
git submodule add https://github.com/ui8kit/core.git packages/@ui8kit/core
git submodule update --init --recursive

# 3) Create Vite app files under apps/web (package.json, tsconfig.json, vite.config.ts, index.html, src/*)

# 4) Install and run
bun install
bun run dev:web
```

## License

GPL-3.0