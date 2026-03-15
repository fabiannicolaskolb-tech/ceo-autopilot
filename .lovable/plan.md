

## Plan: Realtime Hooks integrieren und Dashboard live updaten

### Was passiert
Die von Claude generierten Realtime-Hooks werden als neue Datei `src/hooks/useRealtime.ts` angelegt. Danach wird `DashboardPage.tsx` umgebaut, um die bisherigen `useQuery`-Aufrufe durch die neuen Realtime-Hooks zu ersetzen, sodass das Dashboard live aktualisiert wird wenn n8n Änderungen in Supabase schreibt.

### Änderungen

**1. Neue Datei `src/hooks/useRealtime.ts` erstellen**
- Enthält alle vier Hooks: `usePipelineStatus`, `useGeneratedIdeas`, `usePosts`, `useDashboardStats`
- Code wird 1:1 aus dem gelieferten Snippet übernommen, nur der Import-Pfad für den Supabase-Client wird auf `@/integrations/supabase/client` gesetzt (ist bereits korrekt)

**2. `src/pages/DashboardPage.tsx` anpassen**
- Die drei separaten `useQuery`-Aufrufe (drafts, nextScheduled, postedPosts) entfernen
- Stattdessen `usePosts` aus `useRealtime` importieren und verwenden
- Aus `posts` die Derivate berechnen:
  - `drafts = posts.filter(p => p.status === 'draft')`
  - `postedPosts = posts.filter(p => p.status === 'posted')`
  - `nextScheduled` = nächster scheduled Post (frühestes `scheduled_at` in der Zukunft)
- Optional: Pipeline-Status-Anzeige als kleines Badge/Indicator im Hero-Bereich einbauen (z.B. "Pipeline läuft: Ideating...")
- `useQuery` und `@tanstack/react-query` Import können entfallen

### Vorteile
- Dashboard aktualisiert sich sofort wenn n8n einen Post erstellt, updated oder die Pipeline fortschreitet
- Kein manuelles Neuladen nötig
- Weniger Netzwerk-Requests (ein Realtime-Channel statt Polling)

