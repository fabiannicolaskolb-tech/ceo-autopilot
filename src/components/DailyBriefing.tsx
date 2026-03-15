import React, { useState, useEffect, useMemo } from 'react';
import { Sun, CheckCircle2, Lightbulb, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const GLASS_CARD = 'rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]';

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

interface BriefingMetrics {
  impressions: number;
  likes: number;
  comments: number;
  engagementRate: number;
}

export default function DailyBriefing() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'analyzed')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (data) setPosts(data);
      setLoading(false);
    };

    fetchData();

    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user?.id]);

  const metrics = useMemo<BriefingMetrics>(() => {
    let impressions = 0, likes = 0, comments = 0, engTotal = 0, engCount = 0;
    posts.forEach(p => {
      const m = p.metrics as any;
      if (!m) return;
      impressions += Number(m.impressions || 0);
      likes += Number(m.likes || 0);
      comments += Number(m.comments || 0);
      if (m.engagement_rate != null) {
        engTotal += Number(m.engagement_rate);
        engCount++;
      }
    });
    return {
      impressions,
      likes,
      comments,
      engagementRate: engCount > 0 ? Math.round((engTotal / engCount) * 10) / 10 : 0,
    };
  }, [posts]);

  const bestPost = useMemo(() => {
    if (posts.length === 0) return null;
    return posts.reduce((best, p) => {
      const score = Number((p.metrics as any)?.score || 0);
      const bestScore = Number((best.metrics as any)?.score || 0);
      return score > bestScore ? p : best;
    }, posts[0]);
  }, [posts]);

  const bestMetrics = bestPost?.metrics as any;
  const displayWhatWorked: string[] = bestMetrics?.what_worked || [];
  const displayFollowUps: string[] = bestMetrics?.recommended_follow_ups || [];
  const displaySummary: string | null = bestMetrics?.performance_summary || null;

  if (loading) {
    return (
      <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted/60 p-5 mb-4">
            <Sun className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="font-playfair text-lg font-semibold text-foreground">Noch kein Briefing verfügbar</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Sobald dein erster Post analysiert wurde, erscheint hier dein tägliches Morgen-Briefing mit Performance-Daten und KI-Empfehlungen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(GLASS_CARD, 'p-6 sm:p-8 space-y-6')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sun className="h-5 w-5 text-warning" />
          <h2 className="font-playfair text-lg font-semibold text-foreground">Dein Morgen-Briefing</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {format(new Date(), "'Heute,' d. MMMM", { locale: de })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { value: formatNumber(metrics.impressions), label: 'Impressions' },
          { value: formatNumber(metrics.likes), label: 'Likes' },
          { value: formatNumber(metrics.comments), label: 'Comments' },
          { value: `${metrics.engagementRate}%`, label: 'Eng. Rate' },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl bg-muted/40 p-4 text-center">
            <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      {displaySummary && (
        <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/30 pl-4">
          "{displaySummary}"
        </p>
      )}

      {/* What Worked */}
      {displayWhatWorked.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Was funktioniert hat
          </h3>
          <ul className="space-y-1.5 pl-6">
            {displayWhatWorked.map((item: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground list-disc">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Follow-ups */}
      {displayFollowUps.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Lightbulb className="h-4 w-4 text-warning" />
            Nächste Post-Ideen
          </h3>
          <ul className="space-y-1.5 pl-6">
            {displayFollowUps.map((item: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground list-disc">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
