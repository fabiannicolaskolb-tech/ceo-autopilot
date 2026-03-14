import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FloatingHeader } from '@/components/ui/floating-header';
import { Particles } from '@/components/ui/particles';

function ProtectedLayout() {
  const { user, profile, loading } = useAuth();

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
      <Particles className="absolute inset-0 z-0" quantity={80} color="#1a2740" size={0.5} />
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
