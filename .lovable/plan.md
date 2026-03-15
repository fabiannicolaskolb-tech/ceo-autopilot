

## Plan: Glow-Effekt auf statisches Blau ändern

### Problem
Der Glow-Effekt der Onboarding-Karten durchläuft per `hue-animation` das gesamte Farbspektrum (0°–360°). Stattdessen soll ein konstantes Blau leuchten.

### Änderungen in `src/index.css`

1. **`hue-animation` entfernen** aus der `animation`-Property in `.glow-content:before` (Zeile 287) — nur `rotate-bg` behalten.

2. **Feste blaue Farbe setzen**: Den `--hue`-Wert fest auf `217` setzen (entspricht dem blauen Glow von den Workflow-Icons) und den `radial-gradient` mit festen blauen HSL-Werten ersetzen:
   - `hsl(217 90% 90%)`, `hsl(217 90% 80%)`, `hsl(217 90% 60%)`

3. **`@keyframes hue-animation` entfernen** (Zeilen 320-323), da nicht mehr benötigt.

### Ergebnis
Die Glow-Border der Karten leuchtet konstant in Blau und bewegt sich weiterhin um die Karte herum (rotate-bg bleibt), ohne die Farbe zu wechseln.

