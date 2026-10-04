# Normative Specification: User Interface & Presentation

This document is a normative specification using RFC 2119 language.

---

## 1. Design & Presentation Invariants

1. **Aesthetic Tone**: The UI MUST adhere to the **Calm Editorial Precision** design guidelines. Generic AI design tropes (gratuitous neon glows, status-chip soup, nested cards within cards, excessive animations) are strictly PROHIBITED.
2. **Citation Rendering**: Citations MUST be rendered as high-contrast, interactive numeric badges (`[^1]`). Clicking or hovering a citation MUST display a source preview card showing the authentic source title, page number, and exact quote.
3. **Accessibility**: All interactive elements MUST achieve WCAG 2.1 AA compliance (minimum 4.5:1 text contrast ratio, keyboard focus visibility, and ARIA labels on icon buttons).
4. **Responsive Layout**: The application layout MUST be fully responsive and functional on viewports ranging from 360px (mobile) to 2560px (ultra-wide) without horizontal layout breaking.
5. **Streaming Feedback**: Real-time token streaming MUST achieve smooth rendering with zero cumulative layout shift (CLS).
