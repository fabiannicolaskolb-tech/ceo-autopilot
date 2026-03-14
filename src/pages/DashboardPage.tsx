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
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
// Fictive sparkline trend data
const DRAFT_TREND = [1, 2, 1, 3, 2, 4, 3, 5, 4, 3];
const POSTED_TREND = [0, 1, 1, 2, 2, 3, 4, 3, 5, 6];

// Creator Level System
const CREATOR_LEVELS = [
{ level: 1, name: 'Beobachter', emoji: '👀', min: 0, max: 2, color: 'hsl(var(--muted-foreground))', description: 'Willkommen! Veröffentlichen Sie Ihren ersten Post.' },
{ level: 2, name: 'Einsteiger', emoji: '🌱', min: 3, max: 7, color: 'hsl(var(--success))', description: 'Sie haben den Anfang gemacht – bleiben Sie dran!' },
{ level: 3, name: 'Creator', emoji: '✍️', min: 8, max: 15, color: 'hsl(40, 70%, 48%)', description: 'Sie bauen sich eine echte Präsenz auf.' },
{ level: 4, name: 'Influencer', emoji: '🔥', min: 16, max: 30, color: 'hsl(20, 80%, 50%)', description: 'Ihr Content macht einen Unterschied!' },
{ level: 5, name: 'Thought Leader', emoji: '👑', min: 31, max: Infinity, color: 'hsl(var(--primary))', description: 'Sie gehören zur LinkedIn-Elite.' }];


function getCreatorLevel(postCount: number) {
  const level = CREATOR_LEVELS.find((l) => postCount >= l.min && postCount <= l.max) || CREATOR_LEVELS[0];
  const nextLevel = CREATOR_LEVELS.find((l) => l.level === level.level + 1);
  const progressInLevel = nextLevel ?
  (postCount - level.min) / (nextLevel.min - level.min) * 100 :
  100;
  return { ...level, nextLevel, progressInLevel: Math.min(100, Math.max(0, progressInLevel)), postsToNext: nextLevel ? nextLevel.min - postCount : 0 };
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

  const { data: allPosts = [] } = useQuery({
    queryKey: ['posts', 'all', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.
      from('posts').
      select('id').
      eq('user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const draftCount = drafts.length;
  const postCount = postedPosts.length;
  const totalPostCount = allPosts.length;
  const creatorLevel = getCreatorLevel(totalPostCount);

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

      {/* Creator Level Gamification */}
      <div className="rounded-[24px] bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-[12px] p-2.5 bg-[#d98320]/[0.33]">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-playfair text-base font-semibold text-foreground">Creator Level</h2>
            <p className="text-xs text-muted-foreground">Ihr Fortschritt als LinkedIn Creator</p>
          </div>
        </div>

        {/* Current Level Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full flex items-center justify-center text-3xl" style={{ background: `${creatorLevel.color}15` }}>
                {creatorLevel.emoji}
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-card flex items-center justify-center text-xs font-bold shadow-sm border-2" style={{ borderColor: creatorLevel.color, color: creatorLevel.color }}>
                {creatorLevel.level}
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground tracking-tight">{creatorLevel.name}</p>
              <p className="text-sm text-muted-foreground">{creatorLevel.description}</p>
            </div>
          </div>
          <div className="sm:ml-auto text-right">
            <p className="text-2xl font-bold text-foreground tracking-tight">{totalPostCount}</p>
            <p className="text-xs text-muted-foreground">Posts gesamt</p>
          </div>
        </div>

        {/* Progress Bar */}
        {creatorLevel.nextLevel &&
        <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Level {creatorLevel.level} · {creatorLevel.name}
              </span>
              <span className="text-muted-foreground">
                Level {creatorLevel.nextLevel.level} · {creatorLevel.nextLevel.name}
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted/60 overflow-hidden">
              <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${creatorLevel.progressInLevel}%`,
                background: `linear-gradient(90deg, ${creatorLevel.color}, ${creatorLevel.nextLevel.color})`
              }} />
            
            </div>
            <p className="text-xs text-muted-foreground">
              Noch <span className="font-semibold text-foreground">{creatorLevel.postsToNext} Posts</span> bis zum nächsten Level
            </p>
          </div>
        }

        {/* All Levels Overview */}
        <div className="grid grid-cols-5 gap-2">
          {CREATOR_LEVELS.map((l) => {
            const isActive = l.level === creatorLevel.level;
            const isReached = l.level <= creatorLevel.level;
            return (
              <div
                key={l.level}
                className={`relative rounded-[16px] p-3 text-center transition-all duration-300 ${
                isActive ?
                'bg-primary/8 ring-2 ring-primary/20 scale-105' :
                isReached ?
                'bg-muted/40' :
                'bg-muted/20 opacity-50'}`
                }>
                
                <div className="text-2xl mb-1">{l.emoji}</div>
                <p className={`text-xs font-semibold ${isReached ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {l.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {l.max === Infinity ? `${l.min}+` : `${l.min}–${l.max}`} Posts
                </p>
                {isActive &&
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <Star className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                }
              </div>);

          })}
        </div>
      </div>
    </div>);

}