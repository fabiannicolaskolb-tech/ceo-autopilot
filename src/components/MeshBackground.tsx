import React from 'react';

export function MeshBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,hsl(220_60%_85%/0.4),transparent_70%)] blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,hsl(260_50%_88%/0.3),transparent_70%)] blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,hsl(200_60%_90%/0.2),transparent_70%)] blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
    </div>
  );
}
