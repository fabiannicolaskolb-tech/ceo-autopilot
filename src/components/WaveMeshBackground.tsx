import React from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * Wavy mesh/ogee grid pattern background.
 * Renders an SVG tile that repeats across the viewport.
 * Adapts to light/dark mode using the project's color tokens.
 */
export function WaveMeshBackground() {
  const { theme } = useTheme();

  // Stroke color adapted to the project's navy-based palette
  const strokeColor =
    theme === 'dark'
      ? 'hsl(220 20% 28% / 0.35)'
      : 'hsl(220 30% 70% / 0.25)';

  const strokeWidth = theme === 'dark' ? 0.8 : 0.6;

  // The ogee / wave-mesh tile – one repeating unit
  // Creates the interlocking wave pattern seen in the reference
  const tileSize = 60;
  const half = tileSize / 2;

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {/* Gradient overlay for depth – fades to background at edges */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/60 via-transparent to-background/90" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/40 via-transparent to-background/40" />

      {/* SVG repeating pattern */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="waveMesh"
            x="0"
            y="0"
            width={tileSize}
            height={tileSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Top-left to center curve */}
            <path
              d={`M 0 ${half} Q ${half * 0.5} ${half * 0.35}, ${half} 0`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Center to bottom-right curve */}
            <path
              d={`M ${half} 0 Q ${half * 1.5} ${half * 0.35}, ${tileSize} ${half}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Bottom-left mirrored curve */}
            <path
              d={`M 0 ${half} Q ${half * 0.5} ${half * 1.65}, ${half} ${tileSize}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Bottom-right mirrored curve */}
            <path
              d={`M ${half} ${tileSize} Q ${half * 1.5} ${half * 1.65}, ${tileSize} ${half}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waveMesh)" />
      </svg>

      {/* Subtle radial glow in project accent colors */}
      <div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle, hsl(220 55% 25% / 0.5), transparent 70%)'
              : 'radial-gradient(circle, hsl(220 60% 85% / 0.5), transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[700px] w-[700px] rounded-full blur-3xl opacity-20"
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(circle, hsl(270 50% 30% / 0.4), transparent 70%)'
              : 'radial-gradient(circle, hsl(260 50% 88% / 0.4), transparent 70%)',
        }}
      />
    </div>
  );
}
