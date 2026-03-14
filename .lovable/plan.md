

# Interactive Hover Button Integration

## What

Add the Magic UI `InteractiveHoverButton` component and use it for primary action buttons across the app — replacing standard `<Button>` on key CTAs (not all buttons, only prominent ones).

## Component Source

The component from Magic UI (verified from docs):

```tsx
// src/components/ui/interactive-hover-button.tsx
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border bg-background p-2 px-6 text-center font-medium",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary transition-all duration-300 group-hover:scale-[100.8]" />
        <span className="inline-flex translate-x-0 items-center transition-all duration-300 group-hover:-translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        {children}
        <ArrowRight />
      </div>
    </button>
  )
}
```

No new dependencies needed — `lucide-react` is already installed.

## Where to Apply

Replace primary CTA `<Button>` with `<InteractiveHoverButton>` in these locations:

| Page | Button | Current |
|---|---|---|
| **DashboardPage** | "Zum Planner" / "Zum Ideation Lab" | `<Button size="sm">` |
| **IdeationPage** | "Ideen generieren" | `<Button onClick={generate}>` |
| **OnboardingPage** | "Weiter" + "Abschließen" (bottom bar) | `<Button>` |
| **AuthPage** | "Anmelden" / "Registrieren" | `<Button type="submit">` |

Secondary/utility buttons (icon buttons, "Zurück", outline variants) remain as standard `<Button>`.

## Files Changed (6)

1. **Create** `src/components/ui/interactive-hover-button.tsx` — component source
2. **Edit** `src/pages/DashboardPage.tsx` — CTA button
3. **Edit** `src/pages/IdeationPage.tsx` — generate button
4. **Edit** `src/pages/OnboardingPage.tsx` — "Weiter" and "Abschließen"
5. **Edit** `src/pages/AuthPage.tsx` — login/register submit buttons
6. **Edit** `src/pages/PlannerPage.tsx` — any primary CTA if present

