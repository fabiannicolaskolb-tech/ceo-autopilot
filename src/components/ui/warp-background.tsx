import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { HTMLAttributes, useCallback, useMemo } from "react";

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  perspective?: number;
  beamsPerSide?: number;
  beamSize?: number;
  beamDelayMax?: number;
  beamDelayMin?: number;
  beamDuration?: number;
  gridColor?: string;
}

const Beam = ({
  width,
  x,
  delay,
  duration,
}: {
  width: string | number;
  x: string | number;
  delay: number;
  duration: number;
}) => {
  // Blue hues only: 200-240 range
  const hue = Math.floor(Math.random() * 40) + 200;
  const ar = Math.floor(Math.random() * 10) + 1;

  return (
    <motion.div
      style={{
        "--x": `${x}%`,
        "--width": `${width}%`,
        "--aspect-ratio": ar,
        "--background": `linear-gradient(hsl(${hue} 80% 60%), transparent)`,
      } as React.CSSProperties}
      className="absolute top-0 left-[var(--x)] h-full w-[var(--width)] [aspect-ratio:1/var(--aspect-ratio)] [background:var(--background)]"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: "-100%", opacity: [0, 1, 1, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
  children,
  perspective = 100,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  gridColor = "hsl(var(--border))",
  ...props
}) => {
  const generateBeams = useCallback(() => {
    const beams = [];
    const cellsPerSide = Math.floor(100 / beamSize);
    const step = cellsPerSide / beamsPerSide;

    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step);
      const delay =
        Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin;
      beams.push({ x, delay });
    }
    return beams;
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin]);

  const topBeams = useMemo(() => generateBeams(), [generateBeams]);
  const rightBeams = useMemo(() => generateBeams(), [generateBeams]);
  const bottomBeams = useMemo(() => generateBeams(), [generateBeams]);
  const leftBeams = useMemo(() => generateBeams(), [generateBeams]);

  return (
    <div
      className={cn("relative min-h-screen w-full overflow-hidden", className)}
      {...props}
    >
      <div
        style={{ "--perspective": `${perspective}px` } as React.CSSProperties}
        className="pointer-events-none absolute inset-0 [perspective:var(--perspective)]"
      >
        <div
          className="absolute inset-0"
          style={{
            transform: "rotateX(45deg)",
            backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
            backgroundSize: `${beamSize}% ${beamSize}%`,
          }}
        >
          {/* top side */}
          <div className="absolute inset-0 overflow-hidden">
            {topBeams.map((beam, index) => (
              <Beam
                key={`top-${index}`}
                width={beamSize}
                x={beam.x * beamSize}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>

          {/* bottom side */}
          <div className="absolute inset-0 rotate-180 overflow-hidden">
            {bottomBeams.map((beam, index) => (
              <Beam
                key={`bottom-${index}`}
                width={beamSize}
                x={beam.x * beamSize}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>

          {/* left side */}
          <div className="absolute inset-0 -rotate-90 overflow-hidden">
            {leftBeams.map((beam, index) => (
              <Beam
                key={`left-${index}`}
                width={beamSize}
                x={beam.x * beamSize}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>

          {/* right side */}
          <div className="absolute inset-0 rotate-90 overflow-hidden">
            {rightBeams.map((beam, index) => (
              <Beam
                key={`right-${index}`}
                width={beamSize}
                x={beam.x * beamSize}
                delay={beam.delay}
                duration={beamDuration}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};
