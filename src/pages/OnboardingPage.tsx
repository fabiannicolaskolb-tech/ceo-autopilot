import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lightbulb, CalendarDays, BarChart3, Plus, X } from 'lucide-react';
import { Particles } from '@/components/ui/particles';
import { useTheme } from '@/hooks/useTheme';
import ShimmerText from '@/components/ui/shimmer-text';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PhotoUpload from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const TONES = [
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'visionary', label: 'Visionary' },
  { value: 'technical', label: 'Technical' },
  { value: 'inspirational', label: 'Inspirational' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('visionary');
  const [focusTopics, setFocusTopics] = useState<string[]>([]);
  const [noGoTopics, setNoGoTopics] = useState<string[]>([]);
  const [focusInput, setFocusInput] = useState('');
  const [noGoInput, setNoGoInput] = useState('');
  const [voiceSamples, setVoiceSamples] = useState<string[]>(['', '', '']);
  const [avatarUrls, setAvatarUrls] = useState<(string | null)[]>([null, null, null]);
  const [saving, setSaving] = useState(false);

  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    setBurstKey(k => k + 1);
  }, [step]);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const addTopic = (type: 'focus' | 'nogo') => {
    const input = type === 'focus' ? focusInput : noGoInput;
    if (!input.trim()) return;
    if (type === 'focus') {
      setFocusTopics(prev => [...prev, input.trim()]);
      setFocusInput('');
    } else {
      setNoGoTopics(prev => [...prev, input.trim()]);
      setNoGoInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'focus' | 'nogo') => {
    if (e.key === 'Enter') { e.preventDefault(); addTopic(type); }
  };

  const addVoiceSample = () => setVoiceSamples(prev => [...prev, '']);

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update profile
      await updateProfile({
        name, company, role, industry, target_audience: targetAudience, tone,
        onboarding_completed: true,
        avatar_url_1: avatarUrls[0],
        avatar_url_2: avatarUrls[1],
        avatar_url_3: avatarUrls[2],
      });

      // Insert voice samples
      const samples = voiceSamples.filter(s => s.trim());
      if (samples.length > 0) {
        const { error: samplesErr } = await supabase.from('voice_samples').insert(
          samples.map(content => ({ user_id: user.id, content }))
        );
        if (samplesErr) throw samplesErr;
      }

      // Insert topics
      const allTopics = [
        ...focusTopics.map(t => ({ user_id: user.id, name: t, type: 'focus' as const })),
        ...noGoTopics.map(t => ({ user_id: user.id, name: t, type: 'no-go' as const })),
      ];
      if (allTopics.length > 0) {
        const { error: topicsErr } = await supabase.from('topics').insert(allTopics);
        if (topicsErr) throw topicsErr;
      }

      toast({ title: 'Onboarding abgeschlossen!' });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({ title: 'Fehler beim Speichern', description: err?.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Particles className="absolute inset-0 z-0" quantity={150} color={theme === 'dark' ? '#8899bb' : '#1a2740'} size={0.5} burst={burstKey} />
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <Progress value={progress} className="h-1 rounded-none" />
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-playfair text-lg font-semibold text-foreground">CEO Autopilot</span>
          </div>
          <span className="text-sm text-muted-foreground">Schritt {step} von {totalSteps}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <ShimmerText className="font-playfair text-3xl font-bold text-foreground">Willkommen bei CEO Autopilot</ShimmerText>
              <p className="mt-2 text-muted-foreground">Ihr LinkedIn-Autopilot für strategische Sichtbarkeit</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Lightbulb, title: 'Ideation Lab', desc: 'KI-gestützte Content-Ideen aus Ihrem Alltag' },
                { icon: CalendarDays, title: 'Content Gallery', desc: 'Strategische Planung Ihres LinkedIn-Auftritts' },
                { icon: BarChart3, title: 'AI Analytics', desc: 'Datengetriebene Optimierung Ihrer Reichweite' },
              ].map(f => (
                <Card key={f.title} className="border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <f.icon className="mb-3 h-8 w-8 text-primary" />
                    <h3 className="font-playfair text-sm font-semibold">{f.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-playfair text-2xl font-bold">Basis-Informationen</h1>
              <p className="mt-1 text-muted-foreground">Erzählen Sie uns von sich</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Max Mustermann" className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label>Unternehmen</Label>
                <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Mustermann GmbH" className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={role} onChange={e => setRole(e.target.value)} placeholder="CEO / Geschäftsführer" className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label>Branche</Label>
                <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="z.B. Technologie, Beratung" className="bg-card" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-playfair text-2xl font-bold">Profilfotos</h1>
              <p className="mt-1 text-muted-foreground">Laden Sie bis zu 3 professionelle Fotos hoch</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {['Hauptprofilbild', 'Alternativbild 1', 'Alternativbild 2'].map((label, i) => (
                <PhotoUpload
                  key={i}
                  label={label}
                  currentUrl={avatarUrls[i]}
                  userId={user?.id || ''}
                  index={i + 1}
                  onUploaded={(url) => setAvatarUrls(prev => { const u = [...prev]; u[i] = url; return u; })}
                  onRemoved={() => setAvatarUrls(prev => { const u = [...prev]; u[i] = null; return u; })}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-playfair text-2xl font-bold">Strategie</h1>
              <p className="mt-1 text-muted-foreground">Definieren Sie Ihre Kommunikationsstrategie</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Zielgruppe</Label>
                <Textarea value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="Beschreiben Sie Ihre ideale Zielgruppe auf LinkedIn..." className="min-h-[100px] bg-card" />
              </div>
              <div className="space-y-2">
                <Label>Kommunikations-Stil</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-playfair text-2xl font-bold">Themen-DNA</h1>
              <p className="mt-1 text-muted-foreground">Welche Themen sollen behandelt oder vermieden werden?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fokus-Themen</Label>
                <div className="flex gap-2">
                  <Input value={focusInput} onChange={e => setFocusInput(e.target.value)} onKeyDown={e => handleKeyDown(e, 'focus')} placeholder="Thema eingeben + Enter" className="bg-card" />
                  <Button type="button" size="icon" variant="outline" onClick={() => addTopic('focus')}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {focusTopics.map((t, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {t}<X className="h-3 w-3 cursor-pointer" onClick={() => setFocusTopics(prev => prev.filter((_, idx) => idx !== i))} />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>No-Go Themen</Label>
                <div className="flex gap-2">
                  <Input value={noGoInput} onChange={e => setNoGoInput(e.target.value)} onKeyDown={e => handleKeyDown(e, 'nogo')} placeholder="Thema eingeben + Enter" className="bg-card" />
                  <Button type="button" size="icon" variant="outline" onClick={() => addTopic('nogo')}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {noGoTopics.map((t, i) => (
                    <Badge key={i} variant="destructive" className="gap-1">
                      {t}<X className="h-3 w-3 cursor-pointer" onClick={() => setNoGoTopics(prev => prev.filter((_, idx) => idx !== i))} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-playfair text-2xl font-bold">Voice Training</h1>
              <p className="mt-1 text-muted-foreground">Fügen Sie 3-5 Ihrer besten LinkedIn-Posts ein</p>
            </div>
            <div className="space-y-4">
              {voiceSamples.map((sample, i) => (
                <div key={i} className="space-y-1">
                  <Label>Sample {i + 1}</Label>
                  <Textarea
                    value={sample}
                    onChange={e => {
                      const updated = [...voiceSamples];
                      updated[i] = e.target.value;
                      setVoiceSamples(updated);
                    }}
                    placeholder="Fügen Sie hier einen LinkedIn-Post ein..."
                    className="min-h-[100px] bg-card"
                  />
                </div>
              ))}
              {voiceSamples.length < 5 && (
                <Button type="button" variant="outline" onClick={addVoiceSample} className="gap-2">
                  <Plus className="h-4 w-4" /> Weiteres Sample hinzufügen
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-2xl justify-between">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
            Zurück
          </Button>
          {step < totalSteps ? (
            <InteractiveHoverButton onClick={() => setStep(s => s + 1)}>Weiter</InteractiveHoverButton>
          ) : (
            <InteractiveHoverButton onClick={handleComplete} disabled={saving}>
              {saving ? 'Wird gespeichert...' : 'Abschließen'}
            </InteractiveHoverButton>
          )}
        </div>
      </div>
    </div>
  );
}
