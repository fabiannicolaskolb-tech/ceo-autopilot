import React, { useState, useEffect } from 'react';
import { Plus, X, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

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
  const [voiceSamples, setVoiceSamples] = useState<string[]>(['', '', '', '', '']);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCompany(profile.company || '');
      setRole(profile.role || '');
      setIndustry(profile.industry || '');
      setTargetAudience(profile.target_audience || '');
      setTone(profile.tone || 'visionary');
    }
    const saved = JSON.parse(localStorage.getItem('ceo-autopilot-voice-samples') || '[]');
    if (saved.length > 0) setVoiceSamples([...saved, ...Array(5 - saved.length).fill('')].slice(0, 5));
    const topics = JSON.parse(localStorage.getItem('ceo-autopilot-topics') || '[]');
    setFocusTopics(topics.filter((t: any) => t.type === 'focus').map((t: any) => t.name));
    setNoGoTopics(topics.filter((t: any) => t.type === 'no-go').map((t: any) => t.name));
  }, [profile]);

  const addTopic = (type: 'focus' | 'nogo') => {
    const val = type === 'focus' ? focusInput : noGoInput;
    if (!val.trim()) return;
    if (type === 'focus') { setFocusTopics(prev => [...prev, val.trim()]); setFocusInput(''); }
    else { setNoGoTopics(prev => [...prev, val.trim()]); setNoGoInput(''); }
  };

  const saveAll = async () => {
    await updateProfile({ name, company, role, industry, target_audience: targetAudience, tone });
    const samples = voiceSamples.filter(s => s.trim());
    localStorage.setItem('ceo-autopilot-voice-samples', JSON.stringify(samples));
    const topics = [
      ...focusTopics.map(t => ({ name: t, type: 'focus' })),
      ...noGoTopics.map(t => ({ name: t, type: 'no-go' })),
    ];
    localStorage.setItem('ceo-autopilot-topics', JSON.stringify(topics));
    toast({ title: 'Alle Änderungen gespeichert' });
  };

  const handleResetPassword = async () => {
    if (user?.email) {
      await resetPassword(user.email);
      toast({ title: 'Passwort-Reset E-Mail gesendet' });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-foreground">Einstellungen</h1>
        <p className="text-sm text-muted-foreground">Verwalten Sie Ihre Einstellungen</p>
      </div>

      {/* Personal */}
      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">Persönliches Profil</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} className="bg-card" /></div>
          <div className="space-y-2"><Label>Unternehmen</Label><Input value={company} onChange={e => setCompany(e.target.value)} className="bg-card" /></div>
          <div className="space-y-2"><Label>Position</Label><Input value={role} onChange={e => setRole(e.target.value)} className="bg-card" /></div>
          <div className="space-y-2"><Label>Branche</Label><Input value={industry} onChange={e => setIndustry(e.target.value)} className="bg-card" /></div>
        </CardContent>
      </Card>

      {/* AI Config */}
      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">KI-Konfiguration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Kommunikations-Stil</Label>
            <Select value={tone} onValueChange={setTone}><SelectTrigger className="bg-card"><SelectValue /></SelectTrigger><SelectContent>{TONES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2"><Label>Zielgruppe</Label><Textarea value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="bg-card" /></div>
        </CardContent>
      </Card>

      {/* Topics */}
      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">Content-Steuerung</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Fokus-Themen</Label>
            <div className="flex gap-2">
              <Input value={focusInput} onChange={e => setFocusInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTopic('focus'))} className="bg-card" placeholder="Thema + Enter" />
              <Button size="icon" variant="outline" onClick={() => addTopic('focus')}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">{focusTopics.map((t, i) => <Badge key={i} variant="secondary" className="gap-1">{t}<X className="h-3 w-3 cursor-pointer" onClick={() => setFocusTopics(prev => prev.filter((_, idx) => idx !== i))} /></Badge>)}</div>
          </div>
          <div className="space-y-2">
            <Label>No-Go Themen</Label>
            <div className="flex gap-2">
              <Input value={noGoInput} onChange={e => setNoGoInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTopic('nogo'))} className="bg-card" placeholder="Thema + Enter" />
              <Button size="icon" variant="outline" onClick={() => addTopic('nogo')}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">{noGoTopics.map((t, i) => <Badge key={i} variant="destructive" className="gap-1">{t}<X className="h-3 w-3 cursor-pointer" onClick={() => setNoGoTopics(prev => prev.filter((_, idx) => idx !== i))} /></Badge>)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Library */}
      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">Voice Library</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {voiceSamples.map((s, i) => (
            <Textarea key={i} value={s} onChange={e => { const u = [...voiceSamples]; u[i] = e.target.value; setVoiceSamples(u); }} placeholder={`Voice Sample ${i + 1}`} className="min-h-[80px] bg-card" />
          ))}
        </CardContent>
      </Card>

      {/* LinkedIn */}
      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">LinkedIn Verbindung</CardTitle></CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">Account & Sicherheit</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>E-Mail</Label>
            <p className="text-sm text-muted-foreground">{user?.email || '—'}</p>
          </div>
          <Separator />
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleResetPassword}>Passwort zurücksetzen</Button>
            <Button variant="outline" size="sm" onClick={signOut}>Abmelden</Button>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Save */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={saveAll} className="shadow-lg">Alle Änderungen speichern</Button>
      </div>
    </div>
  );
}
