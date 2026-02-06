## 2024-05-23 - Accessibility Pattern: Semantic Buttons
**Learning:** Found critical accessibility anti-pattern where interactive elements (like the Copy button) were implemented as clickable `div`s without keyboard support or ARIA labels.
**Action:** When auditing components, prioritize checking `components/common` for semantic validity. Refactor `div` wrappers to `<button>` tags with explicit `type="button"` and `aria-label`.

## 2024-05-24 - Accessibility Pattern: Fake Disabled State
**Learning:** Components often use CSS classes (e.g. `.disable`) to visually disable elements without setting the `disabled` attribute, breaking accessibility for screen readers and keyboard users.
**Action:** Replace `.disable` classes with `disabled` attribute and `:disabled` pseudo-class styles.

## 2024-05-25 - UX Pattern: Meaningful Empty States
**Learning:** The application relied on minimal text strings (e.g., "Bhero not found") for empty states, which are easy to miss and provide no guidance or visual feedback.
**Action:** Implemented a reusable `EmptyState` component with `role="status"` and a visual icon. Future list components should always import and use this component instead of raw text when data length is 0.

## 2024-05-26 - UX Pattern: Ghost Features
**Learning:** Found a fully implemented "Card View" feature that was unreachable because the UI toggle was missing from the view configuration array.
**Action:** When auditing views, verify that all imported components and features are actually accessible in the UI. Re-enabling these features can provide quick UX wins.
