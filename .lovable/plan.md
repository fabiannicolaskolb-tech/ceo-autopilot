

# Simulationsdaten einfügen

## Problem
Read-only Zugriff auf die DB — Daten müssen via Migration eingefügt werden.

## Migration

Eine SQL-Migration die 10 Posts mit realistischen Metriken einfügt, verteilt über die letzten 30 Tage. Jeder Post hat:
- Verschiedene `content_category` (Leadership, Industry Insights, Personal Story, Case Study, Question)
- Metriken basierend auf der bereitgestellten Struktur (impressions, interactions, sentiment, ctr, follower_delta)
- `status = 'posted'` und `posted_at` Timestamps
- Realistische Hooks auf Deutsch

Die Daten werden dem aktuellen User (`41b09c79-2ca7-47d5-9c0d-d19b6cfd865a`) zugeordnet.

| Datei | Aktion |
|---|---|
| `supabase/migrations/seed_simulation_posts.sql` | Erstellen — 10 Simulations-Posts |

Keine Code-Änderungen nötig — das Analytics-Dashboard liest die Daten automatisch.

