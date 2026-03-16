# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `bun dev` -- start Vite dev server
- `bun run build` -- production build
- `bun run lint` -- ESLint via flat config (`eslint.config.mjs`), covers `.js,.jsx,.ts,.tsx`
- `bun run preview` -- preview production build

## Architecture

React + TypeScript app using @xyflow/react (v12) for node-based flow editing. Vite bundler, Tailwind CSS v4 (CSS-first config via `@tailwindcss/vite` plugin), dark mode by default.

**Entry flow:** `main.tsx` -> `DarkModeProvider` -> `App` (wrapped in `ReactFlowProvider`)

**App.tsx** registers custom node types and composes the canvas UI. Drag-drop logic lives in `src/hooks/useFlowDragDrop.ts`; auto-layout and starter flow loading live in `src/hooks/useFlowLayout.ts`. App delegates all node/edge state to the Zustand store.

**State management:** `src/store/flowStore.ts` -- a Zustand store that owns nodes, edges, and all mutations (`addNode`, `onConnect`, `loadStarterFlow`, `clearCanvas`). Components consume it via `useFlowStore` selectors. Uses controlled mode (nodes/edges as props) intentionally for clarity; if performance degrades at scale, see the uncontrolled flow pattern in App.tsx comments.

**Drag-and-drop pattern:** Sidebar sets `application/reactflow` data on drag start. `useFlowDragDrop` reads the type and creates a new node at the drop position via `screenToFlowPosition`.

**Theme config:** `src/lib/themeConfig.ts` is the single source of truth for theme modes, theme presets (with swatch gradients), and per-preset grid colors. Both `NodesSidebar` and `App` import from it.

**Node catalog:** `src/lib/nodeCatalog.ts` is the single source of truth for node type definitions -- types, labels, icons (Lucide), categories, and default data. Both the sidebar and store import from it.

**Custom nodes** live in `src/components/nodes/`. Each is a `memo`-wrapped component using `Handle` from @xyflow/react. They all render through `NodeFrame.tsx`, a shared wrapper that provides the header (icon, title, remove button) and consistent styling.

**Node types registered in App.tsx:** `basic`, `input`, `output`, `decision`, `data`, `processing`. The sidebar (`NodesSidebar.tsx`) groups these into categories with search filtering.

**Key dependencies beyond React/ReactFlow:**
- `zustand` -- state management
- `elkjs` -- automatic graph layout
- `@radix-ui/react-select` -- accessible select components
- `lucide-react` -- icons used in node headers and UI

## Key conventions

- Path alias: `@/` maps to `./src/` (configured in both vite.config.js and tsconfig.json)
- Tailwind v4 CSS-first: no `tailwind.config.js`. Directives (`@import "tailwindcss"`, `@custom-variant`, `@utility`) live in `src/styles/index.css`.
- Dark mode: managed via `DarkModeProvider` context + `.dark` class on `<html>`. `@custom-variant dark` in CSS.
- Styling is almost entirely custom CSS classes (BEM-style) using `hsl(var(--...))` custom properties. Very few Tailwind utility classes are used. The only custom utility is `custom-scroll` (defined via `@utility` in index.css).
- CSS is split into focused modules imported from `src/styles/index.css`:
  - `base.css` -- CSS variables (`:root`, `.dark`, theme presets), typography reset
  - `app.css` -- `.app-shell` layout and glow effects
  - `sidebar.css` -- sidebar, stat cards, buttons, search, node library cards
  - `canvas.css` -- canvas topbar, chips, shortcuts, flow stage, empty state
  - `nodes.css` -- custom node frames, handles, inputs, edge remove buttons
  - `reactflow.css` -- ReactFlow control/minimap/attribution overrides, edge animations
  - `responsive.css` -- media query breakpoints (980px, 640px)
- Node components must use `NodeProps<FlowNodeData>` as their props type -- never bare `NodeProps` with `as any` casts. The `FlowNodeData` interface in `nodeCatalog.ts` defines all valid data fields.
