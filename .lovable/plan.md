

## KI-generierte Inspirationsvorlagen

Unter den 3 statischen Inspirations-Kacheln (rechte Sidebar) wird ein Button hinzugefügt, der per KI 3 neue Vorlagen generiert und die bestehenden ersetzt.

### Änderungen in `src/pages/IdeationPage.tsx`

1. **State für dynamische Templates**: `TEMPLATES` wird als initialer Wert in einen `useState`-Hook überführt. Zusätzlich ein `generatingTemplates`-Loading-State.

2. **Edge Function aufrufen**: Beim Klick auf den Button wird die bestehende `generate-ideas` Edge Function (oder eine neue leichtgewichtige Function) aufgerufen mit einem speziellen Flag (z.B. `action: 'generate_templates'`), die 3 kurze Inspirationsvorlagen zurückgibt (Emoji, Label, Prompt).

3. **Button unter den Kacheln**: Nach dem `TEMPLATES.map(...)` Block (Zeile ~418) wird ein kleiner Button eingefügt:
   - Icon: `Sparkles` + Text "Neue Vorlagen generieren"
   - Variant: `ghost`, klein (`size="sm"`)
   - Zeigt einen Loader während der Generierung
   - Bei Erfolg werden die 3 Kacheln mit den neuen KI-generierten Vorlagen ersetzt

4. **Edge Function**: Neue Edge Function `generate-templates` die über Lovable AI Gateway (`google/gemini-3-flash-preview`) 3 Inspirationsvorlagen generiert. Nutzt Tool Calling für strukturiertes Output (emoji, label, prompt). Kein Streaming nötig.

5. **config.toml**: Eintrag für die neue Function mit `verify_jwt = false`.

### Ablauf
- User klickt Button → Loading-Spinner auf Button
- Edge Function ruft Lovable AI auf → gibt 3 strukturierte Templates zurück
- Templates ersetzen die aktuellen Kacheln mit kurzer Fade-Animation

