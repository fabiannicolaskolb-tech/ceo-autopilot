import React from 'react';
import { Flame, Lock, Zap } from 'lucide-react';
import { useCreatorScore, CREATOR_LEVELS } from '@/hooks/useCreatorScore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/* ── Radial Progress Ring ── */
function RadialProgress({
  percent,
  glowing,
  size = 160,
  strokeWidth = 10,
}: {
  percent: number;
  glowing: boolean;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90" overflow="visible" style={{ overflow: 'visible' }}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted) / 0.4)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#scoreGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
        filter={glowing ? 'url(#glowFilter)' : undefined}
      />
      <defs>
        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--score-deep-blue))" />
          <stop offset="60%" stopColor="hsl(var(--score-electric-purple))" />
          <stop offset="100%" stopColor="hsl(var(--score-gold))" />
        </linearGradient>
        <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

/* ── Skill Stat Bar ── */
function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 min-w-[80px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[11px] font-bold text-foreground">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${value}%`,
            background: 'linear-gradient(90deg, hsl(var(--score-deep-blue)), hsl(var(--score-electric-purple)))',
          }}
        />
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function CreatorScoreCard() {
  const score = useCreatorScore();
  const isStreakActive = score.weekStreak >= 2;

  return (
    <div className="rounded-[24px] bg-card/80 backdrop-blur-xl border border-primary/[0.06] p-6 sm:p-8 shadow-[0_4px_24px_-4px_hsl(263_50%_40%/0.06),0_12px_48px_-8px_hsl(263_50%_40%/0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-[12px] p-2.5 bg-[hsl(var(--score-electric-purple)/0.12)]">
            <Zap className="h-5 w-5 text-[hsl(var(--score-electric-purple))]" />
          </div>
          <div>
            <h2 className="font-playfair text-base font-semibold text-foreground">Creator Score</h2>
            <p className="text-xs text-muted-foreground">Ihr Fortschritt als LinkedIn Creator</p>
          </div>
        </div>

        {/* Streak Badge */}
        {score.weekStreak > 0 && (
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              isStreakActive
                ? 'bg-[hsl(var(--score-gold)/0.15)] text-[hsl(var(--score-gold))]'
                : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            <Flame className={`h-3.5 w-3.5 ${isStreakActive ? 'animate-pulse' : ''}`} />
            {score.weekStreak}W Streak
          </div>
        )}
      </div>

      {/* Identity Card – Radial + XP */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <RadialProgress percent={score.progressPercent} glowing={isStreakActive} />
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <span className="text-3xl font-bold text-foreground tracking-tight">
              {score.totalXP.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              XP
            </span>
          </div>
        </div>

        {/* Level name */}
        <div className="mt-4 text-center">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-2xl">{score.currentLevel.emoji}</span>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: score.currentLevel.color }}
            >
              {score.currentLevel.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{score.currentLevel.description}</p>
          {score.nextLevel && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Noch{' '}
              <span className="font-semibold text-foreground">
                {score.xpToNext.toLocaleString()} XP
              </span>{' '}
              bis Level {score.nextLevel.level}
            </p>
          )}
        </div>
      </div>

      {/* Skill Stats */}
      <div className="flex gap-4 sm:gap-6 mb-8">
        <SkillBar label="Consistency" value={score.stats.consistency} />
        <SkillBar label="Engagement" value={score.stats.engagement} />
        <SkillBar label="Reach" value={score.stats.reach} />
      </div>

      {/* Level Roadmap – Timeline */}
      <TooltipProvider>
        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-5 left-[20px] right-[20px] h-[2px] bg-muted/50 z-0" />
          <div
            className="absolute top-5 left-[20px] h-[2px] z-[1] transition-all duration-700"
            style={{
              width: `${((score.currentLevel.level - 1) / (CREATOR_LEVELS.length - 1)) * 100}%`,
              maxWidth: 'calc(100% - 40px)',
              background:
                'linear-gradient(90deg, hsl(var(--score-deep-blue)), hsl(var(--score-electric-purple)), hsl(var(--score-gold)))',
            }}
          />

          <div className="relative z-10 flex justify-between">
            {CREATOR_LEVELS.map((level) => {
              const isReached = score.currentLevel.level >= level.level;
              const isCurrent = score.currentLevel.level === level.level;
              const isLocked = !isReached;
              const needsStreak = 'streakRequired' in level && level.streakRequired;

              return (
                <Tooltip key={level.level}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1.5 cursor-default">
                      {/* Node */}
                      <div
                        className={`relative h-10 w-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                          isCurrent
                            ? 'scale-110'
                            : ''
                        } ${isLocked ? 'bg-muted/40' : ''}`}
                        style={{
                          background: isReached ? `${level.color}20` : undefined,
                          ...(isCurrent
                            ? ({
                                boxShadow: `0 0 16px ${level.color}40, 0 0 0 3px ${level.color}`,
                              } as React.CSSProperties)
                            : {}),
                        }}
                      >
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground/50" />
                        ) : (
                          <span>{level.emoji}</span>
                        )}
                        {isCurrent && (
                          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: level.color }} />
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className={`text-[10px] font-semibold text-center leading-tight max-w-[56px] ${
                          isReached ? 'text-foreground' : 'text-muted-foreground/50'
                        }`}
                      >
                        {level.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        {level.xpRequired > 0 ? `${level.xpRequired} XP` : 'Start'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="max-w-[180px] text-center"
                  >
                    {isLocked ? (
                      <p className="text-xs">
                        Benötigt Level {level.level}
                        {needsStreak && ` und einen ${level.streakRequired}-Wochen-Streak`}
                      </p>
                    ) : (
                      <p className="text-xs">{level.description}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
