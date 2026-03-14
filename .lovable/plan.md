

# Speech-to-Text für das Ideation Lab

## Ansatz

Nutze die **Web Speech API** (browser-nativ, keine API-Keys nötig) für Echtzeit-Spracherkennung. Funktioniert in Chrome, Edge und Safari. Für nicht-unterstützte Browser wird ein Hinweis angezeigt.

## Änderungen

**Datei: `src/pages/IdeationPage.tsx`**

1. **State hinzufügen**: `listening` (boolean) für den Aufnahmestatus
2. **Speech Recognition Hook**: `useRef` für die `SpeechRecognition`-Instanz. Konfiguration:
   - `lang: 'de-DE'` (deutsch)
   - `continuous: true`, `interimResults: true`
   - `onresult`: Erkannten Text an den bestehenden `input`-State anhängen
   - `onend`: `listening` auf false setzen
3. **Toggle-Funktion**: `toggleListening()` startet/stoppt die Erkennung
4. **UI-Update (Desktop, Zeile 160-166)**: Mic-Button bekommt:
   - `onClick={toggleListening}`
   - Visuelles Feedback: Rot-pulsierender Ring wenn `listening` aktiv (`animate-pulse ring-2 ring-red-400`)
   - Icon wechselt optisch (rote Farbe bei aktiver Aufnahme)
   - Title-Text aktualisiert
5. **UI-Update (Mobile, Zeile 275-281)**: Gleiche Änderungen wie Desktop
6. **Browser-Fallback**: Wenn `webkitSpeechRecognition` / `SpeechRecognition` nicht verfügbar, zeigt der Button einen Toast "Ihr Browser unterstützt kein Voice-to-Text"

## Technische Details

- Keine externen Dependencies oder API-Keys nötig
- `window.SpeechRecognition || window.webkitSpeechRecognition` für Browser-Kompatibilität
- TypeScript-Deklaration über `any`-Cast da Web Speech API nicht in allen TS-Definitionen enthalten
- Der erkannte Text wird **angehängt** (nicht ersetzt), damit bestehender Input erhalten bleibt

