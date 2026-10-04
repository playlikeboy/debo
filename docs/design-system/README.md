# Debo Editorial Design System

Debo's visual identity embodies **Calm Editorial Precision**. 
Personal context systems should feel like an exquisitely bound, quietly confident reference book—not an overwhelming, hyperactive sci-fi dashboard.

We incorporate principles from [Impeccable Design](https://impeccable.style) to eliminate common AI UI anti-patterns ("AI slop") and produce interfaces users are genuinely proud to work in every day.

---

## 1. Core Visual Principles

```text
┌─────────────────────────────────┬─────────────────────────────────┐
│     AVOID (AI Slop Tells)       │       EMBRACE (Debo Design)     │
├─────────────────────────────────┼─────────────────────────────────┤
│ Cluttered "status-chip soup"    │ Clear typographic hierarchy     │
│ Nested cards inside cards       │ Single-layer plinths & hairlines│
│ Generic purple/cyan AI gradients│ Warm paper, charcoal & slate    │
│ Over-animated bouncy buttons    │ Restful, instant micro-states   │
│ Unreferenced text assertions    │ Prominent, clickable citations  │
└─────────────────────────────────┴─────────────────────────────────┘
```

1. **Editorial Calm**: High-contrast typography paired with a warm, restful background canvas (`#f9f9f8` in light mode, `#141413` in dark mode) that reduces eye fatigue during long reading and writing sessions.
2. **Subtle Elevation & Hairlines**: Avoid blurry, exaggerated drop shadows. Structure content using 1px hairline dividers (`var(--border-subtle)`) and subtle surface tonal shifts.
3. **Citations as First-Class Citizens**: Citations are not footnotes hidden at the bottom of the page. They are styled as interactive, elegant inline numerals (`[^1]`) that trigger immediate, non-disruptive source preview drawers.
4. **Information Density with Breathing Room**: Balance dense data displays with generous 80px+ vertical rhythm between primary conceptual sections.

---

## 2. Directory Index

- **[Design Tokens & Typography](file:///home/kunalkashyap8024/sop/debo/docs/design-system/tokens.md)**:
  Color palettes, typography scale (Albert Sans & JetBrains Mono), spacing scale, and responsive breakpoints.
- **[Design Agent Guidelines](file:///home/kunalkashyap8024/sop/debo/docs/ai/design-agent-guidelines.md)**:
  Mandatory design heuristics and self-critique checklists for AI coding agents.
