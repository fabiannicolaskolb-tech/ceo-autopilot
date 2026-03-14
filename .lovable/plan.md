
# Particles Background Integration

## Overview
Add the `Particles` component as a full-screen background on every page. Since there's no dark mode (`next-themes`), we'll hardcode the particle color to match the dark navy primary (`#1a2740` from `--primary: 220 55% 20%`).

## Changes

### 1. Create `src/components/ui/particles.tsx`
Copy the provided component code, removing `"use client"` directive (not needed in Vite/React).

### 2. Update `src/App.tsx`
Add `<Particles>` as a fixed full-screen background layer inside the app wrapper, so it covers all pages globally — no need to edit each page individually.

```
<Particles className="fixed inset-0 z-0" quantity={80} color="#1a2740" size={0.5} />
```

Place it right after `<Sonner />` and before `<BrowserRouter>`, ensuring all page content renders above it with relative positioning.

### 3. Ensure content stays above particles
- `ProtectedLayout` and `LandingPage` already have `bg-background` which will partially overlay. We'll add `relative z-10` to `BrowserRouter`'s wrapper to ensure all content sits above the particle canvas.

No new dependencies needed — the component uses only React, canvas API, and `cn()` which already exists.
