import React, { useState, useEffect, useRef } from 'react';
import { Loader2, X, ArrowRight, Sparkles, MessageSquare, FileText, Check, Pencil, CalendarDays, Trash2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { useToast } from '@/hooks/use-toast';
import { MeshBackground } from '@/components/MeshBackground';
import { VoiceCopilotModal } from '@/components/VoiceCopilotModal';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const INITIAL_TEMPLATES = [
  { emoji: '🚀', label: 'Kundenerfolg teilen', prompt: 'Wir haben kürzlich einem Kunden geholfen, [Ergebnis] zu erreichen.' },
  { emoji: '💡', label: 'Leadership-Lektion', prompt: 'Eine Erfahrung als Führungskraft hat mich diese Woche besonders geprägt.' },
  { emoji: '📈', label: 'Branchen-Trend kommentieren', prompt: 'In unserer Branche sehe ich gerade einen spannenden Trend.' },
];

interface Concept {
  hook: string;
  type: string;
  angle: string;
  preview: string;
  score: number;
  category: string;
}

const LOADING_TEXTS = [
  'Analysiere bestehende Posts...',
  'Gleiche mit Ihrer Brand Voice ab...',
  'Berechne Engagement-Potenzial...',
];

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) {
    return <Badge variant="default" className="text-xs font-medium">Potenzial: Hoch · {score}/100</Badge>;
  }
  return <Badge variant="outline" className="text-xs font-medium">Potenzial: Mittel · {score}/100</Badge>;
}

function CharCount({ text }: { text: string }) {
  const len = text.length;
  const ideal = len >= 800 && len <= 1800;
  return (
    <span className={cn('text-xs tabular-nums', ideal ? 'text-emerald-500' : 'text-muted-foreground')}>
      ca. {len.toLocaleString('de-DE')} Zeichen {ideal ? '(Ideal für LinkedIn)' : ''}
    </span>
  );
}

function ExpandedConceptCard({
  concept,
  onSave,
  onDismiss,
  saving,
}: {
  concept: Concept;
  onSave: (c: Concept) => void;
  onDismiss: () => void;
  saving: boolean;
}) {
  const fullText = concept.hook ? `${concept.hook}\n\n${concept.preview}` : concept.preview;
  const [editedText, setEditedText] = useState(fullText);
  const [editing, setEditing] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editing]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const paragraphs = editedText.split(/\n+/).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
      className="space-y-4"
    >
      {/* Post Preview */}
      <div className="rounded-xl border border-border bg-background/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs rounded-sm">{concept.type}</Badge>
          <CharCount text={editedText} />
        </div>

        {editing ? (
          <textarea
            ref={textareaRef}
            value={editedText}
            onChange={handleTextChange}
            className="w-full resize-none bg-transparent font-playfair text-sm leading-[1.85] text-foreground outline-none border border-border/50 rounded-lg p-3 focus:border-primary/50 transition-colors"
            rows={6}
          />
        ) : (
          <div
            onClick={() => setEditing(true)}
            className="cursor-text font-playfair text-sm leading-[1.85] text-foreground space-y-3 min-h-[120px] rounded-lg p-3 transition-colors hover:bg-muted/30"
            title="Klicken zum Bearbeiten"
          >
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          className="rounded-lg text-xs bg-[hsl(217_71%_25%)] hover:bg-[hsl(217_71%_30%)] text-white gap-1.5"
          onClick={() => onSave({ ...concept, preview: editedText, hook: '' })}
          disabled={saving}
        >
          <Check className="h-3.5 w-3.5" />
          In Queue posten
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="rounded-lg text-xs gap-1.5"
          onClick={() => setEditing(!editing)}
        >
          <Pencil className="h-3.5 w-3.5" />
          {editing ? 'Vorschau' : 'Bearbeiten'}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-lg text-xs gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {scheduleDate ? format(scheduleDate, 'dd. MMM', { locale: de }) : 'Planen für...'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={scheduleDate}
              onSelect={setScheduleDate}
              disabled={(date) => date < new Date()}
              initialFocus
              className={cn('p-3 pointer-events-auto')}
            />
          </PopoverContent>
        </Popover>

        <Button
          size="sm"
          variant="ghost"
          className="rounded-lg text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 ml-auto"
          onClick={onDismiss}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Verwerfen
        </Button>
      </div>
    </motion.div>
  );
}

export default function IdeationPage() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [generatingTemplates, setGeneratingTemplates] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

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

  const { data: voiceInsights = [], refetch: refetchInsights } = useQuery({
    queryKey: ['voice_insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('voice_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

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
      setExpandedIndex(null);
    },
    onError: (err: any) => {
      toast({ title: 'Fehler', description: err?.message, variant: 'destructive' });
    },
  });

  const saveInsightAsPost = useMutation({
    mutationFn: async (keyPoint: string) => {
      const { error } = await supabase.from('posts').insert({
        user_id: user!.id,
        content: keyPoint,
        status: 'draft',
        type: 'Voice Insight',
        content_category: 'Voice Copilot',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Post-Entwurf erstellt', description: 'Erkenntnis wurde als Draft gespeichert.' });
    },
    onError: (err: any) => {
      toast({ title: 'Fehler', description: err?.message, variant: 'destructive' });
    },
  });

  const generatePost = async () => {
    setGenerating(true);
    try {
      const requestId = crypto.randomUUID();
      const payload = {
        input: '__post_only__',
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

        await supabase.from('generated_ideas').insert({
          user_id: user!.id,
          request_id: requestId,
          ideas: mapped as any,
          raw_experience: null,
          status: 'generated',
          has_history: false,
        });
      } else {
        toast({ title: 'Keine Posts generiert', description: 'Der Workflow hat keine Konzepte zurückgegeben.', variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Generate post error:', err);
      toast({ title: 'Fehler bei der Post-Generierung', description: err?.message || 'Unbekannter Fehler', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const dismissConcept = (index: number) => {
    setConcepts(prev => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const primaryTopic = topics.length > 0 ? topics[0].name : 'Leadership';

  return (
    <div className="relative space-y-8">
      <MeshBackground />

      <VoiceCopilotModal
        open={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onInsightsSaved={() => refetchInsights()}
      />
      {/* Split View: Actions + Sidebar */}
      <div className="hidden md:block">
        <ResizablePanelGroup direction="horizontal" className="min-h-[380px] rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]">
          {/* Left: Actions */}
          <ResizablePanel defaultSize={70} minSize={55}>
            <div className="p-8 h-full flex flex-col">
              <h1 className="font-playfair text-3xl font-bold text-foreground tracking-tight">
                Ideation Lab
              </h1>
              <p className="text-sm text-muted-foreground mt-1 mb-8">
                Generieren Sie Posts aus Ihren Daten oder teilen Sie persönliche Erlebnisse per Sprache.
              </p>

              <div className="grid gap-6 sm:grid-cols-2 flex-1">
                {/* Post generieren */}
                <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-border bg-muted/20">
                  <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-semibold text-foreground">Post generieren</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Basierend auf Profil, Themen & bisherigen Posts.
                    </p>
                  </div>
                  {generating ? (
                    <div className="flex items-center gap-3 py-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground animate-pulse">
                        {LOADING_TEXTS[loadingTextIndex]}
                      </span>
                    </div>
                  ) : (
                    <InteractiveHoverButton onClick={generatePost}>
                      Post generieren
                    </InteractiveHoverButton>
                  )}
                </div>

                {/* Gespräch starten */}
                <div className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-border bg-muted/20">
                  <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10">
                    <MessageSquare className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-lg font-semibold text-foreground">Gespräch starten</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Persönliche Erlebnisse per Sprache für Content nutzen.
                    </p>
                  </div>
                  <InteractiveHoverButton onClick={() => setVoiceModalOpen(true)}>
                    Gespräch starten
                  </InteractiveHoverButton>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right: Context Sidebar */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="p-6 h-full bg-muted/30 border-l-0">
              <h2 className="font-playfair text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                Inspirations-Vorlagen
              </h2>
              <AnimatePresence mode="wait">
                <motion.div
                  key={templates.map(t => t.label).join(',')}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  {templates.map((tpl, i) => (
                    <div
                      key={i}
                      className="w-full text-left p-3 rounded-sm border border-border bg-card group"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg leading-none">{tpl.emoji}</span>
                        <div>
                          <span className="text-sm font-medium text-foreground">{tpl.label}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{tpl.prompt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                disabled={generatingTemplates}
                onClick={async () => {
                  setGeneratingTemplates(true);
                  try {
                    const { data, error } = await supabase.functions.invoke('generate-templates');
                    if (error) throw error;
                    if (data?.templates && Array.isArray(data.templates) && data.templates.length === 3) {
                      setTemplates(data.templates);
                    } else {
                      throw new Error('Ungültige Antwort');
                    }
                  } catch (e: any) {
                    toast({ title: 'Fehler', description: e?.message || 'Vorlagen konnten nicht generiert werden.', variant: 'destructive' });
                  } finally {
                    setGeneratingTemplates(false);
                  }
                }}
              >
                {generatingTemplates ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                {generatingTemplates ? 'Generiere...' : 'Neue Vorlagen generieren'}
              </Button>

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
      <div className="md:hidden space-y-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">Ideation Lab</h1>
          <p className="text-sm text-muted-foreground mt-1">Posts generieren oder per Sprache Ideen teilen.</p>
        </div>
        <div className="grid gap-4">
          <Card className="rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06)] border-primary/20">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <FileText className="h-7 w-7 text-primary" />
              <h3 className="font-playfair text-lg font-semibold text-foreground">Post generieren</h3>
              {generating ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground animate-pulse">{LOADING_TEXTS[loadingTextIndex]}</span>
                </div>
              ) : (
                <InteractiveHoverButton onClick={generatePost}>Post generieren</InteractiveHoverButton>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06)] border-primary/20">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <MessageSquare className="h-7 w-7 text-primary" />
              <h3 className="font-playfair text-lg font-semibold text-foreground">Gespräch starten</h3>
              <InteractiveHoverButton onClick={() => setVoiceModalOpen(true)}>Gespräch starten</InteractiveHoverButton>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voice Insights */}
      {voiceInsights.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-playfair text-xl font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Erkenntnisse aus Ihren Gesprächen
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {voiceInsights.flatMap((insight: any) =>
              (insight.key_points as string[])?.map((point: string, pi: number) => (
                <Card key={`${insight.id}-${pi}`} className="rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06)]">
                  <CardContent className="p-5 space-y-3">
                    <p className="text-sm text-foreground leading-relaxed">{point}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(insight.created_at).toLocaleDateString('de-DE')}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-sm text-xs"
                        onClick={() => saveInsightAsPost.mutate(point)}
                        disabled={saveInsightAsPost.isPending}
                      >
                        Als Post übernehmen
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) ?? []
            )}
          </div>
        </div>
      )}

      {/* Generated Results */}
      {concepts.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-playfair text-xl font-semibold text-foreground">Generierte Posts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((c, i) => {
              const isExpanded = expandedIndex === i;
              return (
                <Card
                  key={i}
                  className={cn(
                    'rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)] transition-all duration-300',
                    isExpanded
                      ? 'sm:col-span-2 lg:col-span-3 shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.12)]'
                      : 'hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)] cursor-pointer'
                  )}
                  onClick={() => !isExpanded && setExpandedIndex(i)}
                >
                  <CardHeader className="pb-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs rounded-sm">{c.type}</Badge>
                        <Badge variant="outline" className="text-xs rounded-sm">{c.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <ScoreBadge score={c.score} />
                        {isExpanded && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-sm text-xs px-2 h-6"
                            onClick={(e) => { e.stopPropagation(); setExpandedIndex(null); }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardTitle className="font-playfair text-base leading-snug">{c.hook}</CardTitle>
                    {!isExpanded && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{c.angle}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <AnimatePresence mode="wait">
                      {isExpanded ? (
                        <ExpandedConceptCard
                          key="expanded"
                          concept={c}
                          onSave={(updated) => saveMutation.mutate(updated)}
                          onDismiss={() => dismissConcept(i)}
                          saving={saveMutation.isPending}
                        />
                      ) : (
                        <motion.div
                          key="collapsed"
                          className="flex gap-2 pt-1"
                        >
                          <Button
                            size="sm"
                            className="rounded-sm text-xs"
                            onClick={(e) => { e.stopPropagation(); setExpandedIndex(i); }}
                          >
                            Vorschau öffnen
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-sm text-xs px-2"
                            onClick={(e) => { e.stopPropagation(); dismissConcept(i); }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Basierend auf Ihrem Profil und Thema <span className="font-medium text-foreground">{primaryTopic}</span>.
          </p>
        </div>
      )}
    </div>
  );
}
