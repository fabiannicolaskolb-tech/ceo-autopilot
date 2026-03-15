import React, { createContext, useContext, useState, useCallback } from 'react';

type Lang = 'de' | 'en';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  // ── Nav / Global ──
  'nav.login': { de: 'Anmelden', en: 'Sign In' },
  'nav.pricing': { de: 'Pricing', en: 'Pricing' },
  'nav.profile': { de: 'Profil', en: 'Profile' },
  'nav.signout': { de: 'Abmelden', en: 'Sign Out' },
  'nav.dashboard': { de: 'Dashboard', en: 'Dashboard' },
  'nav.ideation': { de: 'Ideation Lab', en: 'Ideation Lab' },
  'nav.postlibrary': { de: 'Post Library', en: 'Post Library' },
  'nav.analytics': { de: 'Analytics', en: 'Analytics' },
  'loading': { de: 'Laden...', en: 'Loading...' },

  // ── Hero (Landing) ──
  'hero.title': {
    de: 'Ihre digitale Präsenz auf LinkedIn – Vollautomatisiert & Authentisch.',
    en: 'Your Digital Presence on LinkedIn – Fully Automated & Authentic.',
  },
  'hero.subtitle': {
    de: 'KI-gestütztes Personal Branding für Führungskräfte im Mittelstand. Wir verwandeln Ihre Erfahrung in Reichweite.',
    en: 'AI-powered personal branding for executives. We turn your experience into reach.',
  },
  'hero.cta': { de: 'Jetzt starten', en: 'Get Started' },

  // ── Scroll section ──
  'scroll.title1': { de: 'Datenbasierte Einblicke', en: 'Data-driven Insights' },
  'scroll.title2': { de: 'in Echtzeit', en: 'in Real-time' },

  // ── Workflow ──
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

  // ── Features (Landing) ──
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

  // ── Trust ──
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

  // ── Footer ──
  'footer.tagline': { de: 'DSGVO-konform · Made in Germany', en: 'GDPR Compliant · Made in Germany' },

  // ── Pricing ──
  'pricing.title': { de: 'Pricing', en: 'Pricing' },
  'pricing.subtitle': {
    de: 'Wählen Sie den Plan, der zu Ihrem Wachstum passt.',
    en: 'Choose the plan that fits your growth.',
  },
  'pricing.custom': { de: 'Individuell nach Bedarf', en: 'Tailored to your needs' },
  'pricing.contact': { de: 'Sales kontaktieren', en: 'Contact Sales' },
  'pricing.back': { de: 'Zurück zur Startseite', en: 'Back to Homepage' },
  'pricing.cta': { de: 'Jetzt starten', en: 'Get Started' },

  // ── Auth ──
  'auth.welcome': { de: 'Willkommen zurück!', en: 'Welcome back!' },
  'auth.login': { de: 'Anmelden', en: 'Sign In' },
  'auth.register': { de: 'Registrieren', en: 'Sign Up' },
  'auth.email': { de: 'E-Mail', en: 'Email' },
  'auth.password': { de: 'Passwort', en: 'Password' },
  'auth.logging_in': { de: 'Wird angemeldet...', en: 'Signing in...' },
  'auth.registering': { de: 'Wird registriert...', en: 'Signing up...' },
  'auth.forgot': { de: 'Passwort vergessen?', en: 'Forgot password?' },
  'auth.reset_title': { de: 'Passwort zurücksetzen', en: 'Reset Password' },
  'auth.reset_desc': { de: 'Geben Sie Ihre E-Mail-Adresse ein', en: 'Enter your email address' },
  'auth.reset_sending': { de: 'Wird gesendet...', en: 'Sending...' },
  'auth.reset_send': { de: 'Reset-Link senden', en: 'Send Reset Link' },
  'auth.back_to_login': { de: 'Zurück zur Anmeldung', en: 'Back to Sign In' },
  'auth.login_failed': { de: 'Anmeldung fehlgeschlagen', en: 'Sign in failed' },
  'auth.account_created': { de: 'Konto erstellt', en: 'Account created' },
  'auth.confirm_email': { de: 'Bitte bestätigen Sie Ihre E-Mail-Adresse.', en: 'Please confirm your email address.' },
  'auth.register_failed': { de: 'Registrierung fehlgeschlagen', en: 'Registration failed' },
  'auth.email_sent': { de: 'E-Mail gesendet', en: 'Email sent' },
  'auth.check_inbox': { de: 'Prüfen Sie Ihr Postfach für den Reset-Link.', en: 'Check your inbox for the reset link.' },
  'auth.error': { de: 'Fehler', en: 'Error' },

  // ── Dashboard ──
  'dashboard.greeting': { de: 'bereit für den nächsten Post?', en: 'ready for your next post?' },
  'dashboard.drafts_waiting': { de: 'Entwürfe warten auf Ihre Freigabe', en: 'drafts waiting for your approval' },
  'dashboard.start_idea': { de: 'Starten Sie mit einer neuen Idee', en: 'Start with a new idea' },
  'dashboard.edit_profile': { de: 'Profil bearbeiten', en: 'Edit Profile' },
  'dashboard.drafts': { de: 'Entwürfe', en: 'Drafts' },
  'dashboard.published': { de: 'Veröffentlicht', en: 'Published' },
  'dashboard.next_post': { de: 'Nächster geplanter Post', en: 'Next Scheduled Post' },
  'dashboard.scheduled': { de: 'Geplant', en: 'Scheduled' },
  'dashboard.scheduled_for': { de: 'Geplant für', en: 'Scheduled for' },
  'dashboard.no_post_planned': { de: 'Noch kein Post geplant', en: 'No post scheduled yet' },
  'dashboard.next_idea_hint': { de: 'Ihre nächste Idee ist nur einen Klick entfernt. Starten Sie im Ideation Lab.', en: 'Your next idea is just one click away. Start in the Ideation Lab.' },
  'dashboard.ai_progress': { de: 'KI-Lernfortschritt', en: 'AI Learning Progress' },
  'dashboard.posts_analyzed': { de: 'Posts analysiert', en: 'posts analyzed' },
  'dashboard.engagement_trend': { de: 'Engagement-Trend', en: 'Engagement Trend' },
  'dashboard.engagement_rate_chart': { de: 'Engagement Rate Verlauf', en: 'Engagement Rate Trend' },
  'dashboard.top_pattern': { de: 'Top Content-Pattern', en: 'Top Content Pattern' },
  'dashboard.latest_analysis': { de: 'Letzte Analyse', en: 'Latest Analysis' },

  // Dashboard nav cards
  'dashboard.ideation_title': { de: 'Ideation Lab', en: 'Ideation Lab' },
  'dashboard.ideation_desc': { de: 'KI-gestützte Ideen generieren und verfeinern', en: 'Generate and refine AI-powered ideas' },
  'dashboard.ideation_cta': { de: 'Ideen entdecken', en: 'Discover Ideas' },
  'dashboard.postlib_title': { de: 'Post Library', en: 'Post Library' },
  'dashboard.postlib_desc': { de: 'Alle Beiträge verwalten, planen und veröffentlichen', en: 'Manage, schedule and publish all posts' },
  'dashboard.postlib_cta': { de: 'Library öffnen', en: 'Open Library' },
  'dashboard.analytics_title': { de: 'Analytics', en: 'Analytics' },
  'dashboard.analytics_desc': { de: 'Performance analysieren und Wachstum tracken', en: 'Analyze performance and track growth' },
  'dashboard.analytics_cta': { de: 'Insights ansehen', en: 'View Insights' },
  'dashboard.drafts_ready': { de: 'Entwürfe bereit', en: 'drafts ready' },
  'dashboard.start_first_idea': { de: 'Starte deine erste Idee', en: 'Start your first idea' },
  'dashboard.published_label': { de: 'veröffentlicht', en: 'published' },
  'dashboard.posts_evaluated': { de: 'Posts ausgewertet', en: 'posts evaluated' },
  'dashboard.no_data': { de: 'Noch keine Daten', en: 'No data yet' },

  // Pipeline stages
  'stage.started': { de: 'Gestartet', en: 'Started' },
  'stage.ideating': { de: 'Ideen werden generiert', en: 'Generating ideas' },
  'stage.creating': { de: 'Post wird erstellt', en: 'Creating post' },
  'stage.posting': { de: 'Wird veröffentlicht', en: 'Publishing' },
  'stage.analyzing': { de: 'Analyse läuft', en: 'Analyzing' },
  'stage.completed': { de: 'Abgeschlossen', en: 'Completed' },
  'stage.error': { de: 'Fehler', en: 'Error' },

  // ── Daily Briefing ──
  'briefing.title': { de: 'Dein Morgen-Briefing', en: 'Your Morning Briefing' },
  'briefing.no_briefing': { de: 'Noch kein Briefing verfügbar', en: 'No briefing available yet' },
  'briefing.no_briefing_desc': { de: 'Sobald dein erster Post analysiert wurde, erscheint hier dein tägliches Morgen-Briefing mit Performance-Daten und KI-Empfehlungen.', en: 'Once your first post is analyzed, your daily morning briefing with performance data and AI recommendations will appear here.' },
  'briefing.what_worked': { de: 'Was funktioniert hat', en: 'What Worked' },
  'briefing.next_ideas': { de: 'Nächste Post-Ideen', en: 'Next Post Ideas' },

  // ── Creator Score ──
  'score.title': { de: 'Creator Score', en: 'Creator Score' },
  'score.subtitle': { de: 'Ihr Fortschritt als LinkedIn Creator', en: 'Your progress as a LinkedIn Creator' },
  'score.until_level': { de: 'bis Level', en: 'until Level' },
  'score.needs_level': { de: 'Benötigt Level', en: 'Requires Level' },
  'score.and_streak': { de: 'und einen', en: 'and a' },
  'score.week_streak': { de: 'Wochen-Streak', en: 'week streak' },

  // ── Profile ──
  'profile.title': { de: 'Profil', en: 'Profile' },
  'profile.subtitle': { de: 'Verwalten Sie Ihr Profil und Ihre LinkedIn-Strategie', en: 'Manage your profile and LinkedIn strategy' },
  'profile.basics': { de: 'Grundinformationen', en: 'Basic Information' },
  'profile.name': { de: 'Name', en: 'Name' },
  'profile.company': { de: 'Unternehmen', en: 'Company' },
  'profile.position': { de: 'Position', en: 'Position' },
  'profile.industry': { de: 'Branche', en: 'Industry' },
  'profile.ai_config': { de: 'KI-Konfiguration', en: 'AI Configuration' },
  'profile.tone': { de: 'Kommunikations-Tonfall', en: 'Communication Tone' },
  'profile.audience': { de: 'Zielgruppe', en: 'Target Audience' },
  'profile.content_control': { de: 'Content-Steuerung', en: 'Content Controls' },
  'profile.focus_topics': { de: 'Fokus-Themen', en: 'Focus Topics' },
  'profile.nogo_topics': { de: 'No-Go Themen', en: 'No-Go Topics' },
  'profile.topic_placeholder': { de: 'Thema + Enter', en: 'Topic + Enter' },
  'profile.photos': { de: 'Profilfotos', en: 'Profile Photos' },
  'profile.photos_desc': { de: 'Drag & Drop zum Umsortieren — das erste Bild ist Ihr Hauptprofilbild', en: 'Drag & drop to reorder — the first image is your main profile picture' },
  'profile.linkedin': { de: 'LinkedIn Verbindung', en: 'LinkedIn Connection' },
  'profile.linkedin_url': { de: 'LinkedIn-Profil URL', en: 'LinkedIn Profile URL' },
  'profile.import_profile': { de: 'Profil importieren', en: 'Import Profile' },
  'profile.importing': { de: 'Importiere...', en: 'Importing...' },
  'profile.import_desc': { de: 'Importiert Name, Bio und Profilbild von LinkedIn. Die URL wird auch für den Post-Import auf der Analytics-Seite verwendet.', en: 'Imports name, bio and profile picture from LinkedIn. The URL is also used for post import on the Analytics page.' },
  'profile.linkedin_set': { de: 'LinkedIn-URL hinterlegt', en: 'LinkedIn URL set' },
  'profile.linkedin_missing': { de: 'Keine LinkedIn-URL hinterlegt', en: 'No LinkedIn URL set' },
  'profile.account_security': { de: 'Account & Sicherheit', en: 'Account & Security' },
  'profile.reset_password': { de: 'Passwort zurücksetzen', en: 'Reset Password' },
  'profile.save_all': { de: 'Alle Änderungen speichern', en: 'Save All Changes' },
  'profile.saved': { de: 'Profil gespeichert', en: 'Profile saved' },
  'profile.imported': { de: 'LinkedIn-Profil importiert', en: 'LinkedIn profile imported' },
  'profile.imported_desc': { de: 'Name, Bio und Profilbild wurden aktualisiert.', en: 'Name, bio and profile picture have been updated.' },
  'profile.reset_sent': { de: 'Passwort-Reset E-Mail gesendet', en: 'Password reset email sent' },

  // ── Ideation ──
  'ideation.title': { de: 'Ideation Lab', en: 'Ideation Lab' },
  'ideation.subtitle': { de: 'Generieren Sie Posts aus Ihren Daten oder teilen Sie persönliche Erlebnisse per Sprache.', en: 'Generate posts from your data or share personal experiences via voice.' },
  'ideation.generate': { de: 'Post generieren', en: 'Generate Post' },
  'ideation.generate_desc': { de: 'Basierend auf Profil, Themen & bisherigen Posts.', en: 'Based on profile, topics & past posts.' },
  'ideation.conversation': { de: 'Gespräch starten', en: 'Start Conversation' },
  'ideation.conversation_desc': { de: 'Persönliche Erlebnisse per Sprache für Content nutzen.', en: 'Use personal experiences via voice for content.' },
  'ideation.inspirations': { de: 'Gesprächs-Inspirationen', en: 'Conversation Inspirations' },
  'ideation.new_inspirations': { de: 'Neue Inspirationen generieren', en: 'Generate New Inspirations' },
  'ideation.generating': { de: 'Generiere...', en: 'Generating...' },
  'ideation.focus_topics': { de: 'Ihre Fokus-Themen', en: 'Your Focus Topics' },
  'ideation.insights_title': { de: 'Erkenntnisse aus Ihren Gesprächen', en: 'Insights from Your Conversations' },
  'ideation.use_for_post': { de: 'Für nächsten Post nutzen', en: 'Use for next post' },
  'ideation.bookmarked': { de: 'Vorgemerkt', en: 'Bookmarked' },
  'ideation.generated_posts': { de: 'Generierte Posts', en: 'Generated Posts' },
  'ideation.open_preview': { de: 'Vorschau öffnen', en: 'Open Preview' },
  'ideation.based_on': { de: 'Basierend auf Ihrem Profil und Thema', en: 'Based on your profile and topic' },
  'ideation.post_to_queue': { de: 'In Queue posten', en: 'Post to Queue' },
  'ideation.edit': { de: 'Bearbeiten', en: 'Edit' },
  'ideation.preview': { de: 'Vorschau', en: 'Preview' },
  'ideation.schedule_for': { de: 'Planen für...', en: 'Schedule for...' },
  'ideation.discard': { de: 'Verwerfen', en: 'Discard' },
  'ideation.draft_created': { de: 'Entwurf erstellt', en: 'Draft created' },
  'ideation.draft_added': { de: 'Post wurde zur Gallery hinzugefügt.', en: 'Post was added to the gallery.' },
  'ideation.insight_bookmarked': { de: 'Erkenntnis vorgemerkt', en: 'Insight bookmarked' },
  'ideation.insight_removed': { de: 'Erkenntnis entfernt', en: 'Insight removed' },
  'ideation.insight_bookmarked_desc': { de: 'Wird als Grundlage für den nächsten Post genutzt.', en: 'Will be used as a basis for the next post.' },
  'ideation.insight_removed_desc': { de: 'Wird nicht mehr für den nächsten Post genutzt.', en: 'Will no longer be used for the next post.' },
  'ideation.insights_selected': { de: 'als Grundlage ausgewählt', en: 'selected as basis' },
  'ideation.mobile_subtitle': { de: 'Posts generieren oder per Sprache Ideen teilen.', en: 'Generate posts or share ideas via voice.' },
  'ideation.loading1': { de: 'Analysiere bestehende Posts...', en: 'Analyzing existing posts...' },
  'ideation.loading2': { de: 'Gleiche mit Ihrer Brand Voice ab...', en: 'Matching with your brand voice...' },
  'ideation.loading3': { de: 'Berechne Engagement-Potenzial...', en: 'Calculating engagement potential...' },
  'ideation.potential_high': { de: 'Potenzial: Hoch', en: 'Potential: High' },
  'ideation.potential_medium': { de: 'Potenzial: Mittel', en: 'Potential: Medium' },
  'ideation.ideal_linkedin': { de: '(Ideal für LinkedIn)', en: '(Ideal for LinkedIn)' },
  'ideation.template1_label': { de: 'Kundenerfolg teilen', en: 'Share Customer Success' },
  'ideation.template1_prompt': { de: 'Wir haben kürzlich einem Kunden geholfen, [Ergebnis] zu erreichen.', en: 'We recently helped a client achieve [result].' },
  'ideation.template2_label': { de: 'Leadership-Lektion', en: 'Leadership Lesson' },
  'ideation.template2_prompt': { de: 'Eine Erfahrung als Führungskraft hat mich diese Woche besonders geprägt.', en: 'An experience as a leader particularly shaped me this week.' },
  'ideation.template3_label': { de: 'Branchen-Trend kommentieren', en: 'Comment on Industry Trend' },
  'ideation.template3_prompt': { de: 'In unserer Branche sehe ich gerade einen spannenden Trend.', en: 'I currently see an exciting trend in our industry.' },

  // ── Post Library ──
  'postlib.title': { de: 'Post Library', en: 'Post Library' },
  'postlib.subtitle': { de: 'Verwalten, planen und visualisieren Sie Ihre LinkedIn-Posts', en: 'Manage, schedule and visualize your LinkedIn posts' },
  'postlib.list': { de: 'Liste', en: 'List' },
  'postlib.gallery': { de: 'Galerie', en: 'Gallery' },
  'postlib.calendar': { de: 'Kalender', en: 'Calendar' },
  'postlib.feed': { de: 'Feed', en: 'Feed' },
  'postlib.drafts_scheduled': { de: 'Entwürfe & Geplant', en: 'Drafts & Scheduled' },
  'postlib.published': { de: 'Veröffentlicht', en: 'Published' },
  'postlib.for_approval': { de: 'Zur Freigabe', en: 'For Approval' },
  'postlib.no_drafts': { de: 'Noch keine Entwürfe', en: 'No drafts yet' },
  'postlib.no_published': { de: 'Noch keine veröffentlichten Posts', en: 'No published posts yet' },
  'postlib.start_ideation': { de: 'Starten Sie im Ideation Lab, um Ihre ersten Post-Ideen zu generieren.', en: 'Start in the Ideation Lab to generate your first post ideas.' },
  'postlib.approve_draft': { de: 'Geben Sie einen Entwurf frei, um loszulegen.', en: 'Approve a draft to get started.' },
  'postlib.first_idea': { de: 'Erste Idee generieren', en: 'Generate First Idea' },
  'postlib.approve': { de: 'Freigeben', en: 'Approve' },
  'postlib.schedule': { de: 'Planen', en: 'Schedule' },
  'postlib.edit': { de: 'Bearbeiten', en: 'Edit' },
  'postlib.copy': { de: 'Kopieren', en: 'Copy' },
  'postlib.delete': { de: 'Löschen', en: 'Delete' },
  'postlib.delete_confirm': { de: 'Post löschen?', en: 'Delete post?' },
  'postlib.delete_warning': { de: 'Diese Aktion kann nicht rückgängig gemacht werden.', en: 'This action cannot be undone.' },
  'postlib.cancel': { de: 'Abbrechen', en: 'Cancel' },
  'postlib.save': { de: 'Speichern', en: 'Save' },
  'postlib.confirm': { de: 'Bestätigen', en: 'Confirm' },
  'postlib.show_more': { de: 'Mehr anzeigen', en: 'Show more' },
  'postlib.show_less': { de: 'Weniger anzeigen', en: 'Show less' },
  'postlib.copied': { de: 'In Zwischenablage kopiert', en: 'Copied to clipboard' },
  'postlib.approved': { de: 'Post freigegeben', en: 'Post approved' },
  'postlib.scheduled': { de: 'Post geplant', en: 'Post scheduled' },
  'postlib.deleted': { de: 'Post gelöscht', en: 'Post deleted' },
  'postlib.saved': { de: 'Änderungen gespeichert', en: 'Changes saved' },
  'postlib.reject_title': { de: 'Post ablehnen?', en: 'Reject post?' },
  'postlib.reject_desc': { de: 'Der Post wird unwiderruflich gelöscht.', en: 'The post will be permanently deleted.' },
  'postlib.reject_confirm': { de: 'Ablehnen & Löschen', en: 'Reject & Delete' },
  'postlib.rejected': { de: 'Post abgelehnt und gelöscht', en: 'Post rejected and deleted' },
  'postlib.more': { de: 'mehr', en: 'more' },

  // Statuses
  'status.draft': { de: 'Entwurf', en: 'Draft' },
  'status.approved': { de: 'Freigegeben', en: 'Approved' },
  'status.scheduled': { de: 'Geplant', en: 'Scheduled' },
  'status.posted': { de: 'Veröffentlicht', en: 'Published' },
  'status.analyzed': { de: 'Analysiert', en: 'Analyzed' },

  // Weekdays
  'weekday.mo': { de: 'Mo', en: 'Mon' },
  'weekday.di': { de: 'Di', en: 'Tue' },
  'weekday.mi': { de: 'Mi', en: 'Wed' },
  'weekday.do': { de: 'Do', en: 'Thu' },
  'weekday.fr': { de: 'Fr', en: 'Fri' },
  'weekday.sa': { de: 'Sa', en: 'Sat' },
  'weekday.so': { de: 'So', en: 'Sun' },

  // ── Analytics ──
  'analytics.title': { de: 'Analytics', en: 'Analytics' },
  'analytics.subtitle': { de: 'Performance-Übersicht Ihres LinkedIn-Auftritts', en: 'Performance overview of your LinkedIn presence' },
  'analytics.import_posts': { de: 'Posts importieren', en: 'Import Posts' },
  'analytics.period': { de: 'Zeitraum', en: 'Period' },
  'analytics.from': { de: 'Von', en: 'From' },
  'analytics.to': { de: 'Bis', en: 'To' },
  'analytics.apply': { de: 'Anwenden', en: 'Apply' },
  'analytics.empty_title': { de: 'Sammle erste Daten…', en: 'Collecting first data…' },
  'analytics.empty_desc': { de: 'Ihr erstes Performance-Update erscheint nach dem ersten Post. Veröffentlichen Sie Ihren ersten Beitrag, um detaillierte Analysen freizuschalten.', en: 'Your first performance update will appear after your first post. Publish your first post to unlock detailed analytics.' },
  'analytics.timeline': { de: 'Performance Timeline', en: 'Performance Timeline' },
  'analytics.content_type': { de: 'Content Type Efficiency', en: 'Content Type Efficiency' },
  'analytics.sentiment': { de: 'Sentiment Analyse', en: 'Sentiment Analysis' },
  'analytics.no_sentiment': { de: 'Keine Sentiment-Daten vorhanden', en: 'No sentiment data available' },
  'analytics.best_times': { de: 'Beste Posting-Zeiten', en: 'Best Posting Times' },
  'analytics.top_posts': { de: 'Top Performing Posts', en: 'Top Performing Posts' },
  'analytics.compare': { de: 'Post-Vergleich', en: 'Post Comparison' },
  'analytics.ai_tips': { de: 'KI-Optimierungsvorschläge', en: 'AI Optimization Tips' },
  'analytics.tip1': { de: 'Story-Posts erzielen 2.3× mehr Engagement als reine Tipps-Posts.', en: 'Story posts generate 2.3× more engagement than pure tips posts.' },
  'analytics.tip2': { de: 'Ihre beste Posting-Zeit ist Dienstag zwischen 8:00 und 10:00 Uhr.', en: 'Your best posting time is Tuesday between 8:00 and 10:00 AM.' },
  'analytics.tip3': { de: 'Posts mit einer provokanten Frage als Hook erhalten 45% mehr Kommentare.', en: 'Posts with a provocative question as hook receive 45% more comments.' },
  'analytics.tip4': { de: 'Ihre Beiträge über Unternehmenskultur erhalten 40% mehr Shares von Entscheidern.', en: 'Your posts about corporate culture receive 40% more shares from decision-makers.' },
  'analytics.screenshot_title': { de: 'Echte LinkedIn-Metriken importieren', en: 'Import Real LinkedIn Metrics' },
  'analytics.screenshot_desc': { de: 'Laden Sie einen Screenshot Ihrer LinkedIn-Post-Analytik hoch. Unsere KI extrahiert die Zahlen automatisch.', en: 'Upload a screenshot of your LinkedIn post analytics. Our AI extracts the numbers automatically.' },
  'analytics.drag_image': { de: 'Bild hierher ziehen oder klicken', en: 'Drag image here or click' },
  'analytics.select_post': { de: 'Post auswählen...', en: 'Select post...' },
  'analytics.analyze': { de: 'Screenshot analysieren', en: 'Analyze Screenshot' },
  'analytics.analyzing': { de: 'Analysiere...', en: 'Analyzing...' },
  'analytics.extracted': { de: 'Extrahierte Metriken', en: 'Extracted Metrics' },
  'analytics.confidence': { de: 'Konfidenz', en: 'Confidence' },
  'analytics.save_metrics': { de: 'Metriken speichern', en: 'Save Metrics' },
  'analytics.saving': { de: 'Speichere...', en: 'Saving...' },
  'analytics.metrics_saved': { de: 'Metriken gespeichert', en: 'Metrics saved' },
  'analytics.metrics_saved_desc': { de: 'Post wurde als analysiert markiert.', en: 'Post was marked as analyzed.' },
  'analytics.ai_learned': { de: 'Was Ihre KI gelernt hat', en: 'What Your AI Learned' },
  'analytics.best_content': { de: 'Bester Content-Typ', en: 'Best Content Type' },
  'analytics.best_content_desc': { de: 'Höchste durchschnittliche Engagement Rate', en: 'Highest average engagement rate' },
  'analytics.topics_resonate': { de: 'Themen die ankommen', en: 'Topics That Resonate' },
  'analytics.sentiment_dist': { de: 'Sentiment-Verteilung', en: 'Sentiment Distribution' },
  'analytics.positive': { de: 'Positiv', en: 'Positive' },
  'analytics.neutral': { de: 'Neutral', en: 'Neutral' },
  'analytics.critical': { de: 'Kritisch', en: 'Critical' },
  'analytics.ai_recommendations': { de: 'KI-Empfehlungen', en: 'AI Recommendations' },
  'analytics.cycle_compare': { de: 'Zyklen vergleichen', en: 'Compare Cycles' },
  'analytics.cycle_desc': { de: 'Durchschnittswerte', en: 'Average values' },
  'analytics.cycle': { de: 'Zyklus', en: 'Cycle' },
  'analytics.posts': { de: 'Posts', en: 'Posts' },
  'analytics.comments': { de: 'Kommentare', en: 'Comments' },
  'analytics.linkedin_missing': { de: 'LinkedIn-URL fehlt', en: 'LinkedIn URL missing' },
  'analytics.linkedin_missing_desc': { de: 'Bitte hinterlegen Sie Ihre LinkedIn-URL in Ihrem Profil.', en: 'Please add your LinkedIn URL in your profile.' },
  'analytics.import_done': { de: 'LinkedIn-Import abgeschlossen', en: 'LinkedIn import completed' },
  'analytics.import_failed': { de: 'Import fehlgeschlagen', en: 'Import failed' },
  'analytics.post_a': { de: 'Post A auswählen', en: 'Select Post A' },
  'analytics.post_b': { de: 'Post B auswählen', en: 'Select Post B' },
  'analytics.select_post_label': { de: 'Post auswählen', en: 'Select post' },
  'analytics.hook': { de: 'Hook', en: 'Hook' },
  'analytics.date': { de: 'Datum', en: 'Date' },
  'analytics.engagement': { de: 'Engagement', en: 'Engagement' },
  'analytics.what_worked': { de: '✓ Was funktioniert hat', en: '✓ What worked' },
  'analytics.improvement': { de: '↗ Verbesserungspotenzial', en: '↗ Room for improvement' },

  // ── Onboarding ──
  'onboarding.welcome': { de: 'Willkommen bei Briefly', en: 'Welcome to Briefly' },
  'onboarding.autopilot': { de: 'Ihr LinkedIn-Autopilot für strategische Sichtbarkeit', en: 'Your LinkedIn autopilot for strategic visibility' },
  'onboarding.ideation_title': { de: 'Ideation Lab', en: 'Ideation Lab' },
  'onboarding.ideation_desc': { de: 'KI-gestützte Content-Ideen aus Ihrem Alltag', en: 'AI-powered content ideas from your daily life' },
  'onboarding.gallery_title': { de: 'Content Gallery', en: 'Content Gallery' },
  'onboarding.gallery_desc': { de: 'Strategische Planung Ihres LinkedIn-Auftritts', en: 'Strategic planning of your LinkedIn presence' },
  'onboarding.analytics_title': { de: 'AI Analytics', en: 'AI Analytics' },
  'onboarding.analytics_desc': { de: 'Datengetriebene Optimierung Ihrer Reichweite', en: 'Data-driven optimization of your reach' },
  'onboarding.step': { de: 'Schritt', en: 'Step' },
  'onboarding.of': { de: 'von', en: 'of' },
  'onboarding.basics': { de: 'Basis-Informationen', en: 'Basic Information' },
  'onboarding.basics_desc': { de: 'Erzählen Sie uns von sich', en: 'Tell us about yourself' },
  'onboarding.linkedin_import': { de: 'LinkedIn-Profil importieren', en: 'Import LinkedIn Profile' },
  'onboarding.linkedin_import_btn': { de: 'Importieren', en: 'Import' },
  'onboarding.linkedin_importing': { de: 'Importiere...', en: 'Importing...' },
  'onboarding.fields_auto': { de: 'Felder werden automatisch ausgefüllt', en: 'Fields will be filled automatically' },
  'onboarding.cv_upload': { de: 'CV hochladen & automatisch ausfüllen', en: 'Upload CV & auto-fill' },
  'onboarding.cv_analyzing': { de: 'CV wird analysiert...', en: 'Analyzing CV...' },
  'onboarding.cv_success': { de: 'CV erfolgreich hochgeladen ✓', en: 'CV successfully uploaded ✓' },
  'onboarding.cv_required': { de: 'Bitte laden Sie Ihren CV hoch, um fortzufahren', en: 'Please upload your CV to continue' },
  'onboarding.photos': { de: 'Profilfotos', en: 'Profile Photos' },
  'onboarding.photos_desc': { de: 'Laden Sie bis zu 3 professionelle Fotos hoch', en: 'Upload up to 3 professional photos' },
  'onboarding.strategy': { de: 'Strategie', en: 'Strategy' },
  'onboarding.strategy_desc': { de: 'Definieren Sie Ihre Kommunikationsstrategie', en: 'Define your communication strategy' },
  'onboarding.audience': { de: 'Zielgruppe', en: 'Target Audience' },
  'onboarding.audience_placeholder': { de: 'Beschreiben Sie Ihre ideale Zielgruppe auf LinkedIn...', en: 'Describe your ideal target audience on LinkedIn...' },
  'onboarding.style': { de: 'Kommunikations-Stil', en: 'Communication Style' },
  'onboarding.topics': { de: 'Themen-DNA', en: 'Topic DNA' },
  'onboarding.topics_desc': { de: 'Welche Themen sollen behandelt oder vermieden werden?', en: 'Which topics should be covered or avoided?' },
  'onboarding.focus': { de: 'Fokus-Themen', en: 'Focus Topics' },
  'onboarding.nogo': { de: 'No-Go Themen', en: 'No-Go Topics' },
  'onboarding.topic_placeholder': { de: 'Thema eingeben + Enter', en: 'Enter topic + Enter' },
  'onboarding.back': { de: 'Zurück', en: 'Back' },
  'onboarding.next': { de: 'Weiter', en: 'Next' },
  'onboarding.saving': { de: 'Wird gespeichert...', en: 'Saving...' },
  'onboarding.complete': { de: 'Abschließen ✨', en: 'Complete ✨' },
  'onboarding.completed': { de: 'Onboarding abgeschlossen!', en: 'Onboarding completed!' },
  'onboarding.step_labels': { de: 'Start,Basis,Fotos,Strategie,Themen', en: 'Start,Basics,Photos,Strategy,Topics' },
  'onboarding.tone_authoritative': { de: 'Autoritär & bestimmt', en: 'Authoritative & Decisive' },
  'onboarding.tone_conversational': { de: 'Locker & gesprächig', en: 'Casual & Conversational' },
  'onboarding.tone_visionary': { de: 'Visionär & zukunftsorientiert', en: 'Visionary & Forward-thinking' },
  'onboarding.tone_technical': { de: 'Fachlich & analytisch', en: 'Technical & Analytical' },
  'onboarding.tone_inspirational': { de: 'Inspirierend & motivierend', en: 'Inspiring & Motivational' },
  'onboarding.photo_labels': { de: 'Hauptprofilbild,Alternativbild 1,Alternativbild 2', en: 'Main Profile Photo,Alternative 1,Alternative 2' },

  // ── NotFound ──
  'notfound.title': { de: 'Seite nicht gefunden', en: 'Page not found' },
  'notfound.back': { de: 'Zurück zur Startseite', en: 'Return to Home' },

  // ── Generic ──
  'error': { de: 'Fehler', en: 'Error' },
  'save_error': { de: 'Fehler beim Speichern', en: 'Error saving' },
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
