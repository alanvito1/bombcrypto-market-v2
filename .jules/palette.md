## 2024-05-23 - Accessibility Pattern: Semantic Buttons
**Learning:** Found critical accessibility anti-pattern where interactive elements (like the Copy button) were implemented as clickable `div`s without keyboard support or ARIA labels.
**Action:** When auditing components, prioritize checking `components/common` for semantic validity. Refactor `div` wrappers to `<button>` tags with explicit `type="button"` and `aria-label`.

## 2024-05-24 - Accessibility Pattern: Fake Disabled State
**Learning:** Components often use CSS classes (e.g. `.disable`) to visually disable elements without setting the `disabled` attribute, breaking accessibility for screen readers and keyboard users.
**Action:** Replace `.disable` classes with `disabled` attribute and `:disabled` pseudo-class styles.
