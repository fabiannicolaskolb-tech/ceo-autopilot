import React from 'react';

export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Violet radial glow - top left */}
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,hsl(263_65%_60%/0.15),transparent_70%)] blur-3xl animate-pulse dark:bg-[radial-gradient(circle,hsl(263_65%_60%/0.12),transparent_70%)]" style={{ animationDuration: '8s' }} />
      {/* Soft lavender glow - bottom right */}
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,hsl(270_50%_75%/0.12),transparent_70%)] blur-3xl animate-pulse dark:bg-[radial-gradient(circle,hsl(270_55%_55%/0.1),transparent_70%)]" style={{ animationDuration: '12s' }} />
      {/* Warm beige center (light) / deep violet center (dark) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,hsl(30_25%_85%/0.2),transparent_70%)] blur-3xl animate-pulse dark:bg-[radial-gradient(circle,hsl(263_50%_50%/0.08),transparent_70%)]" style={{ animationDuration: '10s' }} />
    </div>
  );
}
