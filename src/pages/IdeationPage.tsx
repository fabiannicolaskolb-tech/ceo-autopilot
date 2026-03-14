import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Concept {
  hook: string;
  type: string;
  angle: string;
  preview: string;
}

const MOCK_CONCEPTS: Concept[] = [
  { hook: 'Die unbequeme Wahrheit über Führung', type: 'Story Post', angle: 'Personal Branding', preview: 'Als ich vor 10 Jahren mein erstes Team leitete, dachte ich, Führung bedeutet, alle Antworten zu haben. Heute weiß ich: Die besten Leader stellen die richtigen Fragen...' },
  { hook: '3 Dinge, die jeder CEO wissen sollte', type: 'Listicle', angle: 'Thought Leadership', preview: '1. Kultur schlägt Strategie – immer. 2. Ihre besten Mitarbeiter brauchen keine Kontrolle, sondern Vertrauen. 3. Innovation beginnt mit Zuhören...' },
  { hook: 'Warum ich montags keine Meetings mache', type: 'Contrarian', angle: 'Productivity', preview: 'Vor zwei Jahren habe ich eine radikale Entscheidung getroffen: Keine Meetings am Montag. Das Ergebnis? 40% mehr strategische Arbeit in der Woche...' },
  { hook: 'Der Moment, der alles verändert hat', type: 'Story Post', angle: 'Authenticity', preview: 'Es war ein Freitagabend. Das Team hatte gerade den größten Pitch unserer Firmengeschichte verloren. Was dann passierte, hat mich als Führungskraft definiert...' },
];

export default function IdeationPage() {
  const [input, setInput] = useState('');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async (concept: Concept) => {
      const { error } = await supabase.from('posts').insert({
        user_id: user!.id,
        content: concept.preview,
        hook: concept.hook,
        angle: concept.angle,
        type: concept.type,
        status: 'draft',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Entwurf erstellt', description: 'Post wurde zum Planner hinzugefügt.' });
    },
    onError: (err: any) => {
      toast({ title: 'Fehler', description: err?.message, variant: 'destructive' });
    },
  });

  const generate = () => {
    if (!input.trim()) { toast({ title: 'Bitte geben Sie einen Input ein', variant: 'destructive' }); return; }
    setGenerating(true);
    setTimeout(() => {
      setConcepts(MOCK_CONCEPTS);
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-foreground">Ideation Lab</h1>
        <p className="text-sm text-muted-foreground">Verwandeln Sie Ihre Gedanken in LinkedIn-Content</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-5">
          <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Was ist heute passiert? Was beschäftigt Sie gerade? Teilen Sie eine Beobachtung, ein Erlebnis oder eine Idee..." className="mb-4 min-h-[120px] bg-card" />
          <InteractiveHoverButton onClick={generate} disabled={generating}>
            {generating ? 'Ideen werden generiert...' : 'Ideen generieren'}
          </InteractiveHoverButton>
        </CardContent>
      </Card>

      {concepts.length > 0 && (
        <div>
          <h2 className="font-playfair text-lg font-semibold text-foreground mb-4">Generierte Konzepte</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {concepts.map((c, i) => (
              <Card key={i} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="font-playfair text-base">{c.hook}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">{c.type}</Badge>
                    <Badge variant="outline" className="text-xs">{c.angle}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{c.preview}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveMutation.mutate(c)} disabled={saveMutation.isPending}>Auswählen</Button>
                    <Button size="sm" variant="outline">Bearbeiten</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
