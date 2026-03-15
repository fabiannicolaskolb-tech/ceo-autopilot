import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type TimeRange = '7d' | '30d' | '90d' | 'custom';

interface PostMetrics {
  impressions?: number;
  interactions?: { likes?: number; comments?: number; shares?: number };
  ctr?: number;
  sentiment?: { positive?: number; neutral?: number; negative?: number };
  follower_delta?: number;
}

export interface AnalyticsPost {
  id: string;
  hook: string | null;
  type: string | null;
  content_category: string | null;
  posted_at: string | null;
  metrics: PostMetrics;
}

interface KPI {
  label: string;
  value: string;
  trend: number | null; // percentage change vs previous period
}

interface TimelinePoint {
  date: string;
  impressions: number;
  engagement: number;
}

interface ContentTypePoint {
  type: string;
  impressions: number;
  engagement: number;
  count: number;
}

interface SentimentData {
  name: string;
  value: number;
}

interface BestTimeCell {
  day: number;
  hour: number;
  intensity: number;
}

function getDaysForRange(range: TimeRange, customStart?: Date): number {
  if (range === '7d') return 7;
  if (range === '30d') return 30;
  if (range === '90d') return 90;
  if (range === 'custom' && customStart) {
    return Math.ceil((new Date().getTime() - customStart.getTime()) / (1000 * 60 * 60 * 24));
  }
  return 30;
}

function getRangeStart(range: TimeRange, customStart?: Date): Date {
  if (range === 'custom' && customStart) return customStart;
  const now = new Date();
  const days = getDaysForRange(range);
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function getRangeEnd(range: TimeRange, customEnd?: Date): Date {
  if (range === 'custom' && customEnd) return customEnd;
  return new Date();
}

function getMetrics(raw: unknown): PostMetrics {
  if (!raw || typeof raw !== 'object') return {};
  return raw as PostMetrics;
}

function weightedEngagement(m: PostMetrics): number {
  const i = m.interactions || {};
  return (i.comments || 0) * 3 + (i.shares || 0) * 2 + (i.likes || 0);
}

export function useAnalytics() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<AnalyticsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function fetchPosts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('id, hook, type, content_category, posted_at, metrics')
        .eq('user_id', user!.id)
        .eq('status', 'posted')
        .not('metrics', 'is', null)
        .order('posted_at', { ascending: true });

      if (!error && data) {
        setPosts(data.map(p => ({ ...p, metrics: getMetrics(p.metrics) })));
      }
      setLoading(false);
    }
    fetchPosts();
  }, [user]);

  const filteredPosts = useMemo(() => {
    const start = getRangeStart(timeRange);
    return posts.filter(p => p.posted_at && new Date(p.posted_at) >= start);
  }, [posts, timeRange]);

  const previousPosts = useMemo(() => {
    const days = getDaysForRange(timeRange);
    const rangeStart = getRangeStart(timeRange);
    const prevStart = new Date(rangeStart.getTime() - days * 24 * 60 * 60 * 1000);
    return posts.filter(p => {
      if (!p.posted_at) return false;
      const d = new Date(p.posted_at);
      return d >= prevStart && d < rangeStart;
    });
  }, [posts, timeRange]);

  const kpis = useMemo((): KPI[] => {
    const totalImpressions = filteredPosts.reduce((s, p) => s + (p.metrics.impressions || 0), 0);
    const prevImpressions = previousPosts.reduce((s, p) => s + (p.metrics.impressions || 0), 0);

    const totalWeighted = filteredPosts.reduce((s, p) => s + weightedEngagement(p.metrics), 0);
    const totalImp = totalImpressions || 1;
    const engRate = (totalWeighted / totalImp) * 100;

    const prevWeighted = previousPosts.reduce((s, p) => s + weightedEngagement(p.metrics), 0);
    const prevImp = prevImpressions || 1;
    const prevEngRate = (prevWeighted / prevImp) * 100;

    const followerGrowth = filteredPosts.reduce((s, p) => s + (p.metrics.follower_delta || 0), 0);
    const prevFollowerGrowth = previousPosts.reduce((s, p) => s + (p.metrics.follower_delta || 0), 0);

    const trend = (curr: number, prev: number) => prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);

    return [
      {
        label: 'Total Reach',
        value: totalImpressions >= 1000 ? `${(totalImpressions / 1000).toFixed(1)}K` : String(totalImpressions),
        trend: trend(totalImpressions, prevImpressions),
      },
      {
        label: 'Engagement Authority',
        value: `${engRate.toFixed(1)}%`,
        trend: trend(engRate, prevEngRate),
      },
      {
        label: 'Network Growth',
        value: followerGrowth >= 0 ? `+${followerGrowth}` : String(followerGrowth),
        trend: trend(followerGrowth, prevFollowerGrowth),
      },
    ];
  }, [filteredPosts, previousPosts]);

  const timelineData = useMemo((): TimelinePoint[] => {
    const map = new Map<string, { impressions: number; engagement: number }>();
    filteredPosts.forEach(p => {
      if (!p.posted_at) return;
      const day = p.posted_at.slice(0, 10);
      const existing = map.get(day) || { impressions: 0, engagement: 0 };
      existing.impressions += p.metrics.impressions || 0;
      existing.engagement += weightedEngagement(p.metrics);
      map.set(day, existing);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));
  }, [filteredPosts]);

  const contentTypeData = useMemo((): ContentTypePoint[] => {
    const map = new Map<string, ContentTypePoint>();
    filteredPosts.forEach(p => {
      const type = p.content_category || p.type || 'Sonstige';
      const existing = map.get(type) || { type, impressions: 0, engagement: 0, count: 0 };
      existing.impressions += p.metrics.impressions || 0;
      existing.engagement += weightedEngagement(p.metrics);
      existing.count += 1;
      map.set(type, existing);
    });
    return Array.from(map.values());
  }, [filteredPosts]);

  const sentimentData = useMemo((): SentimentData[] => {
    let positive = 0, neutral = 0, negative = 0;
    filteredPosts.forEach(p => {
      const s = p.metrics.sentiment;
      if (!s) return;
      positive += s.positive || 0;
      neutral += s.neutral || 0;
      negative += s.negative || 0;
    });
    const total = positive + neutral + negative;
    if (total === 0) return [];
    return [
      { name: 'Positiv', value: positive },
      { name: 'Neutral', value: neutral },
      { name: 'Kritisch', value: negative },
    ];
  }, [filteredPosts]);

  const bestTimeData = useMemo((): BestTimeCell[] => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    filteredPosts.forEach(p => {
      if (!p.posted_at) return;
      const d = new Date(p.posted_at);
      const day = d.getDay();
      const hour = d.getHours();
      grid[day][hour] += weightedEngagement(p.metrics);
    });
    const max = Math.max(1, ...grid.flat());
    const cells: BestTimeCell[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        cells.push({ day, hour, intensity: grid[day][hour] / max });
      }
    }
    return cells;
  }, [filteredPosts]);

  const hasData = filteredPosts.length > 0;

  return {
    posts: filteredPosts,
    kpis,
    timelineData,
    contentTypeData,
    sentimentData,
    bestTimeData,
    loading,
    hasData,
    timeRange,
    setTimeRange,
  };
}
