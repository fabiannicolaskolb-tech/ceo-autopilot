

## Plan: Particle Burst bei Navigation-Tab-Wechsel

Die `Particles`-Komponente in `ProtectedLayout` hat bereits den `burst`-Prop. Auf der Auth-Seite wird ein `burstKey`-Counter hochgezählt, um den Burst auszulösen.

**Änderungen:**

1. **`src/components/ProtectedLayout.tsx`**: State `burstKey` hinzufügen, der sich bei jeder Änderung von `location.pathname` erhöht. Diesen als `burst`-Prop an `<Particles>` weitergeben.

Das ist alles — `useLocation()` wird bereits indirekt genutzt (über `FloatingHeader`), und die `Particles`-Komponente unterstützt `burst` schon. Ein einziger `useEffect` auf `location.pathname` reicht.

