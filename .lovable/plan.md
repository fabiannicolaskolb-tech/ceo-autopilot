

## Plan: Analytics-Karte mit Klick-Animation und Kalender-Vorschaubild

### Was passiert
Beim Klick auf die Feature-Karte "Datenbasierte Optimierung" (Analytics) klappt sich darunter ein Vorschaubild des Kalenders auf – animiert mit smooth expand. Das Bild wird an Dark/Light Mode angepasst (CSS-Filter: im Dark Mode leicht aufgehellt/invertiert, im Light Mode normal).

### Umsetzung

1. **Bild kopieren** → `src/assets/calendar-preview.png`

2. **LandingPage.tsx ändern**:
   - `useState` für `expandedFeature` (string | null)
   - Beim Klick auf eine Feature-Karte: Toggle `expandedFeature`
   - Nur die Analytics-Karte ("Analytics") bekommt ein expandierbares Vorschaubild
   - Unterhalb der Karten-Inhalte: AnimatePresence + motion.div mit height-Animation zeigt das Bild
   - Bild erhält `className` mit `dark:brightness-90 dark:contrast-110` o.ä. für Theme-Anpassung
   - Cursor auf `pointer` für die Analytics-Karte

3. **Animation**: Framer Motion `AnimatePresence` mit `initial={{ height: 0, opacity: 0 }}`, `animate={{ height: 'auto', opacity: 1 }}`, `exit={{ height: 0, opacity: 0 }}` – smooth accordion-style.

