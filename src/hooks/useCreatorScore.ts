import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// XP rewards
const XP_PER_POST = 25;
const XP_PER_STREAK_WEEK = 80;
const XP_ENGAGEMENT_MULTIPLIER = 0.5; // per weighted engagement point

// Levels with XP thresholds
export const CREATOR_LEVELS = [
  { level: 1, name: 'Beobachter', emoji: '👀', xpRequired: 0, color: 'hsl(var(--muted-foreground))', description: 'Willkommen! Veröffentlichen Sie Ihren ersten Post.' },
  { level: 2, name: 'Einsteiger', emoji: '🌱', xpRequired: 150, color: 'hsl(var(--success))', description: 'Ihre Reise als Creator beginnt.' },
  { level: 3, name: 'Creator', emoji: '✍️', xpRequired: 500, color: 'hsl(var(--score-deep-blue))', description: 'Sie bauen echte Präsenz auf.' },
  { level: 4, name: 'Influencer', emoji: '🔥', xpRequired: 1200, color: 'hsl(var(--score-electric-purple))', description: 'Ihr Content bewegt Menschen.', streakRequired: 4 },
  { level: 5, name: 'Thought Leader', emoji: '👑', xpRequired: 2500, color: 'hsl(var(--score-gold))', description: 'Sie gehören zur LinkedIn-Elite.', streakRequired: 8 },
] as const;

export type CreatorLevel = (typeof CREATOR_LEVELS)[number];

function weightedEngagement(metrics: any): number {
  return (metrics?.comments || 0) * 3 + (metrics?.shares || 0) * 2 + (metrics?.likes || 0);
}

function calculateWeekStreak(postedDates: Date[]): number {
  if (postedDates.length === 0) return 0;

  const now = new Date();
  const getWeekNumber = (d: Date) => {
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.floor((d.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  };

  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();

  // Get unique weeks with posts
  const weeksWithPosts = new Set(
    postedDates.map((d) => `${d.getFullYear()}-${getWeekNumber(d)}`)
  );

  // Count consecutive weeks going backwards from current
  let streak = 0;
  for (let i = 0; i < 52; i++) {
    const weekNum = currentWeek - i;
    const year = weekNum < 0 ? currentYear - 1 : currentYear;
    const adjustedWeek = weekNum < 0 ? 52 + weekNum : weekNum;
    const key = `${year}-${adjustedWeek}`;

    if (weeksWithPosts.has(key)) {
      streak++;
    } else if (i === 0) {
      // Current week might not have a post yet — skip
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function useCreatorScore() {
  const { user } = useAuth();

  const { data: posts = [] } = useQuery({
    queryKey: ['posts', 'all-for-score', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, posted_at, metrics, status')
        .eq('user_id', user!.id)
        .in('status', ['posted', 'analyzed']);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return useMemo(() => {
    const postedDates = posts
      .filter((p) => p.posted_at)
      .map((p) => new Date(p.posted_at!));

    const weekStreak = calculateWeekStreak(postedDates);

    // Calculate XP
    const postXP = posts.length * XP_PER_POST;
    const streakXP = weekStreak * XP_PER_STREAK_WEEK;
    const engagementXP = Math.round(
      posts.reduce((sum, p) => sum + weightedEngagement(p.metrics), 0) * XP_ENGAGEMENT_MULTIPLIER
    );
    const totalXP = postXP + streakXP + engagementXP;

    // Determine level
    const currentLevel =
      [...CREATOR_LEVELS].reverse().find((l) => totalXP >= l.xpRequired) || CREATOR_LEVELS[0];
    const nextLevel = CREATOR_LEVELS.find((l) => l.level === currentLevel.level + 1) || null;

    const xpInLevel = totalXP - currentLevel.xpRequired;
    const xpForNextLevel = nextLevel ? nextLevel.xpRequired - currentLevel.xpRequired : 1;
    const progressPercent = nextLevel
      ? Math.min(100, Math.max(0, (xpInLevel / xpForNextLevel) * 100))
      : 100;

    // Skill stats (0-100)
    const maxPossibleEngagement = Math.max(1, posts.length * 50);
    const consistencyScore = Math.min(100, weekStreak * 15);
    const engagementScore = Math.min(
      100,
      Math.round(
        (posts.reduce((s, p) => s + weightedEngagement(p.metrics), 0) / maxPossibleEngagement) * 100
      )
    );
    const reachScore = Math.min(
      100,
      Math.round(
        posts.reduce((s, p) => {
          const m = p.metrics as any;
          return s + (m?.impressions || 0);
        }, 0) / Math.max(1, posts.length * 100) * 100
      )
    );

    return {
      totalXP,
      postXP,
      streakXP,
      engagementXP,
      weekStreak,
      currentLevel,
      nextLevel,
      progressPercent,
      xpToNext: nextLevel ? nextLevel.xpRequired - totalXP : 0,
      stats: {
        consistency: consistencyScore,
        engagement: engagementScore,
        reach: reachScore,
      },
    };
  }, [posts]);
}
