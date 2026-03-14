import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PhotoUpload from '@/components/PhotoUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const TONES = [
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'visionary', label: 'Visionary' },
  { value: 'technical', label: 'Technical' },
  { value: 'inspirational', label: 'Inspirational' },
];

export default function ProfilePage() {
  const { profile, user, updateProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('visionary');
  const [focusInput, setFocusInput] = useState('');
  const [noGoInput, setNoGoInput] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
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

  const save = async () => {
    try {
      await updateProfile({ name, role, industry, target_audience: targetAudience, tone });

      // Replace voice samples: delete old, insert new
      await supabase.from('voice_samples').delete().eq('user_id', user!.id);
      const newSamples = sampleTexts.filter(s => s.trim());
      if (newSamples.length > 0) {
        await supabase.from('voice_samples').insert(newSamples.map(content => ({ user_id: user!.id, content })));
      }
      queryClient.invalidateQueries({ queryKey: ['voice_samples'] });
      toast({ title: 'Profil gespeichert' });
    } catch (err: any) {
      toast({ title: 'Fehler', description: err?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-foreground">Profil Setup</h1>
        <p className="text-sm text-muted-foreground">Optimieren Sie Ihre LinkedIn-Strategie</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">Grundinformationen</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="bg-card" /></div>
          <div className="space-y-2"><Label>Position</Label><Input value={role} onChange={e => setRole(e.target.value)} className="bg-card" /></div>
          <div className="space-y-2"><Label>Branche</Label><Input value={industry} onChange={e => setIndustry(e.target.value)} className="bg-card" /></div>
          <div className="space-y-2">
            <Label>Kommunikations-Tonfall</Label>
            <Select value={tone} onValueChange={setTone}><SelectTrigger className="bg-card"><SelectValue /></SelectTrigger><SelectContent>{TONES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2 sm:col-span-2"><Label>Zielgruppe</Label><Textarea value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="bg-card" /></div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">Voice Samples</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {sampleTexts.map((s, i) => (
            <Textarea key={i} value={s} onChange={e => { const u = [...sampleTexts]; u[i] = e.target.value; setSampleTexts(u); }} placeholder={`Sample ${i + 1}`} className="min-h-[80px] bg-card" />
          ))}
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">Themen</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Fokus-Themen</Label>
            <div className="flex gap-2">
              <Input value={focusInput} onChange={e => setFocusInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTopic('focus'))} className="bg-card" placeholder="Thema + Enter" />
              <Button size="icon" variant="outline" onClick={() => addTopic('focus')}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">{focusTopics.map(t => <Badge key={t.id} variant="secondary" className="gap-1">{t.name}<X className="h-3 w-3 cursor-pointer" onClick={() => deleteTopicMutation.mutate(t.id)} /></Badge>)}</div>
          </div>
          <div className="space-y-2">
            <Label>No-Go Themen</Label>
            <div className="flex gap-2">
              <Input value={noGoInput} onChange={e => setNoGoInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTopic('nogo'))} className="bg-card" placeholder="Thema + Enter" />
              <Button size="icon" variant="outline" onClick={() => addTopic('nogo')}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">{noGoTopics.map(t => <Badge key={t.id} variant="destructive" className="gap-1">{t.name}<X className="h-3 w-3 cursor-pointer" onClick={() => deleteTopicMutation.mutate(t.id)} /></Badge>)}</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>Profil speichern</Button>
      </div>
    </div>
  );
}
