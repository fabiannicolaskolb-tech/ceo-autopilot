

# Drag-Handle unter das Bild verschieben

## Änderung

In `src/pages/ProfilePage.tsx` (Zeile 269-272): Das GripVertical-Icon von `absolute -top-2` (über dem Bild) nach unter das Bild verschieben. Statt absolut positioniert wird es als normales Element unterhalb der `PhotoUpload`-Komponente platziert — zentriert, mit etwas Abstand.

```tsx
// Vorher: absolute -top-2 (über dem Bild/Label)
// Nachher: unterhalb von PhotoUpload, im normalen Flow
<PhotoUpload ... />
{hasImage && (
  <div className="flex justify-center mt-1 cursor-grab active:cursor-grabbing">
    <div className="rounded-full bg-muted p-1 shadow-sm border border-border">
      <GripVertical className="h-3 w-3 text-muted-foreground" />
    </div>
  </div>
)}
```

Eine Datei, eine Stelle.

