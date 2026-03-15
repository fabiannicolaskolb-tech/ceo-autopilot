

## Plan: Workflow-Icons mit Glow-Gelb Hover-Effekt

### Änderung

In `src/pages/LandingPage.tsx` (Zeilen 153-156): Die Workflow-Karten und Icons bekommen einen gelben Glow-Effekt beim Hover.

- **Icon-Farbe**: `text-foreground/70` → zusätzlich `group-hover:text-yellow-400 transition-colors duration-300`
- **Container**: `group` Klasse hinzufügen + `hover:shadow-[0_8px_28px_-4px_hsl(42_85%_55%/0.35)]` für gelben Glow-Schatten
- Die parent `div` bekommt `group`, damit das Icon auf den Container-Hover reagiert

### Ergebnis
Beim Hover über eine Workflow-Karte wechselt das Icon sanft zu leuchtendem Gelb mit einem goldenen Schatten-Glow um die Karte.

