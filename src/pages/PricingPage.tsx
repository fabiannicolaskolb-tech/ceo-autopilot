import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Check, X, Sun, Moon, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const allFeatures = [
  'AI posts/month',
  'Voice learning',
  'AI image generation',
  'Auto-scheduling',
  'Dedicated support',
];

const plans = [
  {
    name: 'Starter',
    price: '$7',
    popular: false,
    featureDetails: {
      'AI posts/month': '10',
      'Voice learning': true,
      'AI image generation': false,
      'Auto-scheduling': false,
      'Dedicated support': false,
    } as Record<string, boolean | string>,
  },
  {
    name: 'Pro',
    price: '$249',
    popular: true,
    featureDetails: {
      'AI posts/month': '30',
      'Voice learning': true,
      'AI image generation': true,
      'Auto-scheduling': true,
      'Dedicated support': false,
    } as Record<string, boolean | string>,
  },
  {
    name: 'Enterprise',
    price: '$499',
    popular: false,
    featureDetails: {
      'AI posts/month': 'Unlimited',
      'Voice learning': true,
      'AI image generation': true,
      'Auto-scheduling': true,
      'Dedicated support': true,
    } as Record<string, boolean | string>,
  },
];

export default function PricingPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-playfair text-[15px] font-semibold tracking-tight text-foreground">
              Briefly
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
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center mb-14">
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

        {/* Pricing Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 * i }}
              className={`group relative flex flex-col rounded-[24px] border backdrop-blur-xl transition-all duration-500 ${
                plan.popular
                  ? 'border-primary/40 bg-gradient-to-b from-primary/[0.08] to-card/90 shadow-[0_8px_40px_-8px_hsl(217_71%_25%/0.2)] md:scale-105 md:z-10'
                  : 'border-border/60 bg-card/60 hover:border-border hover:shadow-[0_8px_32px_-4px_hsl(217_71%_25%/0.1)]'
              }`}
            >
              {/* Top accent bar for popular */}
              {plan.popular && (
                <div className="absolute -top-px left-4 right-4 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}

              <div className="flex flex-col flex-1 p-8">
                {/* Badge */}
                {plan.popular && (
                  <div className="mb-5 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-bold tracking-[0.15em] text-primary uppercase">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="font-playfair text-xl font-semibold text-foreground">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-playfair text-[3.25rem] font-bold leading-none tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">/month</span>
                </div>

                {/* Divider */}
                <div className="my-7 h-px bg-border/60" />

                {/* Features */}
                <ul className="flex-1 space-y-3.5">
                  {allFeatures.map((feature) => {
                    const value = plan.featureDetails[feature];
                    const included = value === true || (typeof value === 'string');
                    const label = typeof value === 'string' ? `${value} ${feature}` : feature;

                    return (
                      <li key={feature} className="flex items-start gap-3">
                        {included ? (
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                            <Check className="h-3 w-3 text-emerald-500" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <X className="h-3 w-3 text-destructive/70" strokeWidth={3} />
                          </div>
                        )}
                        <span className={`text-sm leading-snug ${included ? 'text-foreground/80' : 'text-muted-foreground/50 line-through'}`}>
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  <Button
                    onClick={() => navigate('/auth')}
                    className={`w-full h-11 rounded-xl font-medium transition-all duration-300 ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_16px_-4px_hsl(217_71%_25%/0.4)]'
                        : 'bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1] border border-border/50'
                    }`}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Zurück zur Startseite
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
