

## Plan: CV-Upload mit automatischer Datenextraktion auf der Basis-Informationen-Seite

### Ansatz
Ein Upload-Button auf Step 2 des Onboardings, der eine PDF/DOCX-Datei annimmt und den Text via einer Supabase Edge Function mit KI (OpenAI) parst, um Name, Unternehmen, Position und Branche automatisch in die Felder einzutragen.

### Änderungen

**1. Supabase Edge Function `parse-cv/index.ts` erstellen**
- Nimmt die hochgeladene Datei als FormData entgegen
- Extrahiert den Text aus dem PDF (via pdf-parse oder einfach als Text senden)
- Sendet den Text an OpenAI GPT mit einem Prompt, der Name, Company, Role und Industry als JSON zurückgibt
- Benötigt Secret: `OPENAI_API_KEY`

**2. `src/pages/OnboardingPage.tsx` anpassen**
- Auf Step 2 einen "CV hochladen"-Button mit Upload-Icon hinzufügen (oberhalb oder neben den Formularfeldern)
- Verstecktes `<input type="file" accept=".pdf,.doc,.docx,.txt">` Element
- Bei Dateiauswahl: Datei als FormData an die Edge Function senden
- Response-Daten (name, company, role, industry) in die State-Felder eintragen
- Loading-State während der Verarbeitung anzeigen

### Ablauf
```text
User klickt "CV hochladen"
  → Datei-Dialog öffnet sich
  → Datei wird an Edge Function gesendet
  → Edge Function extrahiert Text + sendet an OpenAI
  → JSON mit {name, company, role, industry} kommt zurück
  → Felder werden automatisch befüllt
```

### Secret-Bedarf
- `OPENAI_API_KEY` muss als Supabase Secret hinterlegt werden (falls noch nicht vorhanden)

### Technische Details
- Edge Function nutzt CORS-Headers für Browser-Zugriff
- PDF-Text-Extraktion: Da Deno keine native PDF-Bibliothek hat, wird der Dateiinhalt als Base64 an OpenAI Vision oder als Text an GPT gesendet
- Fallback: Bei .txt-Dateien wird der Text direkt verarbeitet

