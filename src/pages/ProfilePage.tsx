import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Wifi, WifiOff, Loader2, Link as LinkIcon, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PhotoUpload from '@/components/PhotoUpload';
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

export default function ProfilePage() {
  const { profile, user, updateProfile, refreshProfile, signOut, resetPassword } = useAuth();
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
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCompany(profile.company || '');
      setRole(profile.role || '');
      setIndustry(profile.industry || '');
      setTargetAudience(profile.target_audience || '');
      setTone(profile.tone || 'visionary');
      setLinkedinUrl(profile.linkedin_url || '');
    }
  }, [profile]);

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
      await updateProfile({ name, company, role, industry, target_audience: targetAudience, tone });
      toast({ title: 'Profil gespeichert' });
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

      <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
        <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Verwalten Sie Ihr Profil und Ihre LinkedIn-Strategie</p>
      </div>

      <div className={cn(GLASS_CARD, 'p-6')}>
        <h2 className="font-playfair text-base font-semibold text-foreground mb-4">Grundinformationen</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="bg-card/60" /></div>
          <div className="space-y-2"><Label>Unternehmen</Label><Input value={company} onChange={e => setCompany(e.target.value)} className="bg-card/60" /></div>
          <div className="space-y-2"><Label>Position</Label><Input value={role} onChange={e => setRole(e.target.value)} className="bg-card/60" /></div>
          <div className="space-y-2"><Label>Branche</Label><Input value={industry} onChange={e => setIndustry(e.target.value)} className="bg-card/60" /></div>
        </div>
      </div>

      <div className={cn(GLASS_CARD, 'p-6')}>
        <h2 className="font-playfair text-base font-semibold text-foreground mb-4">KI-Konfiguration</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Kommunikations-Tonfall</Label>
            <Select value={tone} onValueChange={setTone}><SelectTrigger className="bg-card/60"><SelectValue /></SelectTrigger><SelectContent>{TONES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2 sm:col-span-2"><Label>Zielgruppe</Label><Textarea value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="bg-card/60" /></div>
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
        <h2 className="font-playfair text-base font-semibold text-foreground mb-2">Profilfotos</h2>
        <p className="text-xs text-muted-foreground mb-4">Drag & Drop zum Umsortieren — das erste Bild ist Ihr Hauptprofilbild</p>
        <PhotoGrid
          profile={profile}
          userId={user?.id || ''}
          updateProfile={updateProfile}
          refreshProfile={refreshProfile}
        />
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
        <Button onClick={save} className="rounded-full shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.15)] px-6">Alle Änderungen speichern</Button>
      </div>
    </div>
  );
}

const AVATAR_KEYS = ['avatar_url_1', 'avatar_url_2', 'avatar_url_3'] as const;
const LABELS = ['Hauptprofilbild', 'Alternativbild 1', 'Alternativbild 2'];

interface PhotoGridProps {
  profile: any;
  userId: string;
  updateProfile: (data: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

function PhotoGrid({ profile, userId, updateProfile, refreshProfile }: PhotoGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  };

  const handleDragLeave = () => {
    setOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setOverIndex(null);
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    const sourceKey = AVATAR_KEYS[dragIndex];
    const targetKey = AVATAR_KEYS[targetIndex];
    const sourceUrl = profile?.[sourceKey] || null;
    const targetUrl = profile?.[targetKey] || null;

    try {
      await updateProfile({ [sourceKey]: targetUrl, [targetKey]: sourceUrl });
      await refreshProfile();
      toast({ title: 'Reihenfolge aktualisiert' });
    } catch {
      toast({ title: 'Fehler beim Umsortieren', variant: 'destructive' });
    }
    setDragIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="flex flex-wrap gap-6">
      {AVATAR_KEYS.map((key, i) => {
        const hasImage = !!profile?.[key];
        return (
          <div
            key={key}
            draggable={hasImage}
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative transition-all duration-200',
              dragIndex === i && 'opacity-40 scale-95',
              overIndex === i && dragIndex !== i && 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg',
            )}
          >
            <PhotoUpload
              label={LABELS[i]}
              currentUrl={profile?.[key]}
              userId={userId}
              index={i + 1}
              onUploaded={async (url) => { await updateProfile({ [key]: url }); await refreshProfile(); }}
              onRemoved={async () => { await updateProfile({ [key]: null }); await refreshProfile(); }}
            />
            {hasImage && (
              <div className="flex justify-center mt-1 cursor-grab active:cursor-grabbing">
                <div className="rounded-full bg-muted/60 p-1 shadow-sm">
                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
