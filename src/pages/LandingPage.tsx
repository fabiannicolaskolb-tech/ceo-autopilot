import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Lightbulb, CalendarDays, BarChart3, Shield, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Lightbulb,
    title: 'Ideation',
    headline: 'Wir finden Ihre Themen.',
    description: 'KI-gestützte Content-Ideen, die zu Ihrer Expertise und Zielgruppe passen.',
  },
  {
    icon: CalendarDays,
    title: 'Planning',
    headline: 'Volle Kontrolle über Ihren Zeitplan.',
    description: 'Strategische Planung und Freigabe – Sie behalten immer das letzte Wort.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    headline: 'Datenbasierte Optimierung.',
    description: 'Verstehen Sie, was funktioniert, und steigern Sie Ihre Reichweite systematisch.',
  },
];

const trustItems = [
  {
    icon: Shield,
    title: 'DSGVO-konform',
    description: 'Alle Daten werden in der EU gespeichert und verarbeitet.',
  },
  {
    icon: Lock,
    title: 'Ende-zu-Ende verschlüsselt',
    description: 'Ihre Inhalte und Strategien sind vollständig geschützt.',
  },
  {
    icon: UserCheck,
    title: 'Exklusiver Zugang',
    description: 'Nur für verifizierte Führungskräfte – Qualität vor Quantität.',
  },
];

export default function LandingPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.onboarding_completed ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-playfair text-[15px] font-semibold tracking-tight text-foreground">
              CEO Autopilot
            </span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/auth">Anmelden</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <AuroraBackground className="min-h-[70vh] px-4 py-20 sm:py-32">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="font-playfair text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Ihre digitale Präsenz auf LinkedIn – Vollautomatisiert &amp; Authentisch.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-inter text-lg text-muted-foreground sm:text-xl">
            KI-gestütztes Personal Branding für Führungskräfte im Mittelstand.
            Wir verwandeln Ihre Erfahrung in Reichweite.
          </p>
          <div className="mt-10">
            <InteractiveHoverButton
              onClick={() => navigate('/auth')}
              className="text-base px-8 py-3"
            >
              Get Started
            </InteractiveHoverButton>
          </div>
        </div>
      </AuroraBackground>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-12 text-center">
          <h2 className="font-playfair text-3xl font-bold text-foreground sm:text-4xl">
            Alles, was Sie brauchen
          </h2>
          <p className="mt-3 text-muted-foreground">
            Drei Module für Ihren LinkedIn-Erfolg
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border-border shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-playfair text-lg font-semibold text-foreground">
                  {f.headline}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-12 text-center">
            <h2 className="font-playfair text-3xl font-bold text-foreground sm:text-4xl">
              Sicherheit &amp; Diskretion
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ihre Daten verdienen höchsten Schutz
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-playfair text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CEO Autopilot
            </span>
          </div>
          <span className="text-xs text-muted-foreground">DSGVO-konform · Made in Germany</span>
        </div>
      </footer>
    </div>
  );
}
