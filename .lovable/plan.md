

## Fix: Prevent overscroll on protected layout

The issue is that the page allows scrolling beyond the visible content area. The fix is to constrain the root container in `ProtectedLayout.tsx` to the viewport height and handle overflow internally.

### Change in `src/components/ProtectedLayout.tsx`

Replace the outer `div` from `min-h-screen` to `h-screen overflow-hidden`, and make the inner content area scrollable with `overflow-auto` and `flex-1` so content stays within viewport bounds:

```tsx
// Outer div: lock to viewport
<div className="relative h-screen overflow-hidden bg-background">
  <WaveMeshBackground />
  <Particles ... />
  <div className="relative z-10 flex h-full flex-col">
    <FloatingHeader />
    <main className="mx-auto w-full max-w-7xl flex-1 overflow-auto px-4 py-6">
      <Outlet />
    </main>
  </div>
</div>
```

This ensures the page never scrolls beyond the viewport, while the main content area remains scrollable if its content exceeds the available space.

