

# Executive Voice Copilot -- Vereinfachter Plan (ohne n8n)

## Antwort: Ja, das geht

Statt n8n als Zwischenschritt zu nutzen, können die Gesprächsinhalte direkt aus dem ElevenLabs SDK im Frontend erfasst und in Supabase gespeichert werden. Der `useConversation` Hook liefert über `onMessage` alle Transkripte (User + Agent) in Echtzeit. Nach Gesprächsende werden die gesammelten Erkenntnisse direkt in eine `voice_insights`-Tabelle geschrieben.

## Vereinfachte Architektur

```text
IdeationPage
  └─ "🎙️ Gespräch starten" Button
       └─ VoiceCopilotModal
            ├─ Edge Function: voice-copilot-token (holt ElevenLabs Token)
            ├─ ElevenLabs useConversation (WebRTC)
            ├─ onMessage → sammelt Transkripte client-side
            └─ onEnd → INSERT in voice_insights (direkt via Supabase Client)
                 └─ IdeationPage zeigt "Erkenntnisse aus Ihrem letzten Gespräch"
```

Kein n8n, kein Callback, keine zusätzlichen Webhook-Secrets.

## Implementierungsschritte

### 1. Datenbank: `voice_insights` Tabelle
- Spalten: `id`, `user_id`, `conversation_id`, `transcript` (vollständiger Text), `key_points` (JSONB Array der Kernaussagen), `created_at`
- RLS: Nutzer sehen nur eigene Einträge

### 2. Edge Function: `voice-copilot-token`
- Nutzt vorhandenes Secret `ELEVENLABS_API_KEY` (bereits via Connector verbunden)
- Benötigt zusätzlich Secret `ELEVENLABS_AGENT_ID`
- Gibt WebRTC-Token zurück
- Registrierung in `config.toml`

### 3. NPM-Paket: `@elevenlabs/react`

### 4. Komponente: `VoiceCopilotModal`
- Fullscreen-Overlay, dunkler Executive-Stil (`bg-slate-950`, weißer Text)
- Canvas-Waveform-Visualizer mit `getOutputByteFrequencyData()`
- States: Connecting, Listening, Speaking, Done
- Sammelt alle `user_transcript` und `agent_response` Events in einem Array
- Bei "Gespräch beenden": speichert Transkript + extrahierte Key Points direkt in `voice_insights`
- Key Points werden aus den User-Transkripten als einzelne Aussagen extrahiert (client-side Parsing)

### 5. IdeationPage Erweiterung
- "🎙️ Gespräch starten" Button mit Erklärungstext
- Neuer Abschnitt: "Erkenntnisse aus Ihrem letzten Gespräch" — Query auf `voice_insights`, zeigt Key Points als Karten
- Jede Karte hat "Als Post-Idee übernehmen" Button (erstellt Draft in `posts`)

### 6. Fehlende Secrets
- `ELEVENLABS_AGENT_ID` muss noch hinzugefügt werden (Agent muss im ElevenLabs-Dashboard erstellt werden)

## Technische Details

- Transkript-Sammlung erfolgt im `onMessage`-Callback des `useConversation` Hooks
- Key Points: Jede User-Aussage wird als separater Key Point gespeichert; kurze Filler-Sätze werden gefiltert
- Kein Backend-Processing nötig -- alles läuft client-side + direkter Supabase Insert

