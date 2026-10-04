# Design Agent Guidelines: Crafting Impeccable Interfaces

When an AI coding agent builds or modifies UI components in Debo, it must adhere to these professional design heuristics to avoid "AI slop" and maintain our editorial standards.

---

## 1. How to Avoid the 6 "AI Slop" Tells

1. **The "AI Beige" Syndrome**: Do not slap washed-out beige or generic gradient cards across every container. Use intentional tonal contrast between `--bg-canvas` and `--bg-surface`.
2. **Status-Chip Soup**: Avoid placing colored badges and status pills next to every single row or heading. If every item has a glowing green badge, nothing is important. Rely on quiet typography and position to communicate state.
3. **Cards in Cards in Cards**: Do not nest rectangular containers inside each other. Flatten the hierarchy. Use subtle 1px divider lines (`--border-subtle`) instead of stacking borders.
4. **Gratuitous Animations**: Avoid bouncy spring physics on buttons and floating cards. Transitions should be fast (100-150ms ease-out) and purposeful.
5. **The Italic Serif Trap**: Do not arbitrarily italicize headings to appear "classy" or "editorial". Use standard weighted grotesque or geometric sans with tight tracking (`tracking-tight`).
6. **Cramped Padding**: Give elements breathing room. When in doubt, increase padding from `p-3` to `p-5` and increase line-height to `leading-relaxed`.

---

## 2. Agent Self-Critique Checklist Before Shipping UI

Before proposing or finalizing any React component or page, ask:

- [ ] **Hierarchy Test**: Can a user scan this page in 3 seconds and immediately identify the primary action and the most important data point?
- [ ] **The "Squint Test"**: If you blur your eyes, does the screen look like a disorganized blob of gray rectangles, or does a crisp rhythm of headings and content emerge?
- [ ] **Source Visibility**: Are citations and references clearly distinct from ordinary text, and do they provide instant feedback on hover/click?
- [ ] **Accessibility (a11y)**:
  - Do text elements meet WCAG AA contrast (minimum 4.5:1 for body text)?
  - Are buttons and interactive elements keyboard focusable with a clear focus ring?
  - Do icon-only buttons include `aria-label` attributes?
- [ ] **Responsive Integrity**: Does this view function without horizontal scrolling down to 360px viewport width?
- [ ] **Empty State Dignity**: If the list has 0 items, does the empty state provide a helpful, calm explanation and a clear next step, rather than an awkward blank void?

---

## 3. Integrating with the `impeccable` Skill

When assigned a complex UI overhaul, load and execute the `.agents/skills/impeccable/SKILL.md` skill:
- Run `/distill` to find the true visual hierarchy.
- Run `/polish` to eliminate AI tells and tighten token spacing.
- Run `/clarify` to make user action flows unambiguous.
