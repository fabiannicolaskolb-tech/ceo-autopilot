import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, CalendarDays, Rocket } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sparkline } from '@/components/Sparkline';
import { MeshBackground } from '@/components/MeshBackground';
import CreatorScoreCard from '@/components/CreatorScoreCard';
import { format, subDays, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';

function buildTrend(posts: any[], status: string, days = 30): number[] {
  const now = new Date();
  const buckets: number[] = [];
  const bucketCount = 10;
  const bucketSize = Math.ceil(days / bucketCount);
  for (let i = bucketCount - 1; i >= 0; i--) {
    const bucketEnd = subDays(now, i * bucketSize);
    const bucketStart = subDays(now, (i + 1) * bucketSize);
    const count = posts.filter(p => {
      const d = new Date(status === 'draft' ? p.created_at : (p.posted_at || p.created_at));
      return d >= startOfDay(bucketStart) && d < startOfDay(bucketEnd);
    }).length;
    buckets.push(count);
  }
  return buckets;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const firstName = profile?.name?.split(' ')[0] ?? 'dort';
  const initials = profile?.name ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  const { data: drafts = [] } = useQuery({
    queryKey: ['posts', 'drafts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.
      from('posts').
      select('*').
      eq('user_id', user!.id).
      eq('status', 'draft');
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: nextScheduled } = useQuery({
    queryKey: ['posts', 'next-scheduled', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.
      from('posts').
      select('*').
      eq('user_id', user!.id).
      eq('status', 'scheduled').
      gte('scheduled_at', new Date().toISOString()).
      order('scheduled_at', { ascending: true }).
      limit(1).
      maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: postedPosts = [] } = useQuery({
    queryKey: ['posts', 'posted', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.
      from('posts').
      select('*').
      eq('user_id', user!.id).
      eq('status', 'posted');
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const draftTrend = useMemo(() => buildTrend(drafts, 'draft'), [drafts]);
  const postedTrend = useMemo(() => buildTrend(postedPosts, 'posted'), [postedPosts]);

  const draftCount = drafts.length;
  const postCount = postedPosts.length;

  return (
    <div className="relative min-h-[calc(100vh-80px)] space-y-8">
      <MeshBackground />

      {/* Welcome Hero */}
      <div className="rounded-[24px] bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
              {profile?.avatar_url_1 && <AvatarImage src={profile.avatar_url_1} alt="Avatar" />}
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">
                Hi {firstName}, bereit für den nächsten Post?
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {draftCount > 0 ?
                `${draftCount} Entwürfe warten auf Ihre Freigabe` :
                'Starten Sie mit einer neuen Idee'}
              </p>
            </div>
          </div>
          <InteractiveHoverButton onClick={() => navigate(draftCount > 0 ? '/planner' : '/ideation')}>
            {draftCount > 0 ? 'Zum Planner' : 'Zum Ideation Lab'}
          </InteractiveHoverButton>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Drafts Widget */}
        <div className="flex flex-col overflow-hidden rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)] transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)]">
          <div className="p-6 pb-2">
            <div className="flex items-start justify-between">
              <div className="rounded-[12px] p-2.5 bg-[#c8ccd5]">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground tracking-tight">{draftCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Entwürfe</p>
            </div>
          </div>
          <div className="flex-1 min-h-[60px]">
            <Sparkline data={DRAFT_TREND} color="hsl(220, 55%, 20%)" height={80} width={300} />
          </div>
        </div>

        {/* Published Widget */}
        <div className="flex flex-col overflow-hidden rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)] transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)]">
          <div className="p-6 pb-2">
            <div className="flex items-start justify-between">
              <div className="rounded-[12px] bg-[hsl(160_60%_38%/0.1)] p-2.5">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground tracking-tight">{postCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Veröffentlicht</p>
            </div>
          </div>
          <div className="flex-1 min-h-[60px]">
            <Sparkline data={POSTED_TREND} color="hsl(160, 60%, 38%)" height={80} width={300} />
          </div>
        </div>

        {/* Next Scheduled - spans 2 cols on lg */}
        <div className="sm:col-span-2 rounded-[24px] bg-card/80 backdrop-blur-xl p-6 shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)] transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-[12px] bg-[hsl(40_70%_48%/0.1)] p-2.5">
              <CalendarDays className="h-5 w-5 text-warning" />
            </div>
            <h2 className="font-playfair text-base font-semibold text-foreground">Nächster geplanter Post</h2>
          </div>

          {nextScheduled ?
          <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="text-xs rounded-full">Geplant</Badge>
                {nextScheduled.type && <Badge variant="outline" className="text-xs rounded-full">{nextScheduled.type}</Badge>}
                {nextScheduled.angle && <Badge variant="outline" className="text-xs rounded-full">{nextScheduled.angle}</Badge>}
              </div>
              <p className="text-sm text-foreground line-clamp-2 leading-relaxed">{nextScheduled.content}</p>
              <p className="text-xs text-muted-foreground">
                Geplant für {format(new Date(nextScheduled.scheduled_at!), 'EEEE, HH:mm', { locale: de })} Uhr
              </p>
            </div> :

          <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-muted/60 p-4 mb-3">
                <Rocket className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground/70">Noch kein Post geplant</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                Ihre nächste Idee ist nur einen Klick entfernt. Starten Sie im Ideation Lab.
              </p>
            </div>
          }
        </div>
      </div>

      {/* Creator Score */}
      <CreatorScoreCard />
    </div>);

}