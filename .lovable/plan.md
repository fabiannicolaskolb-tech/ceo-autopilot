

## Plan: Use framer-motion AnimatePresence for Feature Card Screenshots

### Problem
The current CSS `max-h` transition approach doesn't animate smoothly because `max-height` transitions are inherently janky (the browser doesn't know the actual content height).

### Solution
Replace the CSS-based expand/collapse with `framer-motion`'s `AnimatePresence` + `motion.div` using `height: "auto"` animation, which calculates the real height and animates fluidly. No need for the full PopoverForm component — we just need the animation pattern from it.

### Changes

**1. `src/pages/LandingPage.tsx`**
- Import `AnimatePresence` and `motion` from `framer-motion`
- Keep the two-stage `expandedFeature` / `colSpanFeature` state logic (it works well for the grid layout transition)
- Replace the CSS `max-h` image container with:
  ```tsx
  <AnimatePresence>
    {isExpanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6">
          <img src={previewImage} ... />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  ```
- Keep the hidden/visible card CSS transitions as-is (they work fine for showing/hiding peer cards)

No new component file needed — we just apply the framer-motion animation pattern directly where the screenshot expands.

