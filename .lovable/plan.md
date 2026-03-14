

# Executive Voice Copilot -- Plan

## Übersicht

Erweiterung des Ideation Labs um einen sprachbasierten "Executive Voice Copilot", der ElevenLabs Conversational AI nutzt. Der CEO kann ein Gespräch mit einem strategischen Sparringspartner führen, dessen Erkenntnisse automatisch als Content-Ideen extrahiert werden.

## Voraussetzung: ElevenLabs Connector

Es gibt aktuell **keine ElevenLabs-Verbindung** im Workspace. Bevor die Implementierung beginnen kann, muss der ElevenLabs-Connector eingerichtet werden, damit der API-Key als Secret verfügbar ist. Zusätzlich wird ein **ElevenLabs Agent** im ElevenLabs-Dashboard konfiguriert werden müssen (Agent-ID, System-Prompt als "Strategischer Sparringspartner", deutsche Sprache).

Außerdem wird ein neues Secret `N8N_VOICE_PROCESSOR_URL` benötigt für den Webhook, der die Gesprächsergebnisse verarbeitet.

## Architektur

```text
┌─────────────────────────────────────────────┐
│  IdeationPage                               │
│  ┌─────────────────────────────────────────┐ │
│  │ 🎙️ "Gespräch starten" Button           │ │
│  └────────────┬────────────────────────────┘ │
│               ▼                              │
│  ┌─────────────────────────────────────────┐ │
│  │ VoiceCopilotModal (Overlay)             │ │
│  │  - Waveform-Visualizer                  │ │
│  │  - Status: "Ich höre zu..."             │ │
│  │  - ElevenLabs useConversation Hook      │ │
│  │  - "Gespräch beenden" Button            │ │
│  └────────────┬────────────────────────────┘ │
│               ▼ onEnd                        │
│  Edge Function: voice-copilot-token          │
│  Edge Function: voice-copilot-process        │
│               ▼                              │
│  n8n Webhook (N8N_VOICE_PROCESSOR_URL)       │
│               ▼ callback                     │
│  n8n-callback → DB update / Realtime         │
│               ▼                              │
│  "Vorgeschlagene Themen" Karten              │
└─────────────────────────────────────────────┘
```

## Implementierungsschritte

### 1. Secrets & Connector einrichten
- ElevenLabs-Connector verbinden (liefert `ELEVENLABS_API_KEY`)
- Neues Secret `N8N_VOICE_PROCESSOR_URL` hinzufügen
- Neues Secret `ELEVENLABS_AGENT_ID` hinzufügen (Agent muss im ElevenLabs-Dashboard erstellt werden)

### 2. Edge Function: `voice-copilot-token`
- Generiert ein WebRTC Conversation Token via ElevenLabs API
- Nutzt `ELEVENLABS_API_KEY` und `ELEVENLABS_AGENT_ID`
- Registrierung in `config.toml`

### 3. Edge Function: `voice-copilot-process`
- Wird nach Gesprächsende aufgerufen
- Sendet `conversation_id` + `user_id` an `N8N_VOICE_PROCESSOR_URL`
- n8n extrahiert Key-Facts und liefert sie via bestehender `n8n-callback` Edge Function zurück

### 4. Datenbank: `voice_insights` Tabelle
- Neue Tabelle für von n8n zurückgelieferte Erkenntnisse:
  - `id`, `user_id`, `conversation_id`, `hook`, `type`, `angle`, `preview`, `score`, `category`, `created_at`
- RLS: Nutzer sehen nur eigene Einträge
- Die `n8n-callback` Function wird erweitert, um auch `voice_insights` zu befüllen

### 5. NPM-Paket installieren
- `@elevenlabs/react` für den `useConversation` Hook

### 6. Neue Komponente: `VoiceCopilotModal`
- **Design**: Fullscreen-Overlay, dunkler Hintergrund (`bg-slate-950`), weißer Text
- **Waveform**: Canvas-basierter Audio-Visualizer, der `getOutputByteFrequencyData()` vom ElevenLabs Hook nutzt
- **States**: Connecting → Listening → Speaking → Processing → Done
- **Flow**:
  1. Modal öffnet sich, fordert Mikrofon-Permission
  2. Holt Token via `voice-copilot-token` Edge Function
  3. Startet ElevenLabs Conversation Session (WebRTC)
  4. Zeigt live Waveform + Status
  5. Bei "Beenden": `endSession()`, zeigt "Erkenntnisse werden extrahiert..."
  6. Ruft `voice-copilot-process` auf mit `conversation_id`

### 7. IdeationPage Erweiterung
- "🎙️ Gespräch starten" Button neben dem Textarea
- Nutzen-Erklärung: _"Erzählen Sie mir von Ihrem Tag. Ich filtere die besten Geschichten für Ihr LinkedIn-Profil heraus."_
- Neuer Abschnitt "Vorgeschlagene Themen aus Ihrem letzten Gespräch" der `voice_insights` per Query lädt und als Concept-Cards rendert (gleiches Design wie generierte Ideen)

### 8. n8n-callback Erweiterung
- Unterstützung für einen neuen `type: "voice_insights"` Parameter
- Bei diesem Typ: Insert in `voice_insights` statt Update auf `posts`

## Technische Details

- **Audio-Visualizer**: `requestAnimationFrame`-Loop, liest Frequenzdaten vom ElevenLabs Hook, rendert weiche Balken auf Canvas
- **Realtime-Updates**: Optional Supabase Realtime Subscription auf `voice_insights` für automatische UI-Updates nach n8n-Callback
- **Microphone UX**: Permission-Request mit erklärendem Dialog bevor das Modal den Zugriff anfordert

