import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Sun, Play, Pause, Volume2, CheckCircle2, Lightbulb, AudioLines, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const GLASS_CARD = 'rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]';

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface BriefingMetrics {
  impressions: number;
  likes: number;
  comments: number;
  engagementRate: number;
}

interface GeneratedBriefingData {
  whatWorked: string[];
  recommendedFollowUps: string[];
  performanceSummary: string | null;
}

export default function DailyBriefing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedBriefingData | null>(null);
  const [generatedMetrics, setGeneratedMetrics] = useState<BriefingMetrics | null>(null);

  // Fetch posts & audio — no strict time filter, load newest analyzed posts
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);

      const [postsResult, filesResult] = await Promise.all([
        supabase
          .from('posts')
          .select('*')
          .eq('status', 'analyzed')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10),
        supabase.storage
          .from('briefings')
          .list(user.id, { limit: 1, sortBy: { column: 'created_at', order: 'desc' } }),
      ]);

      if (postsResult.data) setPosts(postsResult.data);

      if (filesResult.data && filesResult.data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('briefings')
          .getPublicUrl(`${user.id}/${filesResult.data[0].name}`);
        if (urlData?.publicUrl) setAudioUrl(urlData.publicUrl);
      }

      setLoading(false);
    };

    fetchData();

    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user?.id]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  }, [duration]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-briefing');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
      }
      if (data?.metrics) {
        setGeneratedMetrics({
          impressions: data.metrics.impressions || 0,
          likes: data.metrics.likes || 0,
          comments: data.metrics.comments || 0,
          engagementRate: data.metrics.engagementRate || 0,
        });
        setGeneratedData({
          whatWorked: data.metrics.whatWorked || [],
          recommendedFollowUps: data.metrics.recommendedFollowUps || [],
          performanceSummary: data.metrics.performanceSummary || null,
        });
      }
      toast({ title: 'Briefing erstellt', description: 'Ihr Audio-Briefing ist bereit.' });
    } catch (err: any) {
      console.error('Briefing generation error:', err);
      toast({ title: 'Fehler', description: err?.message || 'Briefing konnte nicht generiert werden.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  }, [toast]);

  // Aggregate metrics from posts or use generated metrics
  const metrics = useMemo<BriefingMetrics>(() => {
    if (generatedMetrics) return generatedMetrics;
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
  }, [posts, generatedMetrics]);

  // Best post by score
  const bestPost = useMemo(() => {
    if (posts.length === 0) return null;
    return posts.reduce((best, p) => {
      const score = Number((p.metrics as any)?.score || 0);
      const bestScore = Number((best.metrics as any)?.score || 0);
      return score > bestScore ? p : best;
    }, posts[0]);
  }, [posts]);

  const bestMetrics = bestPost?.metrics as any;

  // Use generated data if available, otherwise fall back to bestPost metrics
  const displayWhatWorked = generatedData?.whatWorked?.length ? generatedData.whatWorked : bestMetrics?.what_worked || [];
  const displayFollowUps = generatedData?.recommendedFollowUps?.length ? generatedData.recommendedFollowUps : bestMetrics?.recommended_follow_ups || [];
  const displaySummary = generatedData?.performanceSummary || bestMetrics?.performance_summary || null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const GenerateButton = () => (
    <Button
      size="sm"
      onClick={handleGenerate}
      disabled={generating}
      className="shrink-0 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0"
    >
      {generating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
      {generating ? 'Generiere...' : 'Generieren'}
    </Button>
  );

  // Empty state — still show generate option
  if (!loading && posts.length === 0 && !audioUrl && !generatedMetrics) {
    return (
      <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted/60 p-5 mb-4">
            <AudioLines className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="font-playfair text-lg font-semibold text-foreground">Noch kein Briefing verfügbar</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Sobald dein erster Post analysiert wurde, erscheint hier dein tägliches Morgen-Briefing mit Performance-Daten und KI-Empfehlungen.
          </p>
          {user && (
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4"
              variant="outline"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
              {generating ? 'Generiere Briefing...' : 'Briefing jetzt generieren'}
            </Button>
          )}
        </div>
      </div>
    );
  }

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

      {/* Audio Player */}
      <div className="rounded-2xl bg-[hsl(var(--primary))] p-4 sm:p-5">
        {audioUrl ? (
          <>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground transition-colors hover:bg-primary-foreground/30"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1.5">
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="group relative h-1.5 cursor-pointer rounded-full bg-primary-foreground/20"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary-foreground transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-primary-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${progressPercent}% - 7px)` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-primary-foreground/60">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <Volume2 className="h-4 w-4 shrink-0 text-primary-foreground/50" />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-primary-foreground/70">
              <AudioLines className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium text-primary-foreground">Kein Audio-Briefing vorhanden</p>
                <p className="text-xs text-primary-foreground/60 mt-0.5">Generieren Sie jetzt Ihr Morgen-Briefing.</p>
              </div>
            </div>
            <GenerateButton />
          </div>
        )}
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
