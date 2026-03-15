

## Plan: "Gespräch starten" Button in eigene Box auslagern

### Änderungen in `src/pages/IdeationPage.tsx`

**Desktop (Zeilen 296-319):** Den "Gespräch starten" Button aus der Actions-Row entfernen. Stattdessen unterhalb der ResizablePanelGroup eine neue Card einfügen:

```
┌──────────────────────────────────────────────┐
│ 🎙  Gespräch starten                        │
│                                              │
│  Starten Sie ein Gespräch und erzählen Sie   │
│  uns von Ihren Ideen — wir machen Content    │
│  daraus.                                     │
│                                              │
│  [ Gespräch starten → ]                      │
└──────────────────────────────────────────────┘
```

- Card mit `rounded-[24px]`, passendem backdrop-blur Styling (wie die anderen Cards)
- Flex-Layout mit Icon/Text links und Button rechts
- Button als `InteractiveHoverButton` oder prominent gestylter Button mit `MessageSquare`-Icon

**Mobile (Zeilen 430-438):** Gleicher Ansatz — den kleinen "Gespräch"-Button entfernen und stattdessen eine eigene Card unterhalb des Textfeldes/Actions einfügen, kompakter aber gleiche Struktur.

### Betroffene Stellen
- Zeilen 311-318 (Desktop Button entfernen)
- Zeilen 430-438 (Mobile Button entfernen)  
- Neue Card-Section nach Zeile 367 (Desktop) und nach Zeile 439 (Mobile)

