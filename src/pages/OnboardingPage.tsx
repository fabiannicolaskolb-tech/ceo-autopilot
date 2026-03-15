import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lightbulb, CalendarDays, BarChart3, Plus, X, Upload, Loader2, Linkedin, Check } from 'lucide-react';
import { Particles } from '@/components/ui/particles';
import { useTheme } from '@/hooks/useTheme';
import { useLang } from '@/hooks/useLang';
import ShimmerText from '@/components/ui/shimmer-text';
import { GlowingShadow } from '@/components/ui/glowing-shadow';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PhotoUpload from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [scrapingLinkedin, setScrapingLinkedin] = useState(false);
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('visionary');
  const [focusTopics, setFocusTopics] = useState<string[]>([]);
  const [noGoTopics, setNoGoTopics] = useState<string[]>([]);
  const [focusInput, setFocusInput] = useState('');
  const [noGoInput, setNoGoInput] = useState('');
  const [avatarUrls, setAvatarUrls] = useState<(string | null)[]>([null, null, null]);
  const [saving, setSaving] = useState(false);
  const [parsingCv, setParsingCv] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);
  const cvInputRef = React.useRef<HTMLInputElement>(null);

  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const { t, lang } = useLang();
  const [burstKey, setBurstKey] = useState(0);

  const TONES = [
    { value: 'authoritative', label: t('onboarding.tone_authoritative') },
    { value: 'conversational', label: t('onboarding.tone_conversational') },
    { value: 'visionary', label: t('onboarding.tone_visionary') },
    { value: 'technical', label: t('onboarding.tone_technical') },
    { value: 'inspirational', label: t('onboarding.tone_inspirational') },
  ];

  const STEP_LABELS = t('onboarding.step_labels').split(',');
  const PHOTO_LABELS = t('onboarding.photo_labels').split(',');

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsingCv(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data, error } = await supabase.functions.invoke('parse-cv', { body: formData });
      if (error) throw new Error(error.message || t('error'));
      if (!data || typeof data !== 'object') throw new Error(t('error'));
      const parsed = data as Partial<Record<'name' | 'company' | 'role' | 'industry', string>>;
      if (parsed.name) setName(parsed.name);
      if (parsed.company) setCompany(parsed.company);
      if (parsed.role) setRole(parsed.role);
      if (parsed.industry) setIndustry(parsed.industry);
      setCvUploaded(true);
      toast({ title: t('onboarding.cv_success') });
    } catch (err: any) {
      toast({ title: t('error'), description: err?.message, variant: 'destructive' });
    }
    setParsingCv(false);
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  const handleLinkedinScrape = async () => {
    if (!linkedinUrl.trim()) return;
    setScrapingLinkedin(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-linkedin`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ linkedin_url: linkedinUrl.trim() })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('error'));
      if (data.name) setName(data.name);
      if (data.company) setCompany(data.company);
      if (data.role) setRole(data.role);
      if (data.industry) setIndustry(data.industry);
      toast({ title: t('profile.imported') });
    } catch (err: any) {
      toast({ title: t('error'), description: err?.message, variant: 'destructive' });
    }
    setScrapingLinkedin(false);
  };

  useEffect(() => { setBurstKey((k) => k + 1); }, [step]);

  const isStepValid = (() => {
    switch (step) {
      case 1: return true;
      case 2: return cvUploaded && name.trim() !== '' && company.trim() !== '' && role.trim() !== '' && industry.trim() !== '';
      case 3: return avatarUrls.filter((url) => url !== null).length >= 2;
      case 4: return targetAudience.trim() !== '' && tone.trim() !== '';
      case 5: return focusTopics.length > 0;
      default: return true;
    }
  })();

  const totalSteps = 5;
  const progress = step / totalSteps * 100;

  const addTopic = (type: 'focus' | 'nogo') => {
    const input = type === 'focus' ? focusInput : noGoInput;
    if (!input.trim()) return;
    if (type === 'focus') { setFocusTopics((prev) => [...prev, input.trim()]); setFocusInput(''); }
    else { setNoGoTopics((prev) => [...prev, input.trim()]); setNoGoInput(''); }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'focus' | 'nogo') => {
    if (e.key === 'Enter') { e.preventDefault(); addTopic(type); }
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile({
        name, company, role, industry, target_audience: targetAudience, tone,
        onboarding_completed: true,
        avatar_url_1: avatarUrls[0],
        avatar_url_2: avatarUrls[1],
        avatar_url_3: avatarUrls[2],
        linkedin_url: linkedinUrl.trim() || null
      });
      const allTopics = [
        ...focusTopics.map((tp) => ({ user_id: user.id, name: tp, type: 'focus' as const })),
        ...noGoTopics.map((tp) => ({ user_id: user.id, name: tp, type: 'no-go' as const })),
      ];
      if (allTopics.length > 0) {
        const { error: topicsErr } = await supabase.from('topics').insert(allTopics);
        if (topicsErr) throw topicsErr;
      }
      toast({ title: t('onboarding.completed') });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast({ title: t('save_error'), description: err?.message, variant: 'destructive' });
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
            <span className="font-playfair text-lg font-semibold text-foreground">Briefly</span>
          </div>
          <span className="text-sm text-muted-foreground">{t('onboarding.step')} {step} {t('onboarding.of')} {totalSteps}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 px-6 pb-3">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const isActive = s === step;
            return (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10 pb-28">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <ShimmerText className="font-playfair text-3xl font-bold text-foreground">{t('onboarding.welcome')}</ShimmerText>
              <p className="mt-2 text-muted-foreground">{t('onboarding.autopilot')}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { icon: Lightbulb, title: t('onboarding.ideation_title'), desc: t('onboarding.ideation_desc') },
                { icon: CalendarDays, title: t('onboarding.gallery_title'), desc: t('onboarding.gallery_desc') },
                { icon: BarChart3, title: t('onboarding.analytics_title'), desc: t('onboarding.analytics_desc') },
              ].map((f) => (
                <GlowingShadow key={f.title}>
                  <div className="flex flex-col items-center p-10 text-center">
                    <f.icon className="mb-4 h-12 w-12 text-primary" />
                    <h3 className="font-playfair text-base font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </GlowingShadow>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-playfair text-2xl font-bold">{t('onboarding.basics')}</h1>
              <p className="mt-1 text-muted-foreground">{t('onboarding.basics_desc')}</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                {t('onboarding.linkedin_import')}
              </Label>
              <div className="flex gap-2">
                <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/your-profile" className="bg-card" />
                <Button type="button" variant="outline" className="shrink-0 gap-2" disabled={scrapingLinkedin || !linkedinUrl.trim()} onClick={handleLinkedinScrape}>
                  {scrapingLinkedin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Linkedin className="h-4 w-4" />}
                  {scrapingLinkedin ? t('onboarding.linkedin_importing') : t('onboarding.linkedin_import_btn')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t('onboarding.fields_auto')}</p>
            </div>
            <div className="flex flex-col items-center">
              <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleCvUpload} />
              <Button
                type="button"
                variant={cvUploaded ? "default" : "outline"}
                className={cn("gap-2", cvUploaded && "bg-green-600 hover:bg-green-700 text-white")}
                disabled={parsingCv || cvUploaded}
                onClick={() => cvInputRef.current?.click()}
              >
                {parsingCv ? <Loader2 className="h-4 w-4 animate-spin" /> : cvUploaded ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                {parsingCv ? t('onboarding.cv_analyzing') : cvUploaded ? t('onboarding.cv_success') : t('onboarding.cv_upload')}
              </Button>
              {!cvUploaded && <p className="text-xs text-muted-foreground mt-2">{t('onboarding.cv_required')}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>{t('profile.name')}</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Max Mustermann" className="bg-card" /></div>
              <div className="space-y-2"><Label>{t('profile.company')}</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Mustermann GmbH" className="bg-card" /></div>
              <div className="space-y-2"><Label className="text-muted-foreground">{t('profile.position')}</Label><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="CEO" className="bg-card" /></div>
              <div className="space-y-2"><Label>{t('profile.industry')}</Label><Input value={industry} onChange={(e) => setIndustry(e.target.value)} className="bg-card" /></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-playfair text-2xl font-bold">{t('onboarding.photos')}</h1>
              <p className="mt-1 text-muted-foreground">{t('onboarding.photos_desc')}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {PHOTO_LABELS.map((label, i) => (
                <PhotoUpload
                  key={i}
                  label={label}
                  currentUrl={avatarUrls[i]}
                  userId={user?.id || ''}
                  index={i + 1}
                  onUploaded={(url) => setAvatarUrls((prev) => { const u = [...prev]; u[i] = url; return u; })}
                  onRemoved={() => setAvatarUrls((prev) => { const u = [...prev]; u[i] = null; return u; })}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-playfair text-2xl font-bold">{t('onboarding.strategy')}</h1>
              <p className="mt-1 text-muted-foreground">{t('onboarding.strategy_desc')}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('onboarding.audience')}</Label>
                <Textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder={t('onboarding.audience_placeholder')} className="min-h-[100px] bg-card" />
              </div>
              <div className="space-y-2">
                <Label>{t('onboarding.style')}</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((tn) => <SelectItem key={tn.value} value={tn.value}>{tn.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="font-playfair text-2xl font-bold">{t('onboarding.topics')}</h1>
              <p className="mt-1 text-muted-foreground">{t('onboarding.topics_desc')}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('onboarding.focus')}</Label>
                <div className="flex gap-2">
                  <Input value={focusInput} onChange={(e) => setFocusInput(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'focus')} placeholder={t('onboarding.topic_placeholder')} className="bg-card" />
                  <Button type="button" size="icon" variant="outline" onClick={() => addTopic('focus')}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {focusTopics.map((tp, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">{tp}<X className="h-3 w-3 cursor-pointer" onClick={() => setFocusTopics((prev) => prev.filter((_, idx) => idx !== i))} /></Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('onboarding.nogo')}</Label>
                <div className="flex gap-2">
                  <Input value={noGoInput} onChange={(e) => setNoGoInput(e.target.value)} onKeyDown={(e) => handleKeyDown(e, 'nogo')} placeholder={t('onboarding.topic_placeholder')} className="bg-card" />
                  <Button type="button" size="icon" variant="outline" onClick={() => addTopic('nogo')}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {noGoTopics.map((tp, i) => (
                    <Badge key={i} variant="destructive" className="gap-1">{tp}<X className="h-3 w-3 cursor-pointer" onClick={() => setNoGoTopics((prev) => prev.filter((_, idx) => idx !== i))} /></Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-end gap-3">
          <Button variant="outline" className="mr-auto" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
            {t('onboarding.back')}
          </Button>
          {step < totalSteps ? (
            <InteractiveHoverButton onClick={() => setStep((s) => s + 1)} disabled={!isStepValid}>{t('onboarding.next')}</InteractiveHoverButton>
          ) : (
            <ShimmerButton
              shimmerColor="hsl(var(--primary))"
              background="hsl(var(--primary))"
              className="text-primary-foreground text-sm font-medium"
              onClick={handleComplete}
              disabled={saving || !isStepValid}
            >
              {saving ? t('onboarding.saving') : t('onboarding.complete')}
            </ShimmerButton>
          )}
        </div>
      </div>
    </div>
  );
}
