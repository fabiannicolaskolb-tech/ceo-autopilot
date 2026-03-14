import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Mic, Loader2, X, ArrowRight, Sparkles } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { MeshBackground } from '@/components/MeshBackground';

interface Concept {
  hook: string;
  type: string;
  angle: string;
  preview: string;
  score: number;
  category: string;
}

const MOCK_CONCEPTS: Concept[] = [
  { hook: 'Die unbequeme Wahrheit über Führung', type: 'Story', angle: 'Authentische Führungsgeschichte, die Ihre Glaubwürdigkeit stärkt und Diskussionen anregt.', preview: 'Als ich vor 10 Jahren mein erstes Team leitete, dachte ich, Führung bedeutet, alle Antworten zu haben. Heute weiß ich: Die besten Leader stellen die richtigen Fragen...', score: 92, category: 'Personal Branding' },
  { hook: '3 Dinge, die jeder CEO wissen sollte', type: 'Insight', angle: 'Kompakte Thought-Leadership-Liste, die hohe Speicherraten und Shares erzielt.', preview: '1. Kultur schlägt Strategie – immer. 2. Ihre besten Mitarbeiter brauchen keine Kontrolle, sondern Vertrauen. 3. Innovation beginnt mit Zuhören...', score: 87, category: 'Thought Leadership' },
  { hook: 'Warum ich montags keine Meetings mache', type: 'Contrarian', angle: 'Polarisierende These, die Aufmerksamkeit durch Gegenposition erzeugt.', preview: 'Vor zwei Jahren habe ich eine radikale Entscheidung getroffen: Keine Meetings am Montag. Das Ergebnis? 40% mehr strategische Arbeit in der Woche...', score: 85, category: 'Productivity' },
  { hook: 'Unser größter Kunde kam durch einen LinkedIn-Post', type: 'Case Study', angle: 'Datengetriebene Erfolgsgeschichte, die Kompetenz und ROI demonstriert.', preview: 'Letzten März veröffentlichte ich einen Post über unsere Fehler bei der Skalierung. 48 Stunden später hatte ich 3 Anfragen von Enterprise-Kunden im Postfach...', score: 78, category: 'Social Selling' },
  { hook: 'Was würden Sie tun, wenn Ihr bester Mitarbeiter kündigt?', type: 'Question', angle: 'Engagement-Frage, die Kommentare und Algorithmus-Reichweite maximiert.', preview: 'Letzte Woche stand ich vor genau dieser Situation. Statt in Panik zu verfallen, habe ich drei Fragen gestellt, die alles verändert haben...', score: 73, category: 'Leadership' },
];

const TEMPLATES = [
  { emoji: '🚀', label: 'Kundenerfolg teilen', prompt: 'Wir haben kürzlich einem Kunden geholfen, [Ergebnis] zu erreichen. Der Schlüssel war [Ansatz]. Was mich dabei am meisten überrascht hat...' },
  { emoji: '💡', label: 'Leadership-Lektion', prompt: 'Eine Erfahrung als Führungskraft hat mich diese Woche besonders geprägt: [Situation]. Meine wichtigste Erkenntnis daraus ist...' },
  { emoji: '📈', label: 'Branchen-Trend kommentieren', prompt: 'In unserer Branche sehe ich gerade einen spannenden Trend: [Trend]. Meine These dazu ist, dass dies bedeutet...' },
];

const LOADING_TEXTS = [
  'Analysiere Branchentrends...',
  'Gleiche mit Ihrer Brand Voice ab...',
  'Berechne Engagement-Potenzial...',
];

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) {
    return <Badge variant="default" className="text-xs font-medium">Potenzial: Hoch · {score}/100</Badge>;
  }
  return <Badge variant="outline" className="text-xs font-medium">Potenzial: Mittel · {score}/100</Badge>;
}

export default function IdeationPage() {
  const [input, setInput] = useState('');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  const toggleListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: 'Nicht unterstützt', description: 'Ihr Browser unterstützt kein Voice-to-Text. Bitte nutzen Sie Chrome, Edge oder Safari.', variant: 'destructive' });
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          setInput(prev => prev + transcript + ' ');
        } else {
          interim = transcript;
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
      if (event.error === 'not-allowed') {
        toast({ title: 'Mikrofon blockiert', description: 'Bitte erlauben Sie den Zugriff auf Ihr Mikrofon in den Browser-Einstellungen.', variant: 'destructive' });
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, toast]);

  const { data: topics = [] } = useQuery({
    queryKey: ['topics', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('topics').select('*').eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const matchedTopics = useMemo(() => {
    if (!input.trim() || topics.length === 0) return [];
    const lower = input.toLowerCase();
    return topics.filter(t => lower.includes(t.name.toLowerCase()));
  }, [input, topics]);

  // Cycling loading text
  useEffect(() => {
    if (!generating) return;
    setLoadingTextIndex(0);
    const interval = setInterval(() => {
      setLoadingTextIndex(prev => (prev + 1) % LOADING_TEXTS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [generating]);

  const saveMutation = useMutation({
    mutationFn: async (concept: Concept) => {
      const { error } = await supabase.from('posts').insert({
        user_id: user!.id,
        content: concept.preview,
        hook: concept.hook,
        angle: concept.angle,
        type: concept.type,
        status: 'draft',
        content_category: concept.category,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Entwurf erstellt', description: 'Post wurde zur Gallery hinzugefügt.' });
    },
    onError: (err: any) => {
      toast({ title: 'Fehler', description: err?.message, variant: 'destructive' });
    },
  });

  const generate = async () => {
    if (!input.trim()) {
      toast({ title: 'Bitte geben Sie einen Input ein', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    try {
      const payload = {
        input,
        profile: {
          name: profile?.name,
          company: profile?.company,
          industry: profile?.industry,
          role: profile?.role,
          tone: profile?.tone,
          target_audience: profile?.target_audience,
        },
      };

      const { data, error } = await supabase.functions.invoke('generate-ideas', {
        body: payload,
      });

      if (error) throw error;

      // Map n8n response to Concept[] format
      const raw = data?.concepts;
      if (Array.isArray(raw) && raw.length > 0) {
        const mapped: Concept[] = raw.map((c: any) => ({
          hook: c.hook || '',
          type: c.type || 'Insight',
          angle: c.angle || '',
          preview: c.preview || '',
          score: typeof c.score === 'number' ? c.score : 75,
          category: c.category || 'Allgemein',
        }));
        setConcepts(mapped);
      } else {
        toast({ title: 'Keine Ideen generiert', description: 'Der Workflow hat keine Konzepte zurückgegeben. Versuchen Sie es mit einem anderen Input.', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Generate ideas error:', err);
      toast({ title: 'Fehler bei der Ideengenerierung', description: err?.message || 'Unbekannter Fehler', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const dismissConcept = (index: number) => {
    setConcepts(prev => prev.filter((_, i) => i !== index));
  };

  const primaryTopic = matchedTopics.length > 0 ? matchedTopics[0].name : (topics.length > 0 ? topics[0].name : 'Leadership');

  return (
    <div className="relative space-y-8">
      <MeshBackground />

      {/* Split View */}
      <div className="hidden md:block">
        <ResizablePanelGroup direction="horizontal" className="min-h-[420px] rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]">
          {/* Left: Brain Dump */}
          <ResizablePanel defaultSize={75} minSize={60}>
            <div className="p-8 h-full flex flex-col">
              <h1 className="font-playfair text-3xl font-bold text-foreground tracking-tight">
                Gedanken in Reichweite verwandeln
              </h1>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Teilen Sie eine Beobachtung, und wir verwandeln sie in wirkungsvollen LinkedIn-Content.
              </p>

              <div className="relative flex-1 mb-4">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Was ist heute passiert? Was beschäftigt Sie gerade? Teilen Sie eine Beobachtung, ein Erlebnis oder eine Idee..."
                  className="min-h-[180px] h-full bg-card rounded-sm resize-none pr-12 text-base"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-3 bottom-3 p-2 rounded-sm transition-colors ${listening ? 'bg-destructive/10 text-destructive animate-pulse ring-2 ring-destructive/40' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                  title={listening ? 'Aufnahme stoppen' : 'Voice-to-Text starten'}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>

              {/* Detected topics */}
              {matchedTopics.length > 0 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">Erkannte Themen:</span>
                  {matchedTopics.map(t => (
                    <Badge key={t.id} variant="secondary" className="text-xs rounded-sm">
                      {t.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Generate button or loading */}
              {generating ? (
                <div className="flex items-center gap-3 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground animate-pulse">
                    {LOADING_TEXTS[loadingTextIndex]}
                  </span>
                </div>
              ) : (
                <InteractiveHoverButton onClick={generate}>
                  Ideen generieren
                </InteractiveHoverButton>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right: Context Sidebar */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <div className="p-6 h-full bg-muted/30 border-l-0">
              <h2 className="font-playfair text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                Inspirations-Vorlagen
              </h2>
              <div className="space-y-3">
                {TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setInput(tpl.prompt)}
                    className="w-full text-left p-3 rounded-sm border border-border bg-card hover:border-primary hover:border-l-2 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg leading-none">{tpl.emoji}</span>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {tpl.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* User's focus topics */}
              {topics.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Ihre Fokus-Themen
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {topics.slice(0, 8).map(t => (
                      <Badge key={t.id} variant="outline" className="text-xs rounded-sm">
                        {t.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden space-y-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">
            Gedanken in Reichweite verwandeln
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Teilen Sie eine Beobachtung, und wir verwandeln sie in wirkungsvollen LinkedIn-Content.
          </p>
        </div>

        {/* Mobile templates */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInput(tpl.prompt)}
              className="flex-shrink-0 px-3 py-2 rounded-sm border border-border bg-card text-xs font-medium hover:border-primary transition-colors"
            >
              {tpl.emoji} {tpl.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Was beschäftigt Sie gerade?"
            className="min-h-[140px] bg-card rounded-sm resize-none pr-12"
          />
          <button
            type="button"
            onClick={toggleListening}
            className={`absolute right-3 bottom-3 p-2 rounded-sm transition-colors ${listening ? 'bg-destructive/10 text-destructive animate-pulse ring-2 ring-destructive/40' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
            title={listening ? 'Aufnahme stoppen' : 'Voice-to-Text starten'}
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>

        {matchedTopics.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Erkannte Themen:</span>
            {matchedTopics.map(t => (
              <Badge key={t.id} variant="secondary" className="text-xs rounded-sm">{t.name}</Badge>
            ))}
          </div>
        )}

        {generating ? (
          <div className="flex items-center gap-3 py-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground animate-pulse">{LOADING_TEXTS[loadingTextIndex]}</span>
          </div>
        ) : (
          <InteractiveHoverButton onClick={generate}>Ideen generieren</InteractiveHoverButton>
        )}
      </div>

      {/* Results */}
      {concepts.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-playfair text-xl font-semibold text-foreground">Generierte Ideen</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((c, i) => (
              <Card key={i} className="rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)] hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)] transition-all duration-300">
                <CardHeader className="pb-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-xs rounded-sm">{c.type}</Badge>
                    <ScoreBadge score={c.score} />
                  </div>
                  <CardTitle className="font-playfair text-base leading-snug">{c.hook}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.angle}</p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="rounded-sm text-xs"
                      onClick={() => saveMutation.mutate(c)}
                      disabled={saveMutation.isPending}
                    >
                      Auswählen & Post erstellen
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-sm text-xs"
                      onClick={() => toast({ title: 'Bearbeiten', description: 'Editor wird bald verfügbar.' })}
                    >
                      Bearbeiten
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-sm text-xs px-2"
                      onClick={() => dismissConcept(i)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Basierend auf Ihren erfolgreichsten Posts zum Thema <span className="font-medium text-foreground">{primaryTopic}</span> aus der letzten Woche.
          </p>
        </div>
      )}
    </div>
  );
}
