

# Ideation Lab -- Premium Redesign

## Overview

Complete overhaul of `src/pages/IdeationPage.tsx` into a split-view layout with context sidebar, smart input detection, animated generation process, and enriched idea cards.

## Layout

```text
┌─────────────────────────────────┬──────────────────┐
│  LEFT: Brain Dump Input          │  RIGHT: Context  │
│                                  │  Bar (Vorlagen)  │
│  "Gedanken in Reichweite         │                  │
│   verwandeln"                    │  🚀 Kundenerfolg │
│                                  │  💡 Leadership   │
│  ┌────────────────────────┐ 🎤   │  📈 Branchen-    │
│  │  Textarea              │      │     Trend        │
│  │                        │      │                  │
│  └────────────────────────┘      │  ── Fokus ──     │
│                                  │  [erkannte       │
│  Erkannte Themen: [Tag] [Tag]    │   Topics]        │
│                                  │                  │
│  [ Ideen generieren ]            │                  │
└─────────────────────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────┐
│  Generierte Ideen (5 Cards Grid)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Type     │ │ Type     │ │ Type     │            │
│  │ Score    │ │ Score    │ │ Score    │            │
│  │ Hook     │ │ Hook     │ │ Hook     │            │
│  │ Angle    │ │ Angle    │ │ Angle    │            │
│  │ Actions  │ │ Actions  │ │ Actions  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  "Basierend auf Ihren erfolgreichsten Posts..."     │
└─────────────────────────────────────────────────────┘
```

## File Changes

| File | Action |
|---|---|
| `src/pages/IdeationPage.tsx` | Rewrite -- full premium redesign |

## Implementation Details

### 1. Split-View Layout
- `ResizablePanelGroup` with left (75%) input panel and right (25%) context sidebar
- On mobile (`< sm`): stack vertically, context bar collapses

### 2. Left Panel -- Brain Dump
- Serif headline: "Gedanken in Reichweite verwandeln"
- Subtitle: "Teilen Sie eine Beobachtung, und wir verwandeln sie in wirkungsvollen LinkedIn-Content."
- Large Textarea with a `Mic` icon button (UI dummy, no functionality) positioned inside using relative/absolute positioning
- Below textarea: detected topics from the `topics` table shown as small Badges, matched against input text in real-time via `useMemo`
- `InteractiveHoverButton` to generate

### 3. Right Panel -- Context Sidebar
- Title: "Inspirations-Vorlagen"
- Three clickable template cards with emoji + label:
  - "🚀 Kundenerfolg teilen" → inserts prompt text into textarea
  - "💡 Leadership-Lektion" → inserts prompt text
  - "📈 Branchen-Trend kommentieren" → inserts prompt text
- Each card: `cursor-pointer`, hover effect, border-l-2 primary accent on hover

### 4. Loading Animation
- When generating: hide the button, show an animated state with cycling status texts every 1.5s:
  - "Analysiere Branchentrends..."
  - "Gleiche mit Ihrer Brand Voice ab..."
  - "Berechne Engagement-Potenzial..."
- Use a simple `Loader2` spinning icon + text transition with `animate-fade-in`

### 5. Enriched Idea Cards (5 mock concepts)
- Extended `Concept` interface adds `score: number` and `category: string`
- 5 MOCK_CONCEPTS instead of 4, with varied types (Story, Insight, Case Study, Contrarian, Question)
- Each card shows:
  - Type Badge (secondary variant)
  - Score Badge: "Potenzial: Hoch" (score >= 80) / "Potenzial: Mittel" (60-79) in outline style
  - Hook bold
  - Angle as muted description
  - Three actions: "Auswählen & Post erstellen" (saves to posts as draft), "Bearbeiten" (toast placeholder), "Verwerfen" (removes card from state)
- Grid: `sm:grid-cols-2 lg:grid-cols-3`

### 6. Data Integration
- Fetch user's topics from `topics` table via `useQuery`
- Use profile data from `useAuth()` (industry, name, company)
- The generate function prepares a payload with `user_id`, `profile` data, and `input` (ready for future webhook call)
- Below results: hint text "Basierend auf Ihren erfolgreichsten Posts zum Thema [matched topic] aus der letzten Woche."

### 7. Design
- Executive Premium: generous whitespace, `border-border`, minimal shadows, Navy-Blue accents via `primary`
- Cards with `rounded-sm` for sharper edges
- Playfair Display for all headlines, Inter for body

No database changes needed. All data reads from existing `topics` and `profiles` tables.

