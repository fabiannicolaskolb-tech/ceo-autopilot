

# Executive Landing Page & Auth Gateway

## Overview

Create a public Landing Page at `/` for guests, with the existing dashboard moving to `/dashboard`. The landing page features executive-grade design with Aurora background, trust elements, and clear CTAs. Logged-in users get redirected to `/dashboard` automatically.

## Architecture Changes

### Routing (App.tsx)
- Add new `LandingPage` at `/` (public route)
- Move `DashboardPage` from `/` to `/dashboard` inside `ProtectedLayout`
- Update `ProtectedLayout` default redirect accordingly

### New Files
1. **`src/pages/LandingPage.tsx`** -- Full landing page with:
   - Sticky nav (logo left, "Anmelden" button right) -- simple, not the authenticated FloatingHeader
   - Hero section with Playfair Display headline, Inter subtext, "Get Started" CTA using `InteractiveHoverButton`
   - 3-column feature grid (Ideation, Planning, Analytics) with icons
   - "Sicherheit & Diskretion" trust section (DSGVO, encryption, exclusivity)
   - Auto-redirect to `/dashboard` if user is already logged in

2. **`src/components/ui/aurora-background.tsx`** -- Aurora animated background for the hero section

### Tailwind Config Updates
- Add `aurora` keyframes animation (60s linear infinite background-position shift)
- Add `addVariablesForColors` plugin for CSS variable generation

### CSS Updates (index.css)
- No color scheme changes needed -- existing Deep Navy primary (`220 55% 20%`) already matches the brief

### Auth Flow Updates
- `AuthPage.tsx`: After login, redirect to `/dashboard` instead of `/`
- `ProtectedLayout.tsx`: Update to work at `/dashboard` base path
- `FloatingHeader.tsx`: Update Dashboard link from `/` to `/dashboard`
- `OnboardingPage.tsx`: After completion, navigate to `/dashboard`

## File Changes Summary

| File | Action |
|---|---|
| `src/pages/LandingPage.tsx` | Create |
| `src/components/ui/aurora-background.tsx` | Create |
| `src/App.tsx` | Edit -- add landing route, move dashboard |
| `src/pages/AuthPage.tsx` | Edit -- redirect to `/dashboard` |
| `src/components/ProtectedLayout.tsx` | Edit -- no changes needed if `/dashboard` is nested route |
| `src/components/ui/floating-header.tsx` | Edit -- update Dashboard link to `/dashboard` |
| `tailwind.config.ts` | Edit -- add aurora animation + color variables plugin |
| `src/pages/DashboardPage.tsx` | Minor -- no changes |

## Landing Page Structure

```text
┌─────────────────────────────────────────────┐
│  [Logo] CEO Autopilot           [Anmelden]  │  ← Sticky nav (simple, public)
├─────────────────────────────────────────────┤
│                                             │
│  Aurora Background                          │
│                                             │
│   "Ihre digitale Präsenz auf LinkedIn –     │
│    Vollautomatisiert & Authentisch."         │
│                                             │
│   Subtext...                                │
│                                             │
│         [ Get Started → ]                   │
│                                             │
├─────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Ideation │ │ Planning │ │Analytics │    │  ← 3-col features
│  └──────────┘ └──────────┘ └──────────┘    │
├─────────────────────────────────────────────┤
│  Sicherheit & Diskretion                    │  ← Trust section
│  DSGVO · Verschlüsselung · Exklusiv        │
├─────────────────────────────────────────────┤
│  Footer                                     │
└─────────────────────────────────────────────┘
```

## Key Design Decisions
- Aurora background only on hero section, not full page (keeps it professional, not overwhelming)
- Landing nav is a separate simple component inside `LandingPage`, not the authenticated `FloatingHeader`
- Existing color scheme already fits the brief (Deep Navy primary)
- `framer-motion` needed for Aurora demo fade-in -- will use simple CSS transitions instead to avoid adding a dependency

