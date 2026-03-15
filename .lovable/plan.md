

## Plan: CV-Kontext erweitert auswerten und in Supabase speichern

### Problem
Aktuell extrahiert der CV-Parser nur 4 Felder (Name, Company, Role, Industry) und füllt damit die Onboarding-Formularfelder. Der eigentliche Kontext des CVs (Erfahrungen, Fähigkeiten, Expertise-Zusammenfassung) geht verloren und steht nicht für die spätere Content-Generierung zur Verfügung.

### Lösung

**1. Profil-Tabelle erweitern** — Neues Feld `cv_context` (text, nullable) zur `profiles`-Tabelle hinzufügen, um die KI-generierte Zusammenfassung des CVs zu speichern.

**2. Edge Function `parse-cv` erweitern** — Das KI-Tool um zusätzliche Felder erweitern:
- `bio`: Kurze professionelle Zusammenfassung (2-3 Sätze)
- `expertise`: Kernkompetenzen und Fachgebiete
- `experience_summary`: Zusammenfassung der beruflichen Erfahrung
- `cv_context`: Gesamtzusammenfassung als Kontext-String für Content-Generierung

Alle neuen Felder werden zusammen mit den bestehenden 4 Feldern zurückgegeben.

**3. Onboarding-Seite anpassen** — Nach dem CV-Parse:
- Bestehende Felder (name, company, role, industry) weiterhin ins Formular eintragen
- Zusätzlich `bio` ins Bio-Feld eintragen (falls leer)
- `cv_context` im Profil-Update an Supabase speichern (direkt nach dem Parsen oder beim finalen Speichern)

### Technische Änderungen

| Datei | Änderung |
|-------|----------|
| **Migration** | `ALTER TABLE profiles ADD COLUMN cv_context text;` |
| **`supabase/functions/parse-cv/index.ts`** | Tool-Schema um `bio`, `expertise`, `experience_summary`, `cv_context` erweitern; System-Prompt anpassen für reichhaltigere Extraktion |
| **`src/pages/OnboardingPage.tsx`** | `handleCvUpload`: Bio-Feld befüllen, `cv_context` in einer State-Variable speichern und beim finalen `updateProfile`-Aufruf mitsenden |

