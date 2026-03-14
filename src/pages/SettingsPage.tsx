import React, { useState, useEffect } from 'react';
import { Plus, X, Wifi, WifiOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { MeshBackground } from '@/components/MeshBackground';
import { cn } from '@/lib/utils';

const GLASS_CARD = 'rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]';

const TONES = [
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'visionary', label: 'Visionary' },
  { value: 'technical', label: 'Technical' },
  { value: 'inspirational', label: 'Inspirational' },
];

export default function SettingsPage() {
  const { profile, user, updateProfile, signOut, resetPassword } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('visionary');
  const [focusInput, setFocusInput] = useState('');
  const [noGoInput, setNoGoInput] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCompany(profile.company || '');
      setRole(profile.role || '');
      setIndustry(profile.industry || '');
      setTargetAudience(profile.target_audience || '');
      setTone(profile.tone || 'visionary');
    }
  }, [profile]);

  const { data: voiceSamples = [] } = useQuery({
    queryKey: ['voice_samples', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('voice_samples').select('*').eq('user_id', user!.id).order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: topics = [] } = useQuery({
    queryKey: ['topics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('topics').select('*').eq('user_id', user!.id).order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const focusTopics = topics.filter(t => t.type === 'focus');
  const noGoTopics = topics.filter(t => t.type === 'no-go');

  const [sampleTexts, setSampleTexts] = useState<string[]>([]);
  useEffect(() => {
    const texts = voiceSamples.map(s => s.content);
    while (texts.length < 5) texts.push('');
    setSampleTexts(texts.slice(0, 5));
  }, [voiceSamples]);

  const addTopicMutation = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: string }) => {
      const { error } = await supabase.from('topics').insert({ user_id: user!.id, name, type });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['topics'] }),
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('topics').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['topics'] }),
  });

  const addTopic = (type: 'focus' | 'nogo') => {
    const val = type === 'focus' ? focusInput : noGoInput;
    if (!val.trim()) return;
    addTopicMutation.mutate({ name: val.trim(), type: type === 'nogo' ? 'no-go' : 'focus' });
    if (type === 'focus') setFocusInput(''); else setNoGoInput('');
  };

  const saveAll = async () => {
    try {
      await updateProfile({ name, company, role, industry, target_audience: targetAudience, tone });

      await supabase.from('voice_samples').delete().eq('user_id', user!.id);
      const newSamples = sampleTexts.filter(s => s.trim());
      if (newSamples.length > 0) {
        await supabase.from('voice_samples').insert(newSamples.map(content => ({ user_id: user!.id, content })));
      }
      queryClient.invalidateQueries({ queryKey: ['voice_samples'] });
      toast({ title: 'Alle Änderungen gespeichert' });
    } catch (err: any) {
      toast({ title: 'Fehler', description: err?.message, variant: 'destructive' });
    }
  };

  const handleResetPassword = async () => {
    if (user?.email) {
      try {
        await resetPassword(user.email);
        toast({ title: 'Passwort-Reset E-Mail gesendet' });
      } catch (err: any) {
        toast({ title: 'Fehler', description: err?.message, variant: 'destructive' });
      }
    }
  };

  return (
    <div className="relative space-y-6 pb-20">
      <MeshBackground />

      {/* Header */}
      <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
        <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">Einstellungen</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Verwalten Sie Ihre Einstellungen</p>
      </div>

      <div className={cn(GLASS_CARD, 'p-6')}>
        <h2 className="font-playfair text-base font-semibold text-foreground mb-4">Persönliches Profil</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="bg-card/60" /></div>
          <div className="space-y-2"><Label>Unternehmen</Label><Input value={company} onChange={e => setCompany(e.target.value)} className="bg-card/60" /></div>
          <div className="space-y-2"><Label>Position</Label><Input value={role} onChange={e => setRole(e.target.value)} className="bg-card/60" /></div>
          <div className="space-y-2"><Label>Branche</Label><Input value={industry} onChange={e => setIndustry(e.target.value)} className="bg-card/60" /></div>
        </div>
      </div>

      <div className={cn(GLASS_CARD, 'p-6')}>
        <h2 className="font-playfair text-base font-semibold text-foreground mb-4">KI-Konfiguration</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Kommunikations-Stil</Label>
            <Select value={tone} onValueChange={setTone}><SelectTrigger className="bg-card/60"><SelectValue /></SelectTrigger><SelectContent>{TONES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2"><Label>Zielgruppe</Label><Textarea value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="bg-card/60" /></div>
        </div>
      </div>

      <div className={cn(GLASS_CARD, 'p-6')}>
        <h2 className="font-playfair text-base font-semibold text-foreground mb-4">Content-Steuerung</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fokus-Themen</Label>
            <div className="flex gap-2">
              <Input value={focusInput} onChange={e => setFocusInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTopic('focus'))} className="bg-card/60" placeholder="Thema + Enter" />
              <Button size="icon" variant="outline" onClick={() => addTopic('focus')}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">{focusTopics.map(t => <Badge key={t.id} variant="secondary" className="gap-1 rounded-full">{t.name}<X className="h-3 w-3 cursor-pointer" onClick={() => deleteTopicMutation.mutate(t.id)} /></Badge>)}</div>
          </div>
          <div className="space-y-2">
            <Label>No-Go Themen</Label>
            <div className="flex gap-2">
              <Input value={noGoInput} onChange={e => setNoGoInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTopic('nogo'))} className="bg-card/60" placeholder="Thema + Enter" />
              <Button size="icon" variant="outline" onClick={() => addTopic('nogo')}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">{noGoTopics.map(t => <Badge key={t.id} variant="destructive" className="gap-1 rounded-full">{t.name}<X className="h-3 w-3 cursor-pointer" onClick={() => deleteTopicMutation.mutate(t.id)} /></Badge>)}</div>
          </div>
        </div>
      </div>

      <div className={cn(GLASS_CARD, 'p-6')}>
        <h2 className="font-playfair text-base font-semibold text-foreground mb-4">Voice Library</h2>
        <div className="space-y-3">
          {sampleTexts.map((s, i) => (
            <Textarea key={i} value={s} onChange={e => { const u = [...sampleTexts]; u[i] = e.target.value; setSampleTexts(u); }} placeholder={`Voice Sample ${i + 1}`} className="min-h-[80px] bg-card/60" />
          ))}
        </div>
      </div>

      <div className={cn(GLASS_CARD, 'p-6')}>
        <h2 className="font-playfair text-base font-semibold text-foreground mb-4">LinkedIn Verbindung</h2>
        <div className="flex items-center gap-3">
          {profile?.linkedin_connected ? (
            <>
              <Wifi className="h-5 w-5 text-success" />
              <span className="text-sm text-foreground">Verbunden</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Nicht verbunden</span>
              <Button size="sm" variant="outline" disabled>Verbinden (in Kürze verfügbar)</Button>
            </>
          )}
        </div>
      </div>

      <div className={cn(GLASS_CARD, 'p-6')}>
        <h2 className="font-playfair text-base font-semibold text-foreground mb-4">Account & Sicherheit</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>E-Mail</Label>
            <p className="text-sm text-muted-foreground">{user?.email || '—'}</p>
          </div>
          <Separator />
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleResetPassword}>Passwort zurücksetzen</Button>
            <Button variant="outline" size="sm" onClick={signOut}>Abmelden</Button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={saveAll} className="rounded-full shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.15)] px-6">Alle Änderungen speichern</Button>
      </div>
    </div>
  );
}
