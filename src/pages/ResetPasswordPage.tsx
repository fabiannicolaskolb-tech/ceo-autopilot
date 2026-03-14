import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: 'Passwörter stimmen nicht überein', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      toast({ title: 'Passwort aktualisiert' });
      navigate('/auth');
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-playfair text-2xl">Neues Passwort setzen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Neues Passwort</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-card" />
            </div>
            <div className="space-y-2">
              <Label>Passwort bestätigen</Label>
              <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="bg-card" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird aktualisiert...' : 'Passwort speichern'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
