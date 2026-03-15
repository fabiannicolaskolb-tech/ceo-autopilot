import React, { useState, useMemo, useCallback } from 'react';
import {
  Eye, TrendingUp, TrendingDown, Users, ArrowUpRight, ArrowDownRight,
  BarChart3, Clock, MessageCircle, Heart, Share2, Lightbulb, Minus, Rocket,
  Upload, Image as ImageIcon, Save, Brain, Zap, ArrowRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/useRealtime';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAnalytics, type TimeRange, type AnalyticsPost } from '@/hooks/useAnalytics';
import { MeshBackground } from '@/components/MeshBackground';
import { cn } from '@/lib/utils';

const GLASS_CARD = 'rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]';
const GLASS_CARD_HOVER = `${GLASS_CARD} transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)]`;

const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

// ──── Empty State ────
function EmptyState() {
  return (
    <div className={cn(GLASS_CARD, 'p-8')}>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted/60 p-4 mb-3">
          <Rocket className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h2 className="font-playfair text-xl font-semibold text-foreground mb-2">
          Sammle erste Daten…
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Ihr erstes Performance-Update erscheint nach dem ersten Post.
          Veröffentlichen Sie Ihren ersten Beitrag, um detaillierte Analysen freizuschalten.
        </p>
      </div>
    </div>
  );
}

// ──── KPI Card ────
function KPICard({ label, value, trend, icon: Icon }: {
  label: string; value: string; trend: number | null;
  icon: React.ElementType;
}) {
  const isPositive = trend !== null && trend >= 0;
  return (
    <div className={cn(GLASS_CARD_HOVER, 'p-5')}>
      <div className="flex items-center justify-between">
        <div className="rounded-[12px] bg-primary/8 p-2.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        {trend !== null && (
          <Badge
            variant="secondary"
            className={`text-xs rounded-full ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
          >
            {isPositive ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
            {Math.abs(trend)}%
          </Badge>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ──── Heatmap ────
function BestTimeHeatmap({ data }: { data: { day: number; hour: number; intensity: number }[] }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-px" style={{ gridTemplateColumns: `48px repeat(24, minmax(28px, 1fr))` }}>
        {/* Header row */}
        <div />
        {hours.map(h => (
          <div key={h} className="text-center text-[10px] text-muted-foreground pb-1">
            {h}
          </div>
        ))}
        {/* Data rows */}
        {[1, 2, 3, 4, 5, 6, 0].map(day => (
          <React.Fragment key={day}>
            <div className="text-xs text-muted-foreground flex items-center pr-2 font-medium">
              {DAYS[day]}
            </div>
            {hours.map(hour => {
              const cell = data.find(c => c.day === day && c.hour === hour);
              const intensity = cell?.intensity || 0;
              return (
                <div
                  key={hour}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: `hsl(var(--primary) / ${Math.max(0.05, intensity)})`,
                  }}
                  title={`${DAYS[day]} ${hour}:00 — Intensität: ${Math.round(intensity * 100)}%`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ──── Post Compare ────
interface CompareMetric {
  label: string;
  icon: React.ElementType;
  getValue: (p: AnalyticsPost) => number;
}

const COMPARE_METRICS: CompareMetric[] = [
  { label: 'Impressions', icon: Eye, getValue: (p) => p.metrics.impressions || 0 },
  { label: 'Likes', icon: Heart, getValue: (p) => p.metrics.interactions?.likes || 0 },
  { label: 'Kommentare', icon: MessageCircle, getValue: (p) => p.metrics.interactions?.comments || 0 },
  { label: 'Shares', icon: Share2, getValue: (p) => p.metrics.interactions?.shares || 0 },
  { label: 'CTR', icon: TrendingUp, getValue: (p) => p.metrics.ctr || 0 },
];

function PostCompare({ posts }: { posts: AnalyticsPost[] }) {
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const postA = posts.find(p => p.id === idA);
  const postB = posts.find(p => p.id === idB);

  const bothSelected = postA && postB;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <Select value={idA} onValueChange={setIdA}>
            <SelectTrigger><SelectValue placeholder="Post A auswählen" /></SelectTrigger>
            <SelectContent>
              {posts.map(p => (
                <SelectItem key={p.id} value={p.id}>{(p.hook || p.id).slice(0, 50)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="rounded-[16px] bg-card/60 backdrop-blur-sm p-4">
            {postA ? (
              <p className="font-playfair font-semibold text-foreground text-sm line-clamp-2">{postA.hook || '—'}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Post auswählen</p>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <Select value={idB} onValueChange={setIdB}>
            <SelectTrigger><SelectValue placeholder="Post B auswählen" /></SelectTrigger>
            <SelectContent>
              {posts.map(p => (
                <SelectItem key={p.id} value={p.id}>{(p.hook || p.id).slice(0, 50)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="rounded-[16px] bg-card/60 backdrop-blur-sm p-4">
            {postB ? (
              <p className="font-playfair font-semibold text-foreground text-sm line-clamp-2">{postB.hook || '—'}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Post auswählen</p>
            )}
          </div>
        </div>
      </div>

      {/* Comparison breakdown */}
      {bothSelected && (
        <div className="space-y-2">
          {COMPARE_METRICS.map((metric) => {
            const valA = metric.getValue(postA);
            const valB = metric.getValue(postB);
            const maxVal = Math.max(valA, valB, 1);
            const diff = maxVal > 0 ? Math.abs(valA - valB) / maxVal : 0;
            const isSignificant = diff >= 0.3; // ≥30% difference
            const winner = valA > valB ? 'A' : valB > valA ? 'B' : null;
            const Icon = metric.icon;
            const isCtr = metric.label === 'CTR';
            const formatVal = (v: number) => isCtr ? `${v}%` : v.toLocaleString();

            return (
              <div
                key={metric.label}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 transition-all',
                  isSignificant
                    ? 'bg-primary/[0.06] ring-1 ring-primary/20'
                    : 'bg-card/40'
                )}
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-24 shrink-0">{metric.label}</span>

                {/* Value A */}
                <span className={cn(
                  'text-sm font-semibold w-16 text-right shrink-0',
                  isSignificant && winner === 'A' ? 'text-success' : 'text-foreground'
                )}>
                  {formatVal(valA)}
                </span>

                {/* Bar comparison */}
                <div className="flex-1 flex items-center gap-1 min-w-0">
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden flex justify-end">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isSignificant && winner === 'A'
                          ? 'bg-success'
                          : 'bg-primary/40'
                      )}
                      style={{ width: `${maxVal > 0 ? (valA / maxVal) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-px h-4 bg-border shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isSignificant && winner === 'B'
                          ? 'bg-success'
                          : 'bg-primary/40'
                      )}
                      style={{ width: `${maxVal > 0 ? (valB / maxVal) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Value B */}
                <span className={cn(
                  'text-sm font-semibold w-16 shrink-0',
                  isSignificant && winner === 'B' ? 'text-success' : 'text-foreground'
                )}>
                  {formatVal(valB)}
                </span>

                {/* Difference badge */}
                {isSignificant && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 shrink-0 rounded-full bg-success/15 text-success border-0 font-bold">
                    {winner === 'A' ? '←' : '→'} +{Math.round(diff * 100)}%
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──── Top Posts Table ────
function TopPostsTable({ posts }: { posts: AnalyticsPost[] }) {
  const [sortKey, setSortKey] = useState<'impressions' | 'ctr' | 'comments' | 'engagement'>('impressions');

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      const ma = a.metrics, mb = b.metrics;
      const ia = ma.interactions || {}, ib = mb.interactions || {};
      switch (sortKey) {
        case 'impressions': return (mb.impressions || 0) - (ma.impressions || 0);
        case 'ctr': return (mb.ctr || 0) - (ma.ctr || 0);
        case 'comments': return (ib.comments || 0) - (ia.comments || 0);
        case 'engagement': {
          const eA = ma.impressions ? ((ia.comments || 0) * 3 + (ia.shares || 0) * 2 + (ia.likes || 0)) / ma.impressions * 100 : 0;
          const eB = mb.impressions ? ((ib.comments || 0) * 3 + (ib.shares || 0) * 2 + (ib.likes || 0)) / mb.impressions * 100 : 0;
          return eB - eA;
        }
        default: return 0;
      }
    }).slice(0, 10);
  }, [posts, sortKey]);

  const headerClass = "cursor-pointer hover:text-foreground transition-colors";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hook</TableHead>
          <TableHead>Datum</TableHead>
          <TableHead className={headerClass} onClick={() => setSortKey('impressions')}>
            Impressions {sortKey === 'impressions' && '↓'}
          </TableHead>
          <TableHead className={headerClass} onClick={() => setSortKey('ctr')}>
            CTR {sortKey === 'ctr' && '↓'}
          </TableHead>
          <TableHead className={headerClass} onClick={() => setSortKey('comments')}>
            Kommentare {sortKey === 'comments' && '↓'}
          </TableHead>
          <TableHead className={headerClass} onClick={() => setSortKey('engagement')}>
            Engagement {sortKey === 'engagement' && '↓'}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map(p => {
          const i = p.metrics.interactions || {};
          const eng = p.metrics.impressions
            ? (((i.comments || 0) * 3 + (i.shares || 0) * 2 + (i.likes || 0)) / p.metrics.impressions * 100).toFixed(1)
            : '0.0';
          return (
            <TableRow key={p.id}>
              <TableCell className="font-playfair text-sm font-medium max-w-[200px] truncate">
                {p.hook || '—'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {p.posted_at ? new Date(p.posted_at).toLocaleDateString('de-DE') : '—'}
              </TableCell>
              <TableCell>{(p.metrics.impressions || 0).toLocaleString()}</TableCell>
              <TableCell>{p.metrics.ctr != null ? `${p.metrics.ctr}%` : '—'}</TableCell>
              <TableCell>{i.comments || 0}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-success/10 text-success text-xs">{eng}%</Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ──── SENTIMENT COLORS ────
const SENTIMENT_COLORS = [
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
];

// ──── Main Page ────
export default function AnalyticsPage() {
  const {
    posts, kpis, timelineData, contentTypeData, sentimentData,
    bestTimeData, loading, hasData, timeRange, setTimeRange,
  } = useAnalytics();

  const kpiIcons = [Eye, TrendingUp, Users];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <MeshBackground />

      {/* Header */}
      <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Performance-Übersicht Ihres LinkedIn-Auftritts</p>
          </div>
          <Tabs value={timeRange} onValueChange={v => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="7d">7T</TabsTrigger>
              <TabsTrigger value="30d">30T</TabsTrigger>
              <TabsTrigger value="90d">90T</TabsTrigger>
              <TabsTrigger value="ytd">YTD</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-5 sm:grid-cols-3">
            {kpis.map((k, i) => (
              <KPICard key={k.label} {...k} icon={kpiIcons[i]} />
            ))}
          </div>

          {/* Performance Timeline */}
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4">Performance Timeline</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => new Date(v).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} labelFormatter={v => new Date(v).toLocaleDateString('de-DE')} />
                <Area yAxisId="left" type="monotone" dataKey="impressions" name="Impressions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="engagement" name="Engagement" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--success))' }} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Content Type + Sentiment */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className={cn(GLASS_CARD, 'p-6')}>
              <h2 className="font-playfair text-base font-semibold text-foreground mb-4">Content Type Efficiency</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contentTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="impressions" name="Impressions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="engagement" name="Engagement" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={cn(GLASS_CARD, 'p-6')}>
              <h2 className="font-playfair text-base font-semibold text-foreground mb-4">Sentiment Analyse</h2>
              <div className="flex items-center justify-center">
                {sentimentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                        {sentimentData.map((_, idx) => (
                          <Cell key={idx} fill={SENTIMENT_COLORS[idx]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-12">Keine Sentiment-Daten vorhanden</p>
                )}
              </div>
            </div>
          </div>

          {/* Best Time to Post */}
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Beste Posting-Zeiten
            </h2>
            <BestTimeHeatmap data={bestTimeData} />
          </div>

          {/* Top Posts Table */}
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4">Top Performing Posts</h2>
            <TopPostsTable posts={posts} />
          </div>

          {/* Post Compare */}
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Minus className="h-4 w-4 rotate-90" /> Post-Vergleich
            </h2>
            <PostCompare posts={posts} />
          </div>

          {/* AI Insights */}
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> KI-Optimierungsvorschläge
            </h2>
            <div className="space-y-3">
              {[
                'Story-Posts erzielen 2.3× mehr Engagement als reine Tipps-Posts.',
                'Ihre beste Posting-Zeit ist Dienstag zwischen 8:00 und 10:00 Uhr.',
                'Posts mit einer provokanten Frage als Hook erhalten 45% mehr Kommentare.',
                'Ihre Beiträge über Unternehmenskultur erhalten 40% mehr Shares von Entscheidern.',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[12px] bg-muted/40 backdrop-blur-sm p-3">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
