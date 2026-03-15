

## Plan: Beschreibungstext aus Freigabe-Karten entfernen

**Problem:** In den Freigabe-Karten (ApprovalCard) wird unter dem Bild ein Beschreibungstext angezeigt (z.B. "Jona will share a practical, actionable framework..."), der dort nicht erscheinen soll.

**Lösung:** In der `ApprovalCard`-Komponente (`src/pages/PostLibraryPage.tsx`, Zeilen 510-529) den Content-Bereich so anpassen, dass nur der `hook` des Posts angezeigt wird (falls vorhanden), statt des gesamten `content`-Felds. Falls kein Hook vorhanden ist, wird nur der erste Absatz des Contents als Kurzvorschau angezeigt.

**Änderung in `src/pages/PostLibraryPage.tsx`:**
- Zeile 444: `contentText` durch `post.hook || post.content?.split('\n')[0] || '—'` ersetzen
- Die "Mehr anzeigen"-Logik (expanded/isLong) entfällt, da nur die Kurzvorschau gezeigt wird
- Der Beschreibungs-/Reasoning-Text wird nicht mehr angezeigt

