import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Lightbulb, CalendarDays, BarChart3, Shield, Lock, UserCheck, ArrowUp, Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Button } from '@/components/ui/button';
import { TypingAnimation } from '@/components/ui/typing-animation';
import analyticsPreview from '@/assets/analytics-preview.png';
import calendarPreview from '@/assets/ki-optimierung-preview.png';
import plannerPreview from '@/assets/planner-preview.png';
import ideationPreview from '@/assets/ideation-preview.png';

const features = [
{
  icon: Lightbulb,
  title: 'Ideation',
  headline: 'Wir finden Ihre Themen.',
  description: 'KI-gestützte Content-Ideen, die zu Ihrer Expertise und Zielgruppe passen.'
},
{
  icon: CalendarDays,
  title: 'Planning',
  headline: 'Volle Kontrolle über Ihren Zeitplan.',
  description: 'Strategische Planung und Freigabe – Sie behalten immer das letzte Wort.'
},
{
  icon: BarChart3,
  title: 'Analytics',
  headline: 'Datenbasierte Optimierung.',
  description: 'Verstehen Sie, was funktioniert, und steigern Sie Ihre Reichweite systematisch.'
}];


const trustItems = [
{
  icon: Shield,
  title: 'DSGVO-konform',
  description: 'Alle Daten werden in der EU gespeichert und verarbeitet.'
},
{
  icon: Lock,
  title: 'Ende-zu-Ende verschlüsselt',
  description: 'Ihre Inhalte und Strategien sind vollständig geschützt.'
},
{
  icon: UserCheck,
  title: 'Exklusiver Zugang',
  description: 'Nur für verifizierte Führungskräfte – Qualität vor Quantität.'
}];


export default function LandingPage() {
  const { user, profile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [colSpanFeature, setColSpanFeature] = useState<string | null>(null);

  const handleFeatureClick = (title: string) => {
    if (expandedFeature === title) {
      // Closing: first collapse image, then after delay remove col-span & show others
      setExpandedFeature(null);
      setTimeout(() => setColSpanFeature(null), 500);
    } else {
      // Opening: set col-span immediately, then expand
      setColSpanFeature(title);
      setExpandedFeature(title);
    }
  };

  useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.onboarding_completed ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="relative min-h-screen bg-background">
      
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">Anmelden</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Text */}
      <AuroraBackground className="px-4 pt-20 pb-0 sm:pt-32">
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
              className="text-base px-8 py-3">
              
              Get Started
            </InteractiveHoverButton>
          </div>
        </div>
        {/* Scroll Animation with Analytics Preview */}
        <div className="relative z-10 w-full">
          <ContainerScroll
            titleComponent={
            <h2 className="font-playfair text-3xl font-bold text-foreground sm:text-4xl mb-[90px] lg:text-6xl mt-16 sm:mt-0">
                Datenbasierte Einblicke <br />
                <span className="text-primary">in Echtzeit</span>
              </h2>
            }>
            
            <img
              src={analyticsPreview}
              alt="CEO Autopilot Analytics Tool Vorschau"
              className="mx-auto rounded-2xl object-cover h-full w-full object-[15%_0%]"
              draggable={false} />
            
          </ContainerScroll>
        </div>
      </AuroraBackground>

      {/* Workflow Process */}
      <section className="bg-[hsl(var(--feature-bg))]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-6 text-center">
            <TypingAnimation
              text="Planung: Volle Kontrolle über Ihren Content-Kalender"
              duration={53}
              className="font-playfair text-3xl font-bold text-foreground sm:text-4xl"
            />
          </div>
          <p className="mx-auto mb-14 max-w-2xl text-center text-muted-foreground">
            Strategische Planung, Freigabe-Workflows und automatisches Scheduling – Sie behalten immer das letzte Wort, während wir die Arbeit übernehmen.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { icon: Lightbulb, label: 'Ideation' },
              { icon: CalendarDays, label: 'Planung' },
              { icon: Zap, label: 'KI-Optimierung' },
              { icon: BarChart3, label: 'Analyse' },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.label}>
                <div className="group flex flex-col items-center gap-3">
                  <div className="flex h-24 w-32 items-center justify-center rounded-2xl bg-[hsl(var(--feature-card))] shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_-4px_hsl(217_90%_60%/0.4)]">
                    <step.icon className="h-8 w-8 text-foreground/70 transition-colors duration-300 group-hover:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{step.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <span className="hidden text-muted-foreground/40 sm:block mb-6">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-14 text-center">
            <h2 className="font-playfair text-3xl font-bold text-foreground sm:text-4xl">
              Alles was Sie brauchen – Drei Module für Ihren Erfolg.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
           {features.map((f) => {
              const isExpanded = expandedFeature === f.title;
              const hasColSpan = colSpanFeature === f.title;
              const isHidden = (expandedFeature != null && expandedFeature !== f.title) || (colSpanFeature != null && colSpanFeature !== f.title);
              const previewImage = f.title === 'Analytics' ? calendarPreview : f.title === 'Planning' ? plannerPreview : ideationPreview;

              return (
                <motion.div
                  key={f.title}
                  onClick={() => handleFeatureClick(f.title)}
                  className={`group relative cursor-pointer overflow-hidden rounded-xl bg-card shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.08)] hover:shadow-[0_12px_32px_-4px_hsl(220_55%_20%/0.16)] ${hasColSpan ? 'sm:col-span-3' : ''}`}
                  animate={{
                    opacity: isHidden ? 0 : 1,
                    height: isHidden ? 0 : 'auto',
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                  style={isHidden ? { margin: 0, padding: 0, border: 'none', overflow: 'hidden', pointerEvents: 'none' } : undefined}
                >
                  <div className="h-[3px] w-full bg-[hsl(var(--feature-accent))]" />
                  <div className="flex flex-col items-center text-center h-full">
                    <div className="flex flex-1 flex-col items-center justify-between p-8 pt-7 text-center">
                      <div>
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--feature-icon-bg))] mx-auto">
                          <f.icon className="h-7 w-7 text-[hsl(var(--feature-icon))]" />
                        </div>
                        <h3 className="font-playfair text-lg font-bold text-foreground">{f.headline}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                      </div>
                      <span className="mt-5 inline-block text-xs font-medium tracking-wide text-[hsl(var(--feature-accent))] transition-all group-hover:underline">
                        {isExpanded ? 'Schließen ↑' : 'Vorschau ansehen →'}
                      </span>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.15, ease: 'easeOut' },
                            opacity: { duration: 0.1 },
                            exit: { height: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }, opacity: { duration: 0.3 } },
                          }}
                          className="w-full max-w-3xl mx-auto overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <img
                              src={previewImage}
                              alt={`${f.title} Vorschau`}
                              className="w-full rounded-xl border border-border shadow-lg brightness-[1.02] dark:brightness-[0.85] dark:contrast-[1.1] dark:border-border/50"
                              draggable={false}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-[hsl(var(--feature-bg))]">
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
            {trustItems.map((item) =>
              <div key={item.title} className="rounded-2xl bg-[hsl(var(--feature-card))] p-6 shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_-4px_hsl(220_55%_20%/0.14)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--feature-icon-bg))]">
                  <item.icon className="h-6 w-6 text-foreground/70" />
                </div>
                <h3 className="font-playfair text-base font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:bg-primary/90"
        aria-label="Nach oben scrollen"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

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
    </div>);

}