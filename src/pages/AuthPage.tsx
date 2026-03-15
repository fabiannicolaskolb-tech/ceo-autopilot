import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
import { Button } from '@/components/ui/button';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { Particles } from '@/components/ui/particles';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const { signIn, signUp, resetPassword, user, profile } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user && profile) {
      navigate(profile.onboarding_completed ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast({ title: t('auth.welcome') });
    } catch (err: any) {
      toast({ title: t('auth.login_failed'), description: err?.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password);
      toast({ title: t('auth.account_created'), description: t('auth.confirm_email') });
    } catch (err: any) {
      toast({ title: t('auth.register_failed'), description: err?.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      toast({ title: t('auth.email_sent'), description: t('auth.check_inbox') });
      setShowReset(false);
    } catch (err: any) {
      toast({ title: t('auth.error'), description: err?.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const topButtons = (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={toggleLang} className="h-9 gap-1.5 text-xs">
        <Globe className="h-3.5 w-3.5" />
        {lang === 'de' ? 'EN' : 'DE'}
      </Button>
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
    </div>
  );

  if (showReset) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        {topButtons}
        <Particles className="absolute inset-0 z-0" quantity={150} color={theme === 'dark' ? '#8899bb' : '#1a2740'} size={0.5} />
        <Card className="relative z-10 w-full max-w-md border-border shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="font-playfair text-2xl">{t('auth.reset_title')}</CardTitle>
            <CardDescription className="font-inter">{t('auth.reset_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t('auth.email')}</Label>
                <Input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-card" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.reset_sending') : t('auth.reset_send')}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowReset(false)}>
                {t('auth.back_to_login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      {topButtons}
      <Particles className="absolute inset-0 z-0" quantity={150} color={theme === 'dark' ? '#8899bb' : '#1a2740'} size={0.5} burst={burstKey} />
      <Card className="relative z-10 w-full max-w-md border-border shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-playfair text-2xl">Briefly</CardTitle>
          <CardDescription className="font-inter text-xs uppercase tracking-widest text-muted-foreground">LinkedIn</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full" onValueChange={() => setBurstKey(k => k + 1)}>
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('auth.email')}</Label>
                  <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('auth.password')}</Label>
                  <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-card" />
                </div>
                <InteractiveHoverButton type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.logging_in') : t('auth.login')}
                </InteractiveHoverButton>
                <button type="button" onClick={() => setShowReset(true)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('auth.forgot')}
                </button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{t('auth.email')}</Label>
                  <Input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t('auth.password')}</Label>
                  <Input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-card" />
                </div>
                <InteractiveHoverButton type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.registering') : t('auth.register')}
                </InteractiveHoverButton>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
