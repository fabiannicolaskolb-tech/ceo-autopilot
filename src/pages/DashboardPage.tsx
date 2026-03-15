import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, TrendingUp, CalendarDays, Rocket, Loader2, Brain, ArrowUpRight, ArrowDownRight, Lightbulb, GalleryHorizontalEnd, BarChart3, ChevronDown } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { usePosts, usePipelineStatus } from '@/hooks/useRealtime';
import { Badge } from '@/components/ui/badge';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sparkline } from '@/components/Sparkline';
import { MeshBackground } from '@/components/MeshBackground';
import CreatorScoreCard from '@/components/CreatorScoreCard';
import { useCreatorScore } from '@/hooks/useCreatorScore';
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
  const score = useCreatorScore();
  const [showScore, setShowScore] = useState(false);
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

      {/* Welcome Hero - Liquid Glass */}
      <div className="relative rounded-[24px] bg-card/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.15)] overflow-hidden">
        {/* Liquid glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/10 dark:via-transparent dark:to-white/5 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent" />

        <div className="relative z-10 p-6 sm:p-8">
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

              {/* Level Badge */}
              <button
                onClick={() => setShowScore(!showScore)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-transparent hover:border-primary/20"
                style={{
                  backgroundColor: `color-mix(in srgb, ${score.currentLevel.color} 12%, transparent)`,
                  color: score.currentLevel.color,
                }}
              >
                <span className="text-base">{score.currentLevel.emoji}</span>
                <span className="hidden sm:inline">{score.currentLevel.name}</span>
                <span className="font-bold">{score.totalXP} XP</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${showScore ? 'rotate-180' : ''}`} />
              </button>

              <InteractiveHoverButton onClick={() => navigate('/profile')}>
                Profil bearbeiten
              </InteractiveHoverButton>
            </div>
          </div>
        </div>

        {/* Expandable Creator Score */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${showScore ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="border-t border-white/20 dark:border-white/10 p-6 sm:p-8 pt-6">
            <CreatorScoreCard />
          </div>
        </div>
      </div>


      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: 'Ideation Lab',
            desc: 'KI-gestützte Ideen generieren und verfeinern',
            icon: Lightbulb,
            url: '/ideation',
            color: 'hsl(var(--warning))',
            preview: `${draftCount > 0 ? `${draftCount} Entwürfe bereit` : 'Starte deine erste Idee'}`,
            cta: 'Ideen entdecken',
          },
          {
            title: 'Post Library',
            desc: 'Alle Beiträge verwalten, planen und veröffentlichen',
            icon: GalleryHorizontalEnd,
            url: '/post-library',
            color: 'hsl(var(--success))',
            preview: `${postCount} veröffentlicht · ${draftCount} Entwürfe`,
            cta: 'Library öffnen',
          },
          {
            title: 'Analytics',
            desc: 'Performance analysieren und Wachstum tracken',
            icon: BarChart3,
            url: '/analytics',
            color: 'hsl(var(--primary))',
            preview: postCount > 0 ? `${postCount} Posts ausgewertet` : 'Noch keine Daten',
            cta: 'Insights ansehen',
          },
        ].map(item => (
          <Link
            key={item.url}
            to={item.url}
            className="group relative rounded-[20px] bg-card/60 backdrop-blur-2xl p-6 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.12)] transition-all duration-500 hover:shadow-[0_16px_48px_-12px_hsl(var(--primary)/0.25)] hover:-translate-y-1 overflow-hidden"
          >
            {/* Liquid glass overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/10 dark:via-transparent dark:to-white/5 pointer-events-none rounded-[20px]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent rounded-t-[20px]" />
            
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[20px] opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, ${item.color}, color-mix(in srgb, ${item.color} 40%, transparent))` }} />

            <div className="flex items-start gap-4">
              <div className="rounded-2xl p-3 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg" style={{ backgroundColor: `color-mix(in srgb, ${item.color} 12%, transparent)` }}>
                <item.icon className="h-6 w-6" style={{ color: item.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>

            {/* Preview info - Liquid Glass */}
            <div className="relative mt-4 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-sm px-3.5 py-2.5 border border-white/20 dark:border-white/10">
              <p className="text-xs font-medium text-foreground/70">{item.preview}</p>
            </div>

            {/* CTA */}
            <div className="relative mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold transition-colors duration-300 group-hover:translate-x-1" style={{ color: item.color }}>
                {item.cta}
              </span>
              <div className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-white/30 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/10">
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: item.color }} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats - Liquid Glass Cards */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {/* Drafts */}
        <div className="relative rounded-[24px] bg-card/60 backdrop-blur-2xl p-6 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.12)] overflow-hidden group">
          {/* Liquid glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/10 dark:via-transparent dark:to-white/5 pointer-events-none rounded-[24px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent rounded-t-[24px]" />
          <div className="relative z-10">
            <div className="rounded-[12px] p-2.5 bg-white/30 dark:bg-white/10 backdrop-blur-sm w-fit">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          <p className="text-3xl font-bold text-foreground tracking-tight mt-4">{draftCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Entwürfe</p>
          </div>
        </div>

        {/* Published */}
        <div className="relative rounded-[24px] bg-card/60 backdrop-blur-2xl p-6 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.12)] overflow-hidden group">
          {/* Liquid glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/10 dark:via-transparent dark:to-white/5 pointer-events-none rounded-[24px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent rounded-t-[24px]" />
          <div className="relative z-10">
            <div className="rounded-[12px] bg-success/20 p-2.5 backdrop-blur-sm w-fit">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight mt-4">{postCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Veröffentlicht</p>
          </div>
        </div>

        {/* Next Scheduled - spans 2 cols on lg */}
        <div className="relative sm:col-span-2 rounded-[24px] bg-card/60 backdrop-blur-2xl p-6 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.12)] overflow-hidden transition-all duration-300 hover:shadow-[0_16px_48px_-12px_hsl(var(--primary)/0.2)]">
          {/* Liquid glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/10 dark:via-transparent dark:to-white/5 pointer-events-none rounded-[24px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent rounded-t-[24px]" />
          <div className="relative z-10">
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
      </div>

      {/* Creator Score moved to welcome hero expand */}

      {/* AI Learning Progress - Liquid Glass */}
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
    <div className="relative rounded-[24px] bg-card/60 backdrop-blur-2xl p-6 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.12)] overflow-hidden">
      {/* Liquid glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/10 dark:via-transparent dark:to-white/5 pointer-events-none rounded-[24px]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 dark:via-white/30 to-transparent rounded-t-[24px]" />
      <div className="relative z-10 flex items-center gap-3 mb-4">
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

      <div className="relative z-10 grid gap-4 sm:grid-cols-2">
        {engagementTrend.length >= 2 && (
          <div className="rounded-[16px] bg-white/30 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/5 p-4">
            <p className="text-xs text-muted-foreground mb-2">Engagement Rate Verlauf</p>
            <div className="h-[60px]">
              <Sparkline data={engagementTrend} color="hsl(160, 60%, 38%)" height={60} width={300} />
            </div>
          </div>
        )}
        <div className="relative z-10 space-y-3">
          {topPattern && (
            <div className="rounded-[16px] bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/5 p-3">
              <p className="text-xs text-muted-foreground">Top Content-Pattern</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{topPattern}</p>
            </div>
          )}
          {latestSummary && (
            <div className="rounded-[16px] bg-white/30 dark:bg-white/10 backdrop-blur-sm border border-white/20 dark:border-white/5 p-3">
              <p className="text-xs text-muted-foreground">Letzte Analyse</p>
              <p className="text-xs text-foreground mt-0.5 line-clamp-2">{latestSummary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
