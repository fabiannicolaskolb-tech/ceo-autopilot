import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Lightbulb, CalendarDays, BarChart3, Shield, Lock, UserCheck, ArrowUp, Sun, Moon, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';
import featureIdeation from '@/assets/feature-ideation.jpg';
import featureAnalytics from '@/assets/feature-analytics.jpg';
import analyticsPreview from '@/assets/analytics-preview.jpg';

export default function LandingPage() {
  const { user, profile, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.onboarding_completed ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="relative min-h-screen bg-[hsl(var(--landing-warm))]">

      {/* ── Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Zap className="h-5 w-5 text-[hsl(var(--landing-hero-text))]" />
            <span className="font-playfair text-[15px] font-semibold tracking-wide text-[hsl(var(--landing-hero-text))] uppercase">
              CEO Autopilot
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 text-[hsl(var(--landing-hero-text))] hover:bg-white/10">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[hsl(var(--landing-hero-text))] hover:bg-white/10 font-inter text-xs uppercase tracking-widest"
            >
              <Link to="/auth">Anmelden</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="font-playfair text-4xl font-bold leading-[1.1] text-[hsl(var(--landing-hero-text))] sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-wide"
          >
            Ihr LinkedIn-Autopilot
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">für strategische Sichtbarkeit</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="mx-auto mt-8 max-w-2xl font-inter text-base text-[hsl(var(--landing-hero-text))]/80 sm:text-lg leading-relaxed"
          >
            KI-gestütztes Personal Branding, das Ihre Erfahrung in Reichweite verwandelt.
            Authentisch, automatisiert, messbar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            className="mt-12"
          >
            <button
              onClick={() => navigate('/auth')}
              className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-4 font-inter text-sm font-medium uppercase tracking-widest text-[hsl(var(--landing-hero-text))] backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30"
            >
              Jetzt starten
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Intro Statement ── */}
      <section className="bg-[hsl(var(--landing-warm))] py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="font-playfair text-2xl font-medium leading-relaxed text-foreground sm:text-3xl md:text-4xl"
          >
            Führungskräfte verbringen Stunden mit Content-Erstellung.{' '}
            <span className="text-muted-foreground">
              CEO Autopilot übernimmt – damit Sie sich auf das Wesentliche konzentrieren können.
            </span>
          </motion.h2>
        </div>
      </section>

      {/* ── Bento Feature Grid ── */}
      <section className="bg-[hsl(var(--landing-warm))] pb-8">
        <div className="mx-auto max-w-7xl px-6">
          {/* Row 1: Two cards side by side */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Ideation card - light bg */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7 }}
              className="overflow-hidden rounded-3xl bg-[hsl(var(--landing-warm-card))] p-8 sm:p-10"
            >
              <h3 className="font-playfair text-2xl font-medium text-foreground sm:text-3xl">
                Ideation: Ihre Themen, KI-gestützt entdeckt
              </h3>
              <p className="mt-4 font-inter text-sm leading-relaxed text-muted-foreground sm:text-base">
                Aus Ihrem Fachwissen, Ihrer Branche und aktuellen Trends generiert
                unser System Content-Ideen, die zu Ihrer Positionierung passen –
                konsistent, strategisch, authentisch.
              </p>
              <div className="mt-8 overflow-hidden rounded-2xl">
                <img
                  src={featureIdeation}
                  alt="KI-gestützte Content-Ideation"
                  className="h-64 w-full object-cover"
                  draggable={false}
                />
              </div>
            </motion.div>

            {/* Analytics card - dark bg */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="overflow-hidden rounded-3xl bg-[hsl(25_18%_12%)] p-8 sm:p-10 text-[hsl(30_15%_90%)]"
            >
              <h3 className="font-playfair text-2xl font-medium sm:text-3xl">
                Analytics: Datenbasierte Optimierung
              </h3>
              <p className="mt-4 font-inter text-sm leading-relaxed text-[hsl(30_10%_65%)] sm:text-base">
                Verstehen Sie, was funktioniert – und steigern Sie Ihre Reichweite
                systematisch. Engagement-Patterns, beste Posting-Zeiten und
                Content-Performance auf einen Blick.
              </p>
              <div className="mt-8 overflow-hidden rounded-2xl">
                <img
                  src={featureAnalytics}
                  alt="Datenbasierte LinkedIn Analytics"
                  className="h-64 w-full object-cover"
                  draggable={false}
                />
              </div>
            </motion.div>
          </div>

          {/* Row 2: Full-width planning card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="mt-6 overflow-hidden rounded-3xl bg-[hsl(var(--landing-warm-card))] p-8 sm:p-10"
          >
            <div className="text-center">
              <h3 className="font-playfair text-2xl font-medium text-foreground sm:text-3xl">
                Planung: Volle Kontrolle über Ihren Content-Kalender
              </h3>
              <p className="mx-auto mt-4 max-w-2xl font-inter text-sm leading-relaxed text-muted-foreground sm:text-base">
                Strategische Planung, Freigabe-Workflows und automatisches Scheduling –
                Sie behalten immer das letzte Wort, während wir die Arbeit übernehmen.
              </p>
            </div>

            {/* Process flow diagram inspired by Zauber */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {[
                { icon: Lightbulb, label: 'Ideation' },
                { icon: CalendarDays, label: 'Planung' },
                { icon: Sparkles, label: 'KI-Optimierung' },
                { icon: BarChart3, label: 'Analyse' },
              ].map((item, i) => (
                <React.Fragment key={item.label}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-28 items-center justify-center rounded-2xl border border-border/50 bg-background/60 backdrop-blur-sm sm:h-20 sm:w-36">
                      <item.icon className="h-6 w-6 text-foreground/70" />
                    </div>
                    <span className="font-inter text-xs font-medium text-muted-foreground">{item.label}</span>
                  </div>
                  {i < 3 && (
                    <div className="hidden text-muted-foreground/30 sm:block">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="bg-[hsl(var(--landing-warm))] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-3xl text-center font-playfair text-2xl font-medium text-foreground sm:text-3xl md:text-4xl"
          >
            KI die Reichweite, Engagement und Sichtbarkeit systematisch steigert
          </motion.h2>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '+340%', label: 'mehr Reichweite' },
              { value: '+5.2%', label: 'Engagement Rate' },
              { value: '10h', label: 'pro Woche gespart' },
              { value: '100%', label: 'Ihre Stimme' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-playfair text-4xl font-bold text-foreground sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 font-inter text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="bg-[hsl(var(--landing-warm))] pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="font-playfair text-2xl font-medium text-foreground sm:text-3xl md:text-4xl">
              KI die Ihre LinkedIn-Strategie steuert
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-inter text-sm text-muted-foreground sm:text-base">
              Ihr persönliches Dashboard für Content-Performance, Audience-Insights und strategische Empfehlungen.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.9 }}
            className="mt-12 overflow-hidden rounded-3xl shadow-2xl shadow-black/10"
          >
            <img
              src={analyticsPreview}
              alt="CEO Autopilot Dashboard"
              className="w-full object-cover"
              draggable={false}
            />
          </motion.div>
        </div>
      </section>

      {/* ── Trust / Integration Grid ── */}
      <section className="bg-[hsl(var(--landing-warm))] pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'DSGVO-konform',
                desc: 'Alle Daten werden in der EU gespeichert und nach höchsten Standards verarbeitet.',
              },
              {
                icon: Lock,
                title: 'Ende-zu-Ende verschlüsselt',
                desc: 'Ihre Inhalte, Strategien und Analysen sind vollständig geschützt.',
              },
              {
                icon: UserCheck,
                title: 'Exklusiver Zugang',
                desc: 'Nur für verifizierte Führungskräfte – Qualität vor Quantität.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-3xl bg-[hsl(var(--landing-warm-card))] p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5">
                  <item.icon className="h-6 w-6 text-foreground/60" />
                </div>
                <h3 className="font-playfair text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 font-inter text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-playfair text-3xl font-bold text-[hsl(var(--landing-hero-text))] sm:text-4xl md:text-5xl">
            Bereit für Ihren LinkedIn-Durchbruch?
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-inter text-base text-[hsl(var(--landing-hero-text))]/70">
            Starten Sie heute und verwandeln Sie Ihre Expertise in strategische Sichtbarkeit.
          </p>
          <div className="mt-10">
            <button
              onClick={() => navigate('/auth')}
              className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 py-4 font-inter text-sm font-medium uppercase tracking-widest text-[hsl(var(--landing-hero-text))] backdrop-blur-md transition-all hover:bg-white/20"
            >
              Kostenlos starten
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Scroll to Top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-foreground backdrop-blur-md transition-opacity hover:bg-foreground/20"
        aria-label="Nach oben scrollen"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-[hsl(var(--landing-warm))]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
          <div className="flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-foreground/50" />
            <span className="font-inter text-xs text-muted-foreground">
              © {new Date().getFullYear()} CEO Autopilot
            </span>
          </div>
          <span className="font-inter text-xs text-muted-foreground">
            DSGVO-konform · Made in Germany
          </span>
        </div>
      </footer>
    </div>
  );
}
