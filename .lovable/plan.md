

## Plan: Particle-Animation im Onboarding-Hintergrund

Gleiche Particle-Animation wie im `ProtectedLayout` zum Onboarding hinzufügen.

**Änderung in `src/pages/OnboardingPage.tsx`:**

1. `Particles` und `useTheme` importieren
2. `step`-Wechsel als Burst-Trigger nutzen (analog zu `location.pathname` im Dashboard)
3. Wrapper-`div` auf `relative` setzen, `<Particles>` als `absolute inset-0 z-0` einfügen
4. Inhalte auf `relative z-10` setzen (Header + Content + Footer)

