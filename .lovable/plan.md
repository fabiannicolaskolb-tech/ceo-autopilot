

# GlowingEffect Component Integration

## Overview

Install the `GlowingEffect` component and apply it to all Card-based boxes across the Dashboard and Analytics pages.

## Problem: Stripped JSX

The provided component code has its JSX tags stripped. I will reconstruct the full `GlowingEffect` component based on the known CSS custom property logic and conic-gradient pattern used in the original implementation.

## Dependencies

- Install `motion` npm package (provides `motion/react` imports)

## New File: `src/components/ui/glowing-effect.tsx`

The component renders two overlapping divs with a `conic-gradient` border effect that follows mouse position using CSS custom properties (`--start`, `--active`, `--blur`, `--spread`, `--borderWidth`). The glow color adapts based on the `variant` prop (default = colored, white = white glow).

## Changes to Apply Glow to All Cards

Each Card that should glow needs to be wrapped in a `relative` container with the `GlowingEffect` component as a sibling. The pattern:

```tsx
<div className="relative">
  <GlowingEffect spread={40} glow disabled={false} />
  <Card className="relative ...">...</Card>
</div>
```

### Files to modify:

| File | Changes |
|---|---|
| `src/components/ui/glowing-effect.tsx` | Create -- full component with reconstructed JSX |
| `src/pages/DashboardPage.tsx` | Wrap all 4 Cards (action card, stat cards, scheduled post card) with GlowingEffect |
| `src/pages/AnalyticsPage.tsx` | Wrap KPI cards, chart cards, heatmap card, table card, compare card, and insights card with GlowingEffect |

### Approach for AnalyticsPage

Create a reusable `GlowCard` wrapper component at the top of the file to avoid repetitive code:

```tsx
function GlowCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative">
      <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} />
      <Card className={cn("relative border-border shadow-sm", className)}>
        {children}
      </Card>
    </div>
  );
}
```

Then replace all `<Card>` usages with `<GlowCard>`.

No other dependencies needed. The `motion` package replaces `framer-motion` for the `animate` function used in the glow angle interpolation.

