"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          let targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    return (
      <div
        ref={containerRef}
        style={
          {
            "--blur": `${blur}px`,
            "--spread": spread,
            "--start": "0",
            "--active": "0",
            "--glowingeffect-border-width": `${borderWidth}px`,
            "--repeating-conic-gradient-times": "5",
            "--gradient":
              variant === "white"
                ? `repeating-conic-gradient(
                    from calc(var(--start) * 1deg),
                    hsl(0 0% 100% / 0.8) 0%,
                    hsl(0 0% 100% / 0.4) calc(100% / var(--repeating-conic-gradient-times)),
                    hsl(0 0% 100% / 0) calc(200% / var(--repeating-conic-gradient-times)),
                    hsl(0 0% 100% / 0) calc(300% / var(--repeating-conic-gradient-times)),
                    hsl(0 0% 100% / 0.4) calc(400% / var(--repeating-conic-gradient-times)),
                    hsl(0 0% 100% / 0.8) calc(500% / var(--repeating-conic-gradient-times))
                  )`
                : `repeating-conic-gradient(
                    from calc(var(--start) * 1deg),
                    hsl(var(--primary)) 0%,
                    hsl(var(--primary) / 0.6) calc(100% / var(--repeating-conic-gradient-times)),
                    hsl(var(--accent) / 0) calc(200% / var(--repeating-conic-gradient-times)),
                    hsl(var(--accent) / 0) calc(300% / var(--repeating-conic-gradient-times)),
                    hsl(var(--primary) / 0.6) calc(400% / var(--repeating-conic-gradient-times)),
                    hsl(var(--primary)) calc(500% / var(--repeating-conic-gradient-times))
                  )`,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300",
          "opacity-[var(--active)]",
          glow && "opacity-100",
          blur > 0 && "blur-[var(--blur)]",
          className,
          disabled && "!hidden"
        )}
      >
        <div
          className={cn(
            "absolute inset-[calc(-1*var(--glowingeffect-border-width))] rounded-[inherit]",
            "[background:var(--gradient)] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
            "[mask-composite:exclude] [padding:var(--glowingeffect-border-width)]",
            "![mask-clip:padding-box,border-box]"
          )}
        />
        {glow && (
          <div
            className={cn(
              "absolute inset-[calc(-1*var(--glowingeffect-border-width))] rounded-[inherit]",
              "[background:var(--gradient)]",
              "opacity-[calc(var(--active)*0.25)]",
              `blur-[calc(var(--spread)*1px)]`,
              "[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
              "[mask-composite:exclude] [padding:var(--glowingeffect-border-width)]",
              "![mask-clip:padding-box,border-box]"
            )}
          />
        )}
      </div>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
