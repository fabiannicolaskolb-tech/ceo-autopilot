

## Plan: Audio-Briefing Generation funktionstüchtig machen

### Problem
1. **Empty State blockiert**: Wenn keine analysierten Posts der letzten 24h existieren, zeigt das Widget nur einen leeren Zustand ohne Generierungsmöglichkeit
2. **Edge Function zu restriktiv**: Filtert nur auf `status = 'analyzed'` Posts der letzten 48h – wenn keine da sind, scheitert die Generierung mit 400
3. **Keine Fallback-Daten**: Es gibt keinen Fallback auf ältere Posts oder andere Datenquellen

### Lösung

**1. Frontend (`DailyBriefing.tsx`)**
- Posts-Query erweitern: Nicht nur letzte 24h, sondern auch allgemein die neuesten analysierten Posts laden (Limit 10, ohne Zeitfilter), damit das Widget immer Daten hat wenn Posts existieren
- Empty State anpassen: Generieren-Button auch im leeren Zustand anzeigen, falls der User eingeloggt ist
- Nach erfolgreicher Generierung die Audio-URL setzen UND die Text-Summary als State speichern, um sofort Metriken + Insights anzuzeigen

**2. Edge Function (`generate-briefing/index.ts`)**
- Zeitfenster erweitern: Zuerst Posts der letzten 48h versuchen, bei 0 Ergebnissen auf die neuesten 5 analysierten Posts (ohne Zeitfilter) fallen
- Briefing-Text anpassen: Formulierung dynamisch je nachdem ob es 24h-Daten oder ältere Daten sind
- `textSummary` und aggregierte Metriken als strukturierte JSON-Daten zurückgeben, damit das Frontend sie direkt anzeigen kann

### Technische Änderungen

**Edge Function** – Fallback-Query hinzufügen:
```
1. Query: posts mit status='analyzed', letzte 48h
2. Wenn leer → Query: neueste 5 posts mit status='analyzed' (ohne Zeitfilter)
3. Wenn immer noch leer → Fehlermeldung
4. Rückgabe erweitern um metrics-Objekt (impressions, likes, comments, engagementRate, bestPost)
```

**DailyBriefing.tsx** – 3 Änderungen:
1. Posts-Query ohne 24h-Filter (neueste 10 analyzed Posts laden)
2. Empty State: Generieren-Button anzeigen statt nur Text
3. Nach Generierung: `textSummary` und Metriken aus Response in State übernehmen, Widget aktualisieren

