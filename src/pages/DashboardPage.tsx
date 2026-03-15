import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, TrendingUp, CalendarDays, Rocket, Loader2, Brain, ArrowUpRight, ArrowDownRight, Lightbulb, GalleryHorizontalEnd, BarChart3 } from 'lucide-react';
import DailyBriefing from '@/components/DailyBriefing';
import { useAuth } from '@/hooks/useAuth';
import { usePosts, usePipelineStatus } from '@/hooks/useRealtime';
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

const STAGE_LABELS: Record<string, string> = {
  started: 'Gestartet',
  ideating: 'Ideen werden generiert',
  creating: 'Post wird erstellt',
  posting: 'Wird veröffentlicht',
  analyzing: 'Analyse läuft',
  completed: 'Abgeschlossen',
  error: 'Fehler',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const firstName = profile?.name?.split(' ')[0] ?? 'dort';
  const initials = profile?.name ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  const { posts, loading: postsLoading } = usePosts(user?.id);
  const { pipeline } = usePipelineStatus(user?.id);

  const drafts = useMemo(() => posts.filter(p => p.status === 'draft'), [posts]);
  const postedPosts = useMemo(() => posts.filter(p => p.status === 'posted'), [posts]);
  const nextScheduled = useMemo(() => {
    const now = new Date().toISOString();
    return posts
      .filter(p => p.status === 'scheduled' && p.scheduled_at && p.scheduled_at >= now)
      .sort((a, b) => (a.scheduled_at || '').localeCompare(b.scheduled_at || ''))[0] || null;
  }, [posts]);

  const draftTrend = useMemo(() => buildTrend(drafts, 'draft'), [drafts]);
  const postedTrend = useMemo(() => buildTrend(postedPosts, 'posted'), [postedPosts]);

  const draftCount = drafts.length;
  const postCount = postedPosts.length;

  const pipelineRunning = pipeline && pipeline.stage !== 'completed' && pipeline.stage !== 'error' && pipeline.stage !== 'idle';

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
          <div className="flex items-center gap-3">
            {pipelineRunning && (
              <Badge variant="secondary" className="flex items-center gap-1.5 text-xs rounded-full animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                {STAGE_LABELS[pipeline.stage] || pipeline.stage}
              </Badge>
            )}
            <InteractiveHoverButton onClick={() => navigate('/profile')}>
              Profil bearbeiten
            </InteractiveHoverButton>
          </div>
        </div>
      </div>

      {/* Daily Briefing */}
      <DailyBriefing />

      {/* Quick Navigation */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { title: 'Ideation Lab', desc: 'Neue Ideen generieren', icon: Lightbulb, url: '/ideation', color: 'hsl(var(--warning))' },
          { title: 'Post Library', desc: 'Alle Beiträge verwalten', icon: GalleryHorizontalEnd, url: '/post-library', color: 'hsl(var(--success))' },
          { title: 'Analytics', desc: 'Performance analysieren', icon: BarChart3, url: '/analytics', color: 'hsl(var(--primary))' },
        ].map(item => (
          <Link
            key={item.url}
            to={item.url}
            className="group rounded-2xl bg-card/80 backdrop-blur-xl p-4 sm:p-5 shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06)] border border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.12)] hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2.5 transition-colors" style={{ backgroundColor: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>
                <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" style={{ color: item.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
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
            <Sparkline data={draftTrend} color="hsl(220, 55%, 20%)" height={80} width={300} />
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
            <Sparkline data={postedTrend} color="hsl(160, 60%, 38%)" height={80} width={300} />
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

      {/* AI Learning Progress */}
      <LearningProgressCard posts={posts} />
    </div>);
}

function LearningProgressCard({ posts }: { posts: any[] }) {
  const analyzedPosts = useMemo(() =>
    posts.filter(p => p.status === 'analyzed' || (p.metrics && typeof p.metrics === 'object' && (p.metrics as any).impressions)),
    [posts]
  );

  const engagementRates = useMemo(() =>
    analyzedPosts.filter(p => (p.metrics as any)?.engagement_rate != null).map(p => Number((p.metrics as any).engagement_rate)),
    [analyzedPosts]
  );

  const engagementTrend = useMemo(() => {
    if (engagementRates.length < 2) return engagementRates;
    return engagementRates.slice(-10);
  }, [engagementRates]);

  const trendDirection = useMemo(() => {
    if (engagementRates.length < 4) return null;
    const half = Math.floor(engagementRates.length / 2);
    const firstHalf = engagementRates.slice(0, half);
    const secondHalf = engagementRates.slice(half);
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (avgFirst === 0) return null;
    return Math.round(((avgSecond - avgFirst) / avgFirst) * 100);
  }, [engagementRates]);

  const latestSummary = useMemo(() => {
    for (const p of [...analyzedPosts].reverse()) {
      const m = p.metrics as any;
      if (m?.performance_summary) return m.performance_summary;
    }
    return null;
  }, [analyzedPosts]);

  const topPattern = useMemo(() => {
    const patternScores: Record<string, { total: number; count: number }> = {};
    analyzedPosts.forEach(p => {
      const m = p.metrics as any;
      const pattern = m?.content_pattern || p.type;
      if (!pattern) return;
      const score = Number(m?.score || m?.engagement_rate || 0);
      if (!patternScores[pattern]) patternScores[pattern] = { total: 0, count: 0 };
      patternScores[pattern].total += score;
      patternScores[pattern].count += 1;
    });
    let best = '';
    let bestAvg = 0;
    Object.entries(patternScores).forEach(([pattern, { total, count }]) => {
      const avg = total / count;
      if (avg > bestAvg) { bestAvg = avg; best = pattern; }
    });
    return best || null;
  }, [analyzedPosts]);

  if (analyzedPosts.length === 0) return null;

  return (
    <div className="rounded-[24px] bg-card/80 backdrop-blur-xl p-6 shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-[12px] bg-primary/10 p-2.5">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-playfair text-base font-semibold text-foreground">KI-Lernfortschritt</h2>
          <p className="text-xs text-muted-foreground">{analyzedPosts.length} Posts analysiert</p>
        </div>
        {trendDirection !== null && (
          <Badge variant="secondary" className={`ml-auto text-xs rounded-full ${trendDirection >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {trendDirection >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
            {Math.abs(trendDirection)}% Engagement-Trend
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {engagementTrend.length >= 2 && (
          <div className="rounded-[16px] bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-2">Engagement Rate Verlauf</p>
            <div className="h-[60px]">
              <Sparkline data={engagementTrend} color="hsl(160, 60%, 38%)" height={60} width={300} />
            </div>
          </div>
        )}
        <div className="space-y-3">
          {topPattern && (
            <div className="rounded-[16px] bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">Top Content-Pattern</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{topPattern}</p>
            </div>
          )}
          {latestSummary && (
            <div className="rounded-[16px] bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Letzte Analyse</p>
              <p className="text-xs text-foreground mt-0.5 line-clamp-2">{latestSummary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
