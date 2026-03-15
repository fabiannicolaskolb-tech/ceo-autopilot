

## Plan: Warnung bei unvollständigen Voice Samples

### Änderungen in `src/pages/OnboardingPage.tsx`

1. **Validierung für Step 6 lockern**: `isStepValid` für `case 6` auf `true` setzen — der Button ist immer klickbar.

2. **State für Dialog**: `showVoiceWarning` boolean hinzufügen.

3. **Abschließen-Button-Logik ändern**: Beim Klick auf "Abschließen" prüfen, ob weniger als 3 gültige Samples (500-3000 Zeichen) vorhanden sind. Falls ja → `showVoiceWarning = true` statt direkt `handleComplete()`.

4. **Warning-Dialog einfügen** (mit bestehender `Dialog`-Komponente):
   - Titel: "Voice Samples unvollständig"
   - Text: Hinweis, dass die Content-Qualität leiden kann, man dies aber jederzeit in den Profileinstellungen nachholen kann.
   - Zwei Buttons: "Zurück zum Ausfüllen" (schließt Dialog) und "Trotzdem abschließen" (ruft `handleComplete()` auf).

