# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` -- start Vite dev server
- `npm run build` -- production build
- `npm run lint` -- ESLint (JS/JSX only; lint script hasn't been updated for TS yet)
- `npm run preview` -- preview production build

## Architecture

React + TypeScript app using @xyflow/react (v12) for node-based flow editing. Vite bundler, Tailwind CSS v4 (CSS-first config via `@tailwindcss/vite` plugin), dark mode by default.

**Entry flow:** `main.tsx` -> `DarkModeProvider` -> `App` (wrapped in `ReactFlowProvider`)

**App.tsx** is the core: registers custom node types, manages nodes/edges state, handles drag-and-drop from sidebar onto the canvas.

**Drag-and-drop pattern:** Sidebar sets `application/reactflow` data on drag start. App's `onDrop` reads the type and creates a new node at the drop position via `screenToFlowPosition`.

**Custom nodes** live in `src/components/nodes/`. Each is a `memo`-wrapped component using `Handle` from @xyflow/react. They share CSS classes defined in `src/styles/index.css` (`.custom-node`, `.node-input`, `.node-label`, `.node-title`).

**Node types registered in App.tsx:** `basic`, `input`, `output`, `decision`, `data`, `processing`. The sidebar (`NodesSidebar.tsx`) groups these into "Basic Nodes" and "Advanced Nodes" categories with search filtering.

## Key conventions

- Path alias: `@/` maps to `./src/` (configured in both vite.config.js and tsconfig.json)
- Tailwind v4 CSS-first: no `tailwind.config.js`. Directives (`@import "tailwindcss"`, `@custom-variant`, `@utility`) live in `src/styles/index.css`.
- Dark mode: managed via `DarkModeProvider` context + `.dark` class on `<html>`. `@custom-variant dark` in CSS. Variables in `index.css` define light/dark theme tokens.
- Styling is almost entirely custom CSS classes (BEM-style) using `hsl(var(--...))` custom properties. Very few Tailwind utility classes are used. The only custom utility is `custom-scroll` (defined via `@utility` in index.css).

## Known issues

- ESLint config references `.js,.jsx` extensions but codebase has migrated to TypeScript.
