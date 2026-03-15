import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Check, Sun, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const plans = [
  {
    name: 'Starter',
    price: '$99',
    badge: null,
    features: ['10 AI posts/month', 'Voice learning', 'Basic analytics', 'Manual posting'],
  },
  {
    name: 'Pro',
    price: '$249',
    badge: 'MOST POPULAR',
    features: ['30 AI posts/month', 'AI image generation', 'Auto-scheduling', 'Performance insights'],
  },
  {
    name: 'Enterprise',
    price: '$499',
    badge: null,
    features: ['Unlimited posts', 'Multi-executive seats', 'White-label option', 'Dedicated support'],
  },
];

export default function PricingPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-playfair text-[15px] font-semibold tracking-tight text-foreground">
              CEO Autopilot
            </span>
          </Link>
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

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-playfair text-4xl font-bold text-foreground sm:text-5xl"
          >
            Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Wählen Sie den Plan, der zu Ihrem Wachstum passt.
          </motion.p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isPopular = !!plan.badge;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * i }}
                className={`relative rounded-[24px] border p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_-4px_hsl(217_71%_25%/0.15)] ${
                  isPopular
                    ? 'border-primary/50 bg-card/90 shadow-[0_4px_24px_-4px_hsl(217_71%_25%/0.12)]'
                    : 'border-border bg-card/70'
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-px left-0 right-0 h-[3px] rounded-t-[24px] bg-primary" />
                )}
                {isPopular && (
                  <span className="inline-block mb-4 text-[11px] font-bold tracking-widest text-primary uppercase">
                    {plan.badge}
                  </span>
                )}

                <h3 className="font-playfair text-xl font-semibold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-playfair text-5xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                        <Check className="h-3 w-3 text-emerald-500" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    className={`w-full rounded-xl ${
                      isPopular
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück zur Startseite
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
