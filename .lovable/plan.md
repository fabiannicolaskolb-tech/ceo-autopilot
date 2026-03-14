

# Dashboard-Stil auf alle Pages übertragen

## Design-Muster (aus DashboardPage)

- **Mesh-Gradient Background**: Animierte, blasse Blobs mit `radial-gradient`, `blur-3xl`, `animate-pulse`
- **Glassmorphism Cards**: `rounded-[24px] bg-card/80 backdrop-blur-xl` + weiche Multi-Layer-Shadows
- **Keine harten Borders**: Kein `border-border`, stattdessen nur Shadow-basierte Tiefe
- **Playfair Headlines**, großzügiger Weißraum

## Betroffene Dateien

| Datei | Änderungen |
|---|---|
| `src/pages/PlannerPage.tsx` | Glassmorphism Cards, Mesh BG, rounded-[24px], weiche Shadows |
| `src/pages/AnalyticsPage.tsx` | KPICard + alle Cards auf Glassmorphism, Mesh BG, EmptyState aufwerten |
| `src/pages/ProfilePage.tsx` | Alle Cards auf neuen Stil, Mesh BG |
| `src/pages/SettingsPage.tsx` | Alle Cards auf neuen Stil, Mesh BG |
| `src/pages/IdeationPage.tsx` | Bereits teilweise im Premium-Stil; Cards vereinheitlichen auf `rounded-[24px] bg-card/80 backdrop-blur-xl` |

## Umsetzung pro Seite

### Gemeinsames Pattern (auf jeder Seite)
1. **Mesh-Gradient BG hinzufügen** (identisch zum Dashboard):
```tsx
<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
  <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(...)] blur-3xl animate-pulse" />
  <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] ..." />
  <div className="absolute top-1/2 left-1/2 ..." />
</div>
```

2. **Card-Klassen ersetzen**: `border-border shadow-sm` → `rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]`

3. **Header-Sections**: In Glassmorphism-Container wrappen (wie Dashboard Welcome Hero)

### PlannerPage
- Header-Bereich (Titel + Filter) in gerundete Glassmorphism-Box
- Post-Cards: `rounded-[24px] bg-card/80 backdrop-blur-xl` + hover shadow
- Empty State: Icon + Micro-Copy im Dashboard-Stil
- Dialog bleibt unverändert (modal)

### AnalyticsPage
- KPICard-Komponente: auf Glassmorphism updaten
- Alle `Card`-Wrapper für Charts: neuer Stil
- EmptyState: Glassmorphism-Container

### ProfilePage
- Jede Section-Card: neuer Stil
- Header-Bereich in Hero-Container

### SettingsPage
- Identisch zu ProfilePage: alle Cards auf Glassmorphism
- Fixed Save-Button: `rounded-full` + stärkerer Shadow

### IdeationPage
- Cards im Ergebnis-Grid: `rounded-[24px]` vereinheitlichen
- Context-Sidebar Cards angleichen

5 Dateien, rein kosmetische Änderungen an Card-Klassen und Background-Elementen. Keine Logik-Änderungen.

