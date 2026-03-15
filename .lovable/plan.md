

## Plan: Analytics-Karte expandiert groß und schiebt andere Karten weg

### Konzept
Wenn die Analytics-Karte ("Datenbasierte Optimierung") geklickt wird, spannt sie sich auf volle Breite (3 Spalten) auf und zeigt das Bild groß an. Die anderen beiden Karten werden per Animation ausgeblendet/weggeschoben. Beim Schließen kehrt alles zum 3-Spalten-Layout zurück.

### Umsetzung in `src/pages/LandingPage.tsx`

1. **Grid-Layout dynamisch ändern**: Wenn `expandedFeature === 'Analytics'`, wird das Grid auf 1 Spalte umgestellt. Die Analytics-Karte nimmt die volle Breite ein.

2. **Andere Karten ausblenden**: Die Ideation- und Planning-Karten werden mit `AnimatePresence` + `motion.div` animiert rausgeschoben (opacity: 0, scale: 0.95, height: 0) und per `overflow-hidden` versteckt.

3. **Analytics-Karte expandiert**: Das Bild wird deutlich größer angezeigt (volle Breite der Karte). Layout wechselt zu horizontal: Karteninhalt links, großes Bild rechts.

4. **Theme-Anpassung des Bildes**: 
   - Dark Mode: `dark:brightness-90 dark:contrast-110` (bereits vorhanden)
   - Light Mode: Standard-Darstellung, ggf. `light:brightness-105` für helleren Look

### Animationsdetails
- Andere Karten: `exit={{ opacity: 0, scale: 0.9, height: 0 }}` mit 0.3s
- Analytics-Karte: Layout-Animation via `motion.div layout` für smooth Resize
- Bild: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`

