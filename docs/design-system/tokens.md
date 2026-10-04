# Debo Design Tokens Specification

This document defines the CSS variables, typography classes, and design tokens implemented in Tailwind CSS and Radix UI components in `@debo/ui`.

---

## 1. Color Palette Tokens

### Light Theme (Warm Paper)
- `--bg-canvas`: `#f9f9f8` (Warm off-white base)
- `--bg-surface`: `#ffffff` (Elevated cards and modal surfaces)
- `--bg-muted`: `#f0f0ed` (Subtle secondary containers)
- `--fg-primary`: `#181816` (Deep charcoal ink)
- `--fg-secondary`: `#5c5c57` (Readable slate body)
- `--fg-muted`: `#8a8a83` (Timestamps, metadata, labels)
- `--border-subtle`: `#e5e5e0` (1px hairlines)
- `--border-strong`: `#cfcfc8` (Input and focus borders)
- `--accent-primary`: `#2b5c56` (Deep spruce green accent)
- `--accent-highlight`: `#c76a3a` (Warm terracotta for citations and warnings)

### Dark Theme (Warm Obsidian)
- `--bg-canvas`: `#121211` (Deep warm black)
- `--bg-surface`: `#1a1a18` (Surface plinths)
- `--bg-muted`: `#242422` (Secondary containers)
- `--fg-primary`: `#f2f2ee` (High-contrast cream text)
- `--fg-secondary`: `#a8a8a0` (Secondary metadata)
- `--border-subtle`: `#2b2b28` (1px dark hairline)
- `--accent-primary`: `#4a8a81` (Muted teal accent)

---

## 2. Typography Hierarchy

Debo pairs a clean, contemporary sans-serif for reading and navigation with an engineering monospace for code, dates, chunk IDs, and citations:

- **Primary Sans**: `Albert Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
  - Body: `15px` / line-height `1.6`
  - Heading 1: `32px` / line-height `1.2` / font-weight `600`
  - Heading 2: `24px` / line-height `1.3` / font-weight `600`
  - Heading 3: `18px` / line-height `1.4` / font-weight `500`
- **Monospace & Metadata**: `JetBrains Mono`, `monospace`
  - Used for: Timestamps, byte sizes, chunk IDs, citation tags `[^1]`, code blocks, and keyboard shortcuts.
  - Scale: `12px` - `13px` / line-height `1.4`

---

## 3. Spacing & Rhythm

- Base unit: `4px` grid.
- Section rhythm: `64px` to `80px` between primary document sections.
- Component padding: `12px` (compact), `16px` (standard), `24px` (generous cards).
- Border radius: Subtly rounded corners (`6px` for buttons and inputs, `10px` for cards). Never use exaggerated pill shapes for rectangular content cards.

---

## 4. Breakpoints

- `sm`: `640px` (Mobile landscape)
- `md`: `768px` (Tablets / collapsed sidebar)
- `lg`: `1024px` (Standard desktop)
- `xl`: `1280px` (Wide desktop / dual-pane source viewer)
- `2xl`: `1536px` (Max container bound)
