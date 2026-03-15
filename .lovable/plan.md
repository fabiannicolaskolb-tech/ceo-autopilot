

## Plan: Analytics-Karte über die anderen expandieren

### Aktueller Zustand
Die Analytics-Karte expandiert nur vertikal innerhalb ihrer Grid-Spalte. Die anderen Karten werden per `opacity: 0, height: 0` versteckt, aber die Analytics-Karte bleibt in ihrer Spalte.

### Gewünschtes Verhalten
Beim Klick soll die Analytics-Karte sich über alle drei Spalten ausdehnen (wie vorher), sodass das Bild groß und zentriert angezeigt wird.

### Änderungen in `src/pages/LandingPage.tsx`

1. **Analytics-Karte über volle Breite**: Wenn expandiert, `sm:col-span-3` auf die Analytics `motion.div` setzen, damit sie die gesamte Grid-Breite einnimmt.

2. **Andere Karten ausblenden**: Die bestehende `isHidden`-Animation (`opacity: 0, scale: 0.9, height: 0`) bleibt, plus `overflow: 'hidden'` und `padding: 0` damit sie komplett verschwinden.

3. **Layout-Animation**: `layout` auf der `motion.div` sorgt dafür, dass framer-motion die Größenänderung animiert. Die Grid-Transition wird durch `transition-all` auf dem Grid-Container unterstützt.

### Konkreter Ansatz
- Zeile 193: className dynamisch erweitern um `${isExpanded ? 'sm:col-span-3' : ''}`
- Zeile 188: Bei `isHidden` auch `overflow: 'hidden', padding: 0` hinzufügen

