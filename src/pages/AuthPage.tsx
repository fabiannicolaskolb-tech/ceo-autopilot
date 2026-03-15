import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
      toast({ title: 'Willkommen zurück!' });
    } catch (err: any) {
      toast({ title: 'Anmeldung fehlgeschlagen', description: err?.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password);
      toast({ title: 'Konto erstellt', description: 'Bitte bestätigen Sie Ihre E-Mail-Adresse.' });
    } catch (err: any) {
      toast({ title: 'Registrierung fehlgeschlagen', description: err?.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      toast({ title: 'E-Mail gesendet', description: 'Prüfen Sie Ihr Postfach für den Reset-Link.' });
      setShowReset(false);
    } catch (err: any) {
      toast({ title: 'Fehler', description: err?.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  if (showReset) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="absolute top-4 right-4 z-20 h-9 w-9">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Particles className="absolute inset-0 z-0" quantity={150} color={theme === 'dark' ? '#8899bb' : '#1a2740'} size={0.5} />
        <Card className="relative z-10 w-full max-w-md border-border shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="font-playfair text-2xl">Passwort zurücksetzen</CardTitle>
            <CardDescription className="font-inter">Geben Sie Ihre E-Mail-Adresse ein</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-Mail</Label>
                <Input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-card" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Wird gesendet...' : 'Reset-Link senden'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowReset(false)}>
                Zurück zur Anmeldung
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="absolute top-4 right-4 z-20 h-9 w-9">
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
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
              <TabsTrigger value="login">Anmelden</TabsTrigger>
              <TabsTrigger value="register">Registrieren</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-Mail</Label>
                  <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Passwort</Label>
                  <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-card" />
                </div>
                <InteractiveHoverButton type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Wird angemeldet...' : 'Anmelden'}
                </InteractiveHoverButton>
                <button type="button" onClick={() => setShowReset(true)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Passwort vergessen?
                </button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-Mail</Label>
                  <Input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Passwort</Label>
                  <Input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-card" />
                </div>
                <InteractiveHoverButton type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Wird registriert...' : 'Registrieren'}
                </InteractiveHoverButton>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
