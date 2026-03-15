

## Plan: Screenshot zentrieren & Kästen beim Schließen wieder einblenden

### Problem
1. Das Bild in der expandierten Analytics-Karte ist nicht mittig zentriert
2. Beim Schließen erscheinen die anderen Kästen nicht wieder (die `exit`-Animation in Zeile 190 setzt `opacity: 1` zurück, aber die Kästen werden per `isHidden`-Bedingung komplett aus dem Render entfernt statt per AnimatePresence gesteuert)

### Änderungen in `src/pages/LandingPage.tsx`

1. **Bild zentrieren**: Das expandierte Layout von horizontal (flex-row mit Text links, Bild rechts) auf vertikal zentriert ändern – Text oben zentriert, Bild darunter mittig mit `max-w-3xl mx-auto`.

2. **Kästen wieder einblenden**: Die versteckten Kästen müssen weiterhin gerendert werden (nicht per `if (isHidden) return`), sondern per `animate`-Property gesteuert werden. Wenn `expandedFeature` auf `null` gesetzt wird, animieren sie zurück zu `opacity: 1, scale: 1, height: 'auto'`.

### Konkreter Code-Ansatz

**Zeilen 184-194** (isHidden-Block): Statt frühes Return → `animate` auf den motion.div setzen mit bedingter opacity/height, sodass AnimatePresence den Rückweg animieren kann.

**Zeilen 206-216** (expandiertes Layout): Statt `flex-row` → zentriertes vertikales Layout mit dem Bild mittig darunter (`flex flex-col items-center text-center`).

**Zeilen 224**: Bild-Container von `flex-1 sm:py-6 sm:pr-6 sm:pl-0` → `w-full max-w-3xl mx-auto p-6`.

