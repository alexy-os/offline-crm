# UI8Kit Starter App

A modern, clean, and efficient UI component library that combines the best of three worlds: shadcn/ui theming, Mantine-style props for consistency, and an 8px design grid system.

## 🎯 Philosophy

UI8Kit represents a refined approach to UI development that prioritizes **clarity over complexity**. Unlike many design systems that overwhelm with excessive gradients, complex animations, and decorative borders, UI8Kit focuses on delivering a pure, consistent design foundation.

### The Three Pillars

**🔧 shadcn/ui Theming**
- Modern CSS variables and HSL color system
- Tailwind CSS integration for responsive design
- Theme-aware components with automatic dark mode support
- Backward compatibility with older browsers supporting HSL

**📏 Mantine Props Consistency**
- Predictable and intuitive component APIs
- Consistent prop naming and behavior patterns
- TypeScript-first approach with comprehensive type safety
- Composability through well-defined component contracts

**🎨 8px Design Grid System**
- Consistent spacing scale based on 8px units
- Harmonious typography and sizing relationships
- Pixel-perfect alignment and spacing
- Scalable design system that maintains visual hierarchy

## ✨ Key Features

### 🎨 Clean Design System
- No excessive gradients or decorative elements
- Clean borders and subtle shadows only when necessary
- Focus on typography, spacing, and content hierarchy
- Minimalist approach that scales beautifully

### 🌙 Theme System
- Multiple built-in themes (LesseUI, ModernUI, SkyOS)
- Automatic dark/light mode switching
- CSS custom properties for easy customization
- Theme persistence in localStorage

### 🧩 Component Architecture
- **Core Components**: Button, Badge, Card, Container, Stack, Grid
- **Typography**: Title, Text with semantic sizing
- **Layout**: Block, Box, Group for flexible layouts
- **Interactive**: Sheet, Accordion, Image, Icon
- **Forms**: Input, Textarea, Select, Checkbox (via @ui8kit/form)

### 🚀 Advanced Features
- **Chat System** (@ui8kit/chat): AI-powered chat components with streaming
- **Form Management** (@ui8kit/form): Zod validation and auto-generated forms
- **Flow Components** (@ui8kit/flow): React Flow integration for diagrams
- **Brain Module** (@ui8kit/brain): AI and vector database integrations
- **Utility Hooks** (@ui8kit/hooks): Media queries, viewport detection, mobile detection

## 📦 Monorepo Architecture

Built with modern tooling optimized for Bun.js:

```json
{
  "workspaces": ["apps/*", "packages/*", "packages/@ui8kit/*"],
  "scripts": {
    "dev": "bunx turbo run dev",
    "build": "bunx turbo run build",
    "dev:web": "bunx turbo run dev --filter=./apps/web"
  }
}
```

### Turbo-powered Performance
- **Incremental builds** with intelligent caching
- **Parallel execution** across packages
- **Remote caching** for team collaboration
- **Workspace dependencies** with proper linking

### Git Submodules for Scalability
- Clean separation of concerns
- Independent versioning of UI packages
- Easy updates and maintenance
- Reduced bundle sizes through selective imports

## 🛠 Installation

### Prerequisites
- **Bun 1.1.30+** (recommended) or Node.js 18+
- **Git 2.40+** for submodule support

### Quick Start

```bash
# Clone the repository with submodules zero folder
git clone --recurse-submodules https://github.com/ui8kit/create-app.git .

# Or clone the repository with submodules into ui8kit-app/ folder
git clone --recurse-submodules https://github.com/ui8kit/create-app.git ui8kit-app
cd ui8kit-app

# If you forgot --recurse-submodules, initialize submodules manually
git submodule update --init --recursive

# Install dependencies
bun install

# Start development server
bun run dev:web
```

### Alternative Installation (Manual Submodule Setup)

```bash
# Clone the repository
git clone https://github.com/ui8kit/create-app.git ui8kit-app
cd ui8kit-app

# Add UI8Kit Core submodule
git submodule add https://github.com/ui8kit/core.git packages/@ui8kit/core

# Initialize and update submodules
git submodule update --init --recursive

# Install dependencies
bun install

# Start development server
bun run dev:web
```

## 🚀 Getting Started

### Basic Usage

```tsx
import { Block, Container, Button, Title, Text, Stack } from '@ui8kit/core'
import { ThemeProvider, useTheme } from '@ui8kit/core'
// Use skyOSTheme, modernUITheme or lesseUITheme
import { lesseUITheme } from '@ui8kit/core'

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

### Component Examples

```tsx
// Layout Components
<Block py="md" variant="section">
  <Container>
    <Grid cols={3} gap="md">
      <Card shadow="sm" p="md">
        <Title size="lg">Card Title</Title>
        <Text>Card content goes here</Text>
        <Button variant="primary" mt="md">Action</Button>
      </Card>
    </Grid>
  </Container>
</Block>
```

## 🎨 Theming & Customization

### Using Built-in Themes

```tsx
//import { lesseUITheme } from '@ui8kit/core'
//import { skyOSTheme } from '@ui8kit/core'
import { modernUITheme } from '@ui8kit/core'

// Switch between themes
<ThemeProvider theme={modernUITheme}>
  <App />
</ThemeProvider>
```

### Custom Theme Creation

```tsx
const customTheme = {
  name: "CustomTheme",
  rounded: {
    default: "xl" as const,
    button: "md" as const,
    badge: "full" as const
  },
  buttonSize: {
    default: "md" as const,
    badge: "xs" as const
  },
  isNavFixed: false
}
```

### CSS Variables Integration

UI8Kit uses CSS custom properties for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... more variables */
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 96%;
    /* ... dark mode variables */
  }
}
```

## 📚 Component API Reference

### Core Components

#### Button
```tsx
<Button
  variant="primary" | "secondary" | "outline" | "ghost" | "link" | "destructive"
  size="xs" | "sm" | "md" | "lg" | "xl" | "icon"
  rounded="none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
  loading={boolean}
  disabled={boolean}
  leftSection={<Icon />}
  rightSection={<Icon />}
  onClick={handler}
>
  Button Text
</Button>
```

#### Layout Components
- **Block**: Section container with variants
- **Container**: Max-width wrapper
- **Stack**: Vertical layout with gaps
- **Grid**: CSS Grid layout system
- **Group**: Horizontal flex layout

#### Typography
- **Title**: Semantic headings (h1-h6)
- **Text**: Paragraph and span text

### Advanced Packages

#### @ui8kit/form
- Form validation with Zod
- Auto-generated forms from schemas
- Input, Textarea, Select, Checkbox, Radio, Switch

#### @ui8kit/chat
- AI chat interfaces
- Streaming responses
- Multiple AI providers (OpenAI, OpenRouter)
- Message history and analytics

#### @ui8kit/brain
- Vector database integration (Qdrant)
- Graph database support (Neo4j)
- Document processing and RAG
- AI-powered search and retrieval

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
# Fork and clone the repository
git clone --recurse-submodules https://github.com/YOUR_USERNAME/ui8kit-app.git
cd ui8kit-app

# Install dependencies
bun install

# Start development
bun run dev

# Run tests
bun run test

# Build packages
bun run build
```

### Code Style & Guidelines

- **TypeScript First**: All components are fully typed
- **Consistent Props**: Follow Mantine-style prop patterns
- **Clean Architecture**: Separation of concerns between packages
- **Documentation**: Comprehensive JSDoc and examples
- **Testing**: Unit tests for all components

### Package Structure

```
packages/@ui8kit/
├── core/           # Core UI components
├── theme/          # Theme system
├── form/           # Form components
├── chat/           # Chat/AI components
├── flow/           # Flow/diagram components
├── brain/          # AI/brain functionality
└── hooks/          # Utility hooks
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Thanks for the ideas

- **shadcn/ui** for inspiration in creating themes
- **Mantine** for `props` approaches to component APIs
- **Tailwind CSS** for its `utility first` approach
- **React** and **TypeScript** for development experience
- **Bun** for lightning-fast execution speed

---

Built with ❤️ using modern web technologies. Clean, consistent, and performant UI components for the next generation of web applications.
