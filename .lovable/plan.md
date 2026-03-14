

# Posts-Tabelle erweitern: content_category + Index

## Ist-Zustand

Die `posts`-Tabelle existiert bereits mit allen Spalten (`content`, `metrics`, `posted_at`, `status`, etc.). Es fehlen:
1. Die Spalte `content_category` (für Content Type Efficiency Diagramm)
2. Ein Index für schnellere Analytics-Abfragen

Die Spalten `published_at` und `content NOT NULL` aus dem Schema sind nicht nötig -- `posted_at` existiert bereits, und `content` ist bewusst nullable (Drafts haben noch keinen Content).

## Migration

```sql
-- Spalte für Content-Kategorisierung
ALTER TABLE public.posts
  ADD COLUMN content_category text
  CHECK (content_category IN ('Leadership', 'Industry Insights', 'Personal Story', 'Case Study', 'Question'));

-- Index für schnellere Analytics-Abfragen
CREATE INDEX idx_posts_user_metrics ON public.posts(user_id, status);
```

## Code-Anpassungen

| Datei | Änderung |
|---|---|
| `src/integrations/supabase/types.ts` | Wird automatisch aktualisiert nach Migration |
| `src/hooks/useAnalytics.ts` | `content_category` statt `type` für Content Type Efficiency nutzen |
| `src/pages/AnalyticsPage.tsx` | Labels auf die neuen Kategorien anpassen |

Keine neuen Dateien, keine neuen Dependencies.

