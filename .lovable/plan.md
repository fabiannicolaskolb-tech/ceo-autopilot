

## Plan: CV-Kontext erweitern und in Supabase speichern

### Problem
Aktuell extrahiert der CV-Parser nur 4 Felder (Name, Company, Role, Industry) und füllt damit die Onboarding-Formularfelder. Der eigentliche Kontext des CVs (Berufserfahrung, Kernkompetenzen, Erfolge, Expertise) geht verloren und steht für die spätere Content-Generierung nicht zur Verfügung.

### Lösung

**1. Neue Spalte `cv_context` in der `profiles`-Tabelle**
- Typ: `text`, nullable
- Speichert eine KI-generierte Zusammenfassung des CVs als professionellen Kontext (Kernkompetenzen, Erfahrung, Expertise, Erfolge)

**2. Edge Function `parse-cv` erweitern**
- Den AI-Prompt erweitern, sodass neben name/company/role/industry auch ein `professional_context`-Feld extrahiert wird
- Dieses Feld enthält eine strukturierte Zusammenfassung (ca. 500-1000 Wörter) mit: Kernkompetenzen, relevante Berufserfahrung, bemerkenswerte Erfolge, Fachgebiete
- Das Tool-Schema um `professional_context` ergänzen

**3. Frontend: Kontext nach Upload in Supabase speichern**
- Nach erfolgreichem CV-Parse den `professional_context` direkt in `profiles.cv_context` für den aktuellen User speichern
- Optional: Kurze Vorschau des extrahierten Kontexts im Onboarding anzeigen

### Technische Schritte

1. **Migration**: `ALTER TABLE profiles ADD COLUMN cv_context text;`
2. **Edge Function** (`supabase/functions/parse-cv/index.ts`): `professional_context` zum Tool-Schema und Prompt hinzufügen
3. **OnboardingPage.tsx**: Nach dem Parse den `cv_context` via `supabase.from('profiles').update()` speichern

