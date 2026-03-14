

## Plan: Testdaten in `voice_insights` einfügen

Die Insights-Sektion im Ideation Lab wird nur angezeigt wenn `voiceInsights.length > 0`. Ich füge über eine SQL-Migration simulierte Gesprächsdaten ein.

**Änderung:** Eine SQL-Migration, die für den aktuell eingeloggten User (oder einen Platzhalter) 3 realistische Voice-Insight-Einträge mit deutschen Key Points in die `voice_insights`-Tabelle einfügt. Da wir die User-ID nicht kennen, erstelle ich stattdessen einen **Seed-Button** direkt in der IdeationPage, der beim Klick Testdaten für den eingeloggten User anlegt.

**Konkret:**

1. **`src/pages/IdeationPage.tsx`**: Wenn `voiceInsights.length === 0`, zeige einen kleinen "Demo-Gespräch simulieren"-Button. Beim Klick werden 3 Einträge mit realistischen Key Points in `voice_insights` per `supabase.insert()` gespeichert und die Query wird refetched. Danach erscheinen die Insight-Cards sofort.

Beispiel-Daten:
- Gespräch 1: Key Points über Leadership-Erfahrungen und Teamführung
- Gespräch 2: Key Points über KI-Strategie im Mittelstand
- Gespräch 3: Key Points über persönliche Markenbildung auf LinkedIn

Kein DB-Schema-Change nötig — die Tabelle existiert bereits mit passendem Schema.

