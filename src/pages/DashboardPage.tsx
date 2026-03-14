import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, CalendarDays } from 'lucide-react';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: drafts = [] } = useQuery({
    queryKey: ['posts', 'drafts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'draft');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: nextScheduled } = useQuery({
    queryKey: ['posts', 'next-scheduled', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: postedPosts = [] } = useQuery({
    queryKey: ['posts', 'posted', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'posted');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const draftCount = drafts.length;
  const postCount = postedPosts.length;

  return (
    <div className="relative space-y-6">
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.08}
        duration={6}
        className="absolute inset-0 -z-10 h-[calc(100%+48px)] -mt-6 -ml-4 w-[calc(100%+32px)] fill-primary/5 stroke-primary/10 [mask-image:radial-gradient(ellipse_at_top,white_30%,transparent_70%)]"
      />
      <div>
        <h1 className="font-playfair text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ihr LinkedIn-Überblick auf einen Blick</p>
      </div>

      <HoverBorderGradient>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-foreground">Nächste Aktion</p>
              <p className="text-sm text-muted-foreground">
                {draftCount > 0
                  ? `${draftCount} offene Entwürfe warten auf Ihre Freigabe`
                  : 'Keine offenen Entwürfe – erstellen Sie neue Ideen!'}
              </p>
            </div>
            <InteractiveHoverButton onClick={() => navigate(draftCount > 0 ? '/planner' : '/ideation')}>
              {draftCount > 0 ? 'Zum Planner' : 'Zum Ideation Lab'}
            </InteractiveHoverButton>
          </CardContent>
        </Card>
      </HoverBorderGradient>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Entwürfe', value: String(draftCount), icon: FileText },
          { label: 'Veröffentlicht', value: String(postCount), icon: TrendingUp },
        ].map(s => (
          <HoverBorderGradient key={s.label}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <s.icon className="h-5 w-5 text-muted-foreground" />
                <div className="mt-3">
                  <p className="text-2xl font-semibold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </HoverBorderGradient>
        ))}
      </div>

      <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="font-playfair text-lg">Nächster geplanter Post</CardTitle>
        </CardHeader>
        <CardContent>
          {nextScheduled ? (
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="default" className="text-xs">Geplant</Badge>
                  {nextScheduled.type && <Badge variant="outline" className="text-xs">{nextScheduled.type}</Badge>}
                  {nextScheduled.angle && <Badge variant="outline" className="text-xs">{nextScheduled.angle}</Badge>}
                </div>
                <p className="text-sm text-foreground line-clamp-2">{nextScheduled.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Geplant für {format(new Date(nextScheduled.scheduled_at!), 'EEEE, HH:mm', { locale: de })} Uhr
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Kein Post geplant. Planen Sie Ihren nächsten Beitrag im Planner.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
