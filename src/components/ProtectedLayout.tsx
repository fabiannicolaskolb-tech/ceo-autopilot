import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FloatingHeader } from '@/components/ui/floating-header';
import { Particles } from '@/components/ui/particles';
import { WaveMeshBackground } from '@/components/WaveMeshBackground';
import { useTheme } from '@/hooks/useTheme';

function ProtectedLayout() {
  const { user, profile, loading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    setBurstKey(k => k + 1);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse font-playfair text-xl text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse font-playfair text-xl text-muted-foreground">Laden...</div>
      </div>
    );
  }
  if (!profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  return (
    <div className="relative min-h-screen bg-background">
      <WaveMeshBackground />
      <Particles className="absolute inset-0 z-0" quantity={150} color={theme === 'dark' ? '#8899bb' : '#1a2740'} size={0.5} burst={burstKey} />
      <div className="relative z-10">
        <FloatingHeader />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ProtectedLayout;
