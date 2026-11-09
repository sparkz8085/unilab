# Universal Theme Toggle

A small React theme switcher with isolated `utg-` CSS classes. It supports light, dark and system preferences, localStorage persistence, keyboard arrows, touch swipes, configurable placement and idle opacity.

## Usage

```jsx
import ThemeToggle from './ThemeToggle';

export default function App() {
  return <ThemeToggle position="top-right" idleTimeout={3000} />;
}
```

## Props

| Prop | Default | Description |
|---|---|---|
| `defaultTheme` | `system` | `light`, `dark` or `system` |
| `position` | `top-right` | top-right, top-left, bottom-right, bottom-left |
| `idleTimeout` | `3000` | Milliseconds before idle state; 0 disables it |
| `idleOpacity` | `0.2` | Idle opacity, clamped to 0.1–0.8 |
| `size` | `medium` | small, medium or large |
| `onThemeChange` | — | Receives (preference, resolvedTheme) |
| `storageKey` | `universal-theme` | localStorage key |
| `showLabel` | `true` | Show current preference label |
| `className` | — | Optional wrapper class |

The component applies the resolved theme by toggling the `dark` class and `data-theme` on `document.documentElement`. Tailwind's `darkMode: 'class'` works out of the box. If integrating into an app with its own theme manager, use a unique `storageKey` and coordinate theme ownership to avoid competing controllers.

## Accessibility

The control is a native button with an accessible label, visible keyboard focus, left/right arrow shortcuts, touch swipe support and reduced-motion styles. Click cycles Light → Dark → System. Idle mode fades after the configured delay and interaction restores visibility.

## Styling

All selectors use the `utg-` prefix. No website branding, UI framework or icon dependency is required.
