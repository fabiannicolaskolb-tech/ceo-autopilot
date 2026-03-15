import React, { createContext, useContext, useState, useCallback } from 'react';

type Lang = 'de' | 'en';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  'nav.login': { de: 'Anmelden', en: 'Sign In' },
  'nav.pricing': { de: 'Pricing', en: 'Pricing' },

  // Hero
  'hero.title': {
    de: 'Ihre digitale Präsenz auf LinkedIn – Vollautomatisiert & Authentisch.',
    en: 'Your Digital Presence on LinkedIn – Fully Automated & Authentic.',
  },
  'hero.subtitle': {
    de: 'KI-gestütztes Personal Branding für Führungskräfte im Mittelstand. Wir verwandeln Ihre Erfahrung in Reichweite.',
    en: 'AI-powered personal branding for executives. We turn your experience into reach.',
  },
  'hero.cta': { de: 'Jetzt starten', en: 'Get Started' },

  // Scroll section
  'scroll.title1': { de: 'Datenbasierte Einblicke', en: 'Data-driven Insights' },
  'scroll.title2': { de: 'in Echtzeit', en: 'in Real-time' },

  // Workflow
  'workflow.title': {
    de: 'Planung: Volle Kontrolle über Ihren Content-Kalender',
    en: 'Planning: Full Control Over Your Content Calendar',
  },
  'workflow.subtitle': {
    de: 'Strategische Planung, Freigabe-Workflows und automatisches Scheduling – Sie behalten immer das letzte Wort, während wir die Arbeit übernehmen.',
    en: 'Strategic planning, approval workflows, and automated scheduling – you always have the final say while we do the heavy lifting.',
  },
  'workflow.ideation': { de: 'Ideation', en: 'Ideation' },
  'workflow.planning': { de: 'Planung', en: 'Planning' },
  'workflow.optimization': { de: 'KI-Optimierung', en: 'AI Optimization' },
  'workflow.analytics': { de: 'Analyse', en: 'Analytics' },

  // Features
  'features.title': {
    de: 'Alles was Sie brauchen – Drei Module für Ihren Erfolg.',
    en: 'Everything You Need – Three Modules for Your Success.',
  },
  'features.ideation.headline': { de: 'Wir finden Ihre Themen.', en: 'We Find Your Topics.' },
  'features.ideation.desc': {
    de: 'KI-gestützte Content-Ideen, die zu Ihrer Expertise und Zielgruppe passen.',
    en: 'AI-powered content ideas tailored to your expertise and audience.',
  },
  'features.planning.headline': { de: 'Volle Kontrolle über Ihren Zeitplan.', en: 'Full Control Over Your Schedule.' },
  'features.planning.desc': {
    de: 'Strategische Planung und Freigabe – Sie behalten immer das letzte Wort.',
    en: 'Strategic planning and approval – you always have the final say.',
  },
  'features.analytics.headline': { de: 'Datenbasierte Optimierung.', en: 'Data-driven Optimization.' },
  'features.analytics.desc': {
    de: 'Verstehen Sie, was funktioniert, und steigern Sie Ihre Reichweite systematisch.',
    en: 'Understand what works and systematically grow your reach.',
  },
  'features.expand': { de: 'Vorschau ansehen →', en: 'View Preview →' },
  'features.collapse': { de: 'Schließen ↑', en: 'Close ↑' },

  // Trust
  'trust.title': { de: 'Sicherheit & Diskretion', en: 'Security & Discretion' },
  'trust.subtitle': { de: 'Ihre Daten verdienen höchsten Schutz', en: 'Your data deserves the highest protection' },
  'trust.gdpr.title': { de: 'DSGVO-konform', en: 'GDPR Compliant' },
  'trust.gdpr.desc': {
    de: 'Alle Daten werden in der EU gespeichert und verarbeitet.',
    en: 'All data is stored and processed within the EU.',
  },
  'trust.encrypted.title': { de: 'Ende-zu-Ende verschlüsselt', en: 'End-to-End Encrypted' },
  'trust.encrypted.desc': {
    de: 'Ihre Inhalte und Strategien sind vollständig geschützt.',
    en: 'Your content and strategies are fully protected.',
  },
  'trust.exclusive.title': { de: 'Exklusiver Zugang', en: 'Exclusive Access' },
  'trust.exclusive.desc': {
    de: 'Nur für verifizierte Führungskräfte – Qualität vor Quantität.',
    en: 'For verified executives only – quality over quantity.',
  },

  // Footer
  'footer.tagline': { de: 'DSGVO-konform · Made in Germany', en: 'GDPR Compliant · Made in Germany' },

  // Pricing
  'pricing.title': { de: 'Pricing', en: 'Pricing' },
  'pricing.subtitle': {
    de: 'Wählen Sie den Plan, der zu Ihrem Wachstum passt.',
    en: 'Choose the plan that fits your growth.',
  },
  'pricing.custom': { de: 'Individuell nach Bedarf', en: 'Tailored to your needs' },
  'pricing.contact': { de: 'Sales kontaktieren', en: 'Contact Sales' },
  'pricing.back': { de: 'Zurück zur Startseite', en: 'Back to Homepage' },
  'pricing.cta': { de: 'Jetzt starten', en: 'Get Started' },
};

const LangContext = createContext<LangContextType>({
  lang: 'de',
  toggleLang: () => {},
  t: (key: string) => key,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('de');

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'de' ? 'en' : 'de'));
  }, []);

  const t = useCallback(
    (key: string) => translations[key]?.[lang] ?? key,
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
