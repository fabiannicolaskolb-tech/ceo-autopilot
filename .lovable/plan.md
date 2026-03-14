

## Problem

Der "Ideen generieren"-Button auf der Ideation-Seite nutzt aktuell **Mock-Daten** statt den echten n8n-Workflow. Gleichzeitig macht der separate "An n8n senden"-Button im Planner wenig Sinn, weil die Ideation bereits in n8n stattfindet.

## Lösung

Den **Ideation-Prozess direkt mit n8n verbinden**: Der "Ideen generieren"-Button schickt den Brain Dump an den n8n-Webhook (`/webhook/orchestrate`), der die KI-generierten Konzepte zurückliefert. Der separate n8n-Button im Planner wird entfernt oder umfunktioniert.

## Architektur

```text
User Input (Brain Dump)
       │
       ▼
  Edge Function: "generate-ideas"
       │  POST → n8n.thinc.de/webhook/orchestrate
       │  Payload: { action: "ideate", input, profile }
       │
       ▼
  n8n Workflow → KI-Konzepte generieren
       │
       ▼
  Response zurück an Frontend
       │
       ▼
  Konzept-Karten anzeigen (statt Mock-Daten)
```

## Umsetzungsschritte

1. **Neue Edge Function `generate-ideas`** erstellen
   - Nimmt `input` + `profile`-Daten entgegen
   - Sendet `{ action: "ideate", ... }` an `N8N_WEBHOOK_URL`
   - Gibt n8n-Response (generierte Konzepte) direkt zurück
   - Nutzt das bestehende `N8N_WEBHOOK_URL` Secret

2. **IdeationPage.tsx anpassen**
   - `generate()` Funktion: Mock-`setTimeout` ersetzen durch `supabase.functions.invoke('generate-ideas', { body: payload })`
   - n8n-Response in `Concept[]`-Format mappen
   - Fehlerbehandlung mit Toast-Nachrichten

3. **Planner: n8n-Button überdenken**
   - Option A: Button entfernen (Ideation läuft jetzt über die Ideation-Seite)
   - Option B: Button umfunktionieren zu "Veröffentlichen" mit `action: "publish"`

## Offene Frage

Welches JSON-Format liefert der n8n-Workflow zurück? Falls noch nicht definiert, schlage ich vor, dass n8n ein Array mit Objekten zurückgibt:
```json
[{ "hook": "...", "type": "Story", "angle": "...", "preview": "...", "score": 85, "category": "..." }]
```

