

# Fix: Glow-Kanten am XP-Kreis

## Problem
Der SVG-Glow-Filter wird an den Rändern des `<svg>`-Elements abgeschnitten, weil SVG standardmäßig Overflow versteckt. Der Blur-Effekt ragt über die SVG-Grenzen hinaus und wird hart abgeschnitten – daher die sichtbaren Kanten.

## Lösung

### `src/components/CreatorScoreCard.tsx`

1. **SVG overflow sichtbar machen**: `overflow="visible"` zum `<svg>`-Element hinzufügen und `style={{ overflow: 'visible' }}` setzen.

2. **SVG größer machen mit Padding**: Alternativ/zusätzlich die SVG-Viewbox und Größe um ~20px erweitern, damit der Glow-Bereich innerhalb des SVG bleibt. Die Kreise bleiben zentriert.

Konkret:
- `<svg>` bekommt `overflow="visible"` und `style={{ overflow: 'visible' }}`
- Der umgebende Container (`<div className="relative">`) bekommt kein `overflow-hidden`
- Filter-Region bleibt bei `-50%` / `200%` (ausreichend groß)

Das ist ein Ein-Zeilen-Fix am SVG-Tag.

