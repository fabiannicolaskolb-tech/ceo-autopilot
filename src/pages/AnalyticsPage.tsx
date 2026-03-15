import React, { useState, useMemo, useCallback } from 'react';
import {
  Eye, TrendingUp, TrendingDown, Users, ArrowUpRight, ArrowDownRight,
  BarChart3, Clock, MessageCircle, Heart, Share2, Lightbulb, Minus, Rocket,
  Upload, Image as ImageIcon, Save, Brain, Zap, ArrowRight, CalendarIcon,
  RefreshCw, Linkedin,
} from 'lucide-react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAnalytics, type TimeRange, type AnalyticsPost } from '@/hooks/useAnalytics';
import { MeshBackground } from '@/components/MeshBackground';
import { cn } from '@/lib/utils';

const GLASS_CARD = 'rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]';
const GLASS_CARD_HOVER = `${GLASS_CARD} transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)]`;

// ──── Empty State ────
function EmptyState() {
  const { t } = useLang();
  return (
    <div className={cn(GLASS_CARD, 'p-8')}>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted/60 p-4 mb-3">
          <Rocket className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h2 className="font-playfair text-xl font-semibold text-foreground mb-2">
          {t('analytics.empty_title')}
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {t('analytics.empty_desc')}
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
  const { t } = useLang();
  const DAYS_MAP: Record<number, string> = {
    0: t('weekday.so'), 1: t('weekday.mo'), 2: t('weekday.di'), 3: t('weekday.mi'),
    4: t('weekday.do'), 5: t('weekday.fr'), 6: t('weekday.sa'),
  };
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-px" style={{ gridTemplateColumns: `48px repeat(24, minmax(28px, 1fr))` }}>
        <div />
        {hours.map(h => (
          <div key={h} className="text-center text-[10px] text-muted-foreground pb-1">
            {h}
          </div>
        ))}
        {[1, 2, 3, 4, 5, 6, 0].map(day => (
          <React.Fragment key={day}>
            <div className="text-xs text-muted-foreground flex items-center pr-2 font-medium">
              {DAYS_MAP[day]}
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
                  title={`${DAYS_MAP[day]} ${hour}:00 — ${Math.round(intensity * 100)}%`}
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

function PostCompare({ posts }: { posts: AnalyticsPost[] }) {
  const { t } = useLang();
  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');
  const postA = posts.find(p => p.id === idA);
  const postB = posts.find(p => p.id === idB);
  const bothSelected = postA && postB;

  const COMPARE_METRICS: CompareMetric[] = [
    { label: 'Impressions', icon: Eye, getValue: (p) => p.metrics.impressions || 0 },
    { label: 'Likes', icon: Heart, getValue: (p) => p.metrics.likes || 0 },
    { label: t('analytics.comments'), icon: MessageCircle, getValue: (p) => p.metrics.comments || 0 },
    { label: 'Shares', icon: Share2, getValue: (p) => p.metrics.shares || 0 },
    { label: 'CTR', icon: TrendingUp, getValue: (p) => p.metrics.ctr || 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <Select value={idA} onValueChange={setIdA}>
            <SelectTrigger><SelectValue placeholder={t('analytics.post_a')} /></SelectTrigger>
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
              <p className="text-sm text-muted-foreground">{t('analytics.select_post_label')}</p>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <Select value={idB} onValueChange={setIdB}>
            <SelectTrigger><SelectValue placeholder={t('analytics.post_b')} /></SelectTrigger>
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
              <p className="text-sm text-muted-foreground">{t('analytics.select_post_label')}</p>
            )}
          </div>
        </div>
      </div>

      {bothSelected && (
        <div className="space-y-2">
          {COMPARE_METRICS.map((metric) => {
            const valA = metric.getValue(postA);
            const valB = metric.getValue(postB);
            const maxVal = Math.max(valA, valB, 1);
            const diff = maxVal > 0 ? Math.abs(valA - valB) / maxVal : 0;
            const isSignificant = diff >= 0.3;
            const winner = valA > valB ? 'A' : valB > valA ? 'B' : null;
            const Icon = metric.icon;
            const isCtr = metric.label === 'CTR';
            const formatVal = (v: number) => isCtr ? `${v}%` : v.toLocaleString();

            return (
              <div
                key={metric.label}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 transition-all',
                  isSignificant ? 'bg-primary/[0.06] ring-1 ring-primary/20' : 'bg-card/40'
                )}
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-24 shrink-0">{metric.label}</span>
                <span className={cn('text-sm font-semibold w-16 text-right shrink-0', isSignificant && winner === 'A' ? 'text-success' : 'text-foreground')}>
                  {formatVal(valA)}
                </span>
                <div className="flex-1 flex items-center gap-1 min-w-0">
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden flex justify-end">
                    <div className={cn('h-full rounded-full transition-all duration-500', isSignificant && winner === 'A' ? 'bg-success' : 'bg-primary/40')} style={{ width: `${maxVal > 0 ? (valA / maxVal) * 100 : 0}%` }} />
                  </div>
                  <div className="w-px h-4 bg-border shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-500', isSignificant && winner === 'B' ? 'bg-success' : 'bg-primary/40')} style={{ width: `${maxVal > 0 ? (valB / maxVal) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className={cn('text-sm font-semibold w-16 shrink-0', isSignificant && winner === 'B' ? 'text-success' : 'text-foreground')}>
                  {formatVal(valB)}
                </span>
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
  const { t, lang } = useLang();
  const [sortKey, setSortKey] = useState<'impressions' | 'ctr' | 'comments' | 'engagement'>('impressions');

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      const ma = a.metrics, mb = b.metrics;
      switch (sortKey) {
        case 'impressions': return (mb.impressions || 0) - (ma.impressions || 0);
        case 'ctr': return (mb.ctr || 0) - (ma.ctr || 0);
        case 'comments': return (mb.comments || 0) - (ma.comments || 0);
        case 'engagement': {
          const eA = ma.impressions ? ((ma.comments || 0) * 3 + (ma.shares || 0) * 2 + (ma.likes || 0)) / ma.impressions * 100 : 0;
          const eB = mb.impressions ? ((mb.comments || 0) * 3 + (mb.shares || 0) * 2 + (mb.likes || 0)) / mb.impressions * 100 : 0;
          return eB - eA;
        }
        default: return 0;
      }
    }).slice(0, 10);
  }, [posts, sortKey]);

  const headerClass = "cursor-pointer hover:text-foreground transition-colors";
  const dateLocale = lang === 'de' ? 'de-DE' : 'en-US';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('analytics.hook')}</TableHead>
          <TableHead>{t('analytics.date')}</TableHead>
          <TableHead className={headerClass} onClick={() => setSortKey('impressions')}>
            Impressions {sortKey === 'impressions' && '↓'}
          </TableHead>
          <TableHead className={headerClass} onClick={() => setSortKey('ctr')}>
            CTR {sortKey === 'ctr' && '↓'}
          </TableHead>
          <TableHead className={headerClass} onClick={() => setSortKey('comments')}>
            {t('analytics.comments')} {sortKey === 'comments' && '↓'}
          </TableHead>
          <TableHead className={headerClass} onClick={() => setSortKey('engagement')}>
            {t('analytics.engagement')} {sortKey === 'engagement' && '↓'}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map(p => {
          const eng = p.metrics.impressions
            ? (((p.metrics.comments || 0) * 3 + (p.metrics.shares || 0) * 2 + (p.metrics.likes || 0)) / p.metrics.impressions * 100).toFixed(1)
            : '0.0';
          return (
            <TableRow key={p.id}>
              <TableCell className="font-playfair text-sm font-medium max-w-[200px] truncate">
                {p.hook || '—'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {p.posted_at ? new Date(p.posted_at).toLocaleDateString(dateLocale) : '—'}
              </TableCell>
              <TableCell>{(p.metrics.impressions || 0).toLocaleString()}</TableCell>
              <TableCell>{p.metrics.ctr != null ? `${p.metrics.ctr}%` : '—'}</TableCell>
              <TableCell>{p.metrics.comments || 0}</TableCell>
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
  const { user } = useAuth();
  const { t, lang } = useLang();
  const dateFnsLocale = lang === 'de' ? de : enUS;
  const {
    posts, kpis, timelineData, contentTypeData, sentimentData,
    bestTimeData, loading, hasData, timeRange, setTimeRange,
    customRange, setCustomRange,
  } = useAnalytics();
  const [importLoading, setImportLoading] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(customRange?.from);
  const [customTo, setCustomTo] = useState<Date | undefined>(customRange?.to);

  const handleLinkedInImport = async () => {
    if (!user) return;
    setImportLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('linkedin_url')
        .eq('id', user.id)
        .single();

      if (!profile?.linkedin_url) {
        toast({
          title: t('analytics.linkedin_missing'),
          description: t('analytics.linkedin_missing_desc'),
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('scrape-linkedin-posts', {
        body: { linkedin_url: profile.linkedin_url, user_id: user.id },
      });

      if (error) throw error;

      toast({
        title: t('analytics.import_done'),
        description: `${data.imported} ${t('analytics.posts')} imported, ${data.skipped || 0} skipped.`,
      });

      window.location.reload();
    } catch (err: any) {
      console.error('LinkedIn import error:', err);
      toast({
        title: t('analytics.import_failed'),
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setImportLoading(false);
    }
  };

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
            <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">{t('analytics.title')}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t('analytics.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('import-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="gap-2"
            >
              <Linkedin className="h-4 w-4" />
              {t('analytics.import_posts')}
            </Button>
            <Tabs value={timeRange} onValueChange={v => {
              setTimeRange(v as TimeRange);
              if (v !== 'custom') setCustomRange(null);
            }}>
              <TabsList>
                <TabsTrigger value="7d">{lang === 'de' ? '7T' : '7D'}</TabsTrigger>
                <TabsTrigger value="30d">{lang === 'de' ? '30T' : '30D'}</TabsTrigger>
                <TabsTrigger value="90d">{lang === 'de' ? '90T' : '90D'}</TabsTrigger>
                <TabsTrigger value="custom" className="gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {timeRange === 'custom' && customRange
                    ? `${format(customRange.from, 'dd.MM', { locale: dateFnsLocale })} – ${format(customRange.to, 'dd.MM', { locale: dateFnsLocale })}`
                    : t('analytics.period')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {timeRange === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                    <CalendarIcon className="h-3 w-3" />
                    {customRange
                      ? `${format(customRange.from, 'dd.MM.yy', { locale: dateFnsLocale })} – ${format(customRange.to, 'dd.MM.yy', { locale: dateFnsLocale })}`
                      : t('analytics.period')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 space-y-3" align="end">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">{t('analytics.from')}</p>
                      <Calendar
                        mode="single"
                        selected={customFrom}
                        onSelect={setCustomFrom}
                        disabled={(date) => date > new Date() || (customTo ? date > customTo : false)}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">{t('analytics.to')}</p>
                      <Calendar
                        mode="single"
                        selected={customTo}
                        onSelect={setCustomTo}
                        disabled={(date) => date > new Date() || (customFrom ? date < customFrom : false)}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!customFrom || !customTo}
                    onClick={() => {
                      if (customFrom && customTo) {
                        setCustomRange({ from: customFrom, to: customTo });
                      }
                    }}
                  >
                    {t('analytics.apply')}
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>
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
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4">{t('analytics.timeline')}</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => new Date(v).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', { day: '2-digit', month: '2-digit' })} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} labelFormatter={v => new Date(v).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')} />
                <Area yAxisId="left" type="monotone" dataKey="impressions" name="Impressions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="engagement" name={t('analytics.engagement')} stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--success))' }} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Content Type + Sentiment */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className={cn(GLASS_CARD, 'p-6')}>
              <h2 className="font-playfair text-base font-semibold text-foreground mb-4">{t('analytics.content_type')}</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contentTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--foreground))' }} cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="impressions" name="Impressions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="engagement" name={t('analytics.engagement')} fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={cn(GLASS_CARD, 'p-6')}>
              <h2 className="font-playfair text-base font-semibold text-foreground mb-4">{t('analytics.sentiment')}</h2>
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
                  <p className="text-sm text-muted-foreground py-12">{t('analytics.no_sentiment')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Best Time to Post */}
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> {t('analytics.best_times')}
            </h2>
            <BestTimeHeatmap data={bestTimeData} />
          </div>

          {/* Top Posts Table */}
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4">{t('analytics.top_posts')}</h2>
            <TopPostsTable posts={posts} />
          </div>

          {/* Post Compare */}
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Minus className="h-4 w-4 rotate-90" /> {t('analytics.compare')}
            </h2>
            <PostCompare posts={posts} />
          </div>

          {/* AI Insights */}
          <div className={cn(GLASS_CARD, 'p-6')}>
            <h2 className="font-playfair text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> {t('analytics.ai_tips')}
            </h2>
            <div className="space-y-3">
              {[
                t('analytics.tip1'),
                t('analytics.tip2'),
                t('analytics.tip3'),
                t('analytics.tip4'),
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3 rounded-[12px] bg-muted/40 backdrop-blur-sm p-3">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Screenshot Analytics Import */}
          <ScreenshotAnalytics />

          {/* AI Learning Insights */}
          <AILearningInsights />

          {/* Cycle Comparison */}
          <CycleComparison />
        </>
      )}
    </div>
  );
}

// ──── Screenshot Analytics ────
function ScreenshotAnalytics() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { posts: allPosts } = usePosts(user?.id);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedMetrics, setExtractedMetrics] = useState<any>(null);
  const [editableMetrics, setEditableMetrics] = useState<any>(null);

  const postedPosts = useMemo(() =>
    allPosts.filter(p => p.status === 'posted' || p.status === 'analyzed').slice(0, 50),
    [allPosts]
  );

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setBase64Image(result.split(',')[1]);
      setExtractedMetrics(null);
      setEditableMetrics(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setBase64Image(result.split(',')[1]);
      setExtractedMetrics(null);
      setEditableMetrics(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = async () => {
    if (!base64Image || !selectedPostId) return;
    setAnalyzing(true);
    try {
      const selectedPost = postedPosts.find(p => p.id === selectedPostId);
      const { data, error } = await supabase.functions.invoke('analyze-screenshot', {
        body: { base64Image, postText: selectedPost?.content || '' },
      });
      if (error) throw error;
      setExtractedMetrics(data);
      setEditableMetrics({ ...data });
    } catch (err: any) {
      toast({ title: t('analytics.import_failed'), description: err.message, variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveMetrics = async () => {
    if (!editableMetrics || !selectedPostId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('posts').update({
        metrics: editableMetrics,
        status: 'analyzed',
      }).eq('id', selectedPostId);
      if (error) throw error;
      toast({ title: t('analytics.metrics_saved'), description: t('analytics.metrics_saved_desc') });
      setExtractedMetrics(null);
      setEditableMetrics(null);
      setImagePreview(null);
      setBase64Image(null);
      setSelectedPostId('');
    } catch (err: any) {
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const confidence = editableMetrics?.extraction_confidence;
  const confidenceColor = confidence > 0.8 ? 'text-success' : confidence > 0.5 ? 'text-warning' : 'text-destructive';

  return (
    <div id="import-section" className={cn(GLASS_CARD, 'p-6')}>
      <h2 className="font-playfair text-base font-semibold text-foreground mb-1 flex items-center gap-2">
        <Upload className="h-4 w-4" /> {t('analytics.screenshot_title')}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        {t('analytics.screenshot_desc')}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('screenshot-upload')?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Screenshot preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <div className="space-y-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">{t('analytics.drag_image')}</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WebP</p>
              </div>
            )}
            <input id="screenshot-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="mt-3 space-y-2">
            <Select value={selectedPostId} onValueChange={setSelectedPostId}>
              <SelectTrigger><SelectValue placeholder={t('analytics.select_post')} /></SelectTrigger>
              <SelectContent>
                {postedPosts.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {(p.content || '').substring(0, 50)}... {p.posted_at ? `(${new Date(p.posted_at).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAnalyze} disabled={!base64Image || !selectedPostId || analyzing} className="w-full">
              {analyzing ? t('analytics.analyzing') : t('analytics.analyze')}
            </Button>
          </div>
        </div>

        {editableMetrics && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{t('analytics.extracted')}</p>
              {confidence != null && (
                <Badge variant="outline" className={cn('text-xs rounded-full', confidenceColor)}>
                  {t('analytics.confidence')}: {Math.round(confidence * 100)}%
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['impressions', 'likes', 'comments', 'shares', 'clicks', 'engagement_rate'] as const).map(key => (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] text-muted-foreground capitalize">{key.replace('_', ' ')}</label>
                  <Input
                    type="number"
                    value={editableMetrics[key] ?? 0}
                    onChange={e => setEditableMetrics((prev: any) => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
            {editableMetrics.notes && (
              <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">{editableMetrics.notes}</p>
            )}
            <Button onClick={handleSaveMetrics} disabled={saving} className="w-full">
              <Save className="h-3 w-3 mr-1" /> {saving ? t('analytics.saving') : t('analytics.save_metrics')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ──── AI Learning Insights ────
function AILearningInsights() {
  const { user } = useAuth();
  const { t } = useLang();
  const { posts: allPosts } = usePosts(user?.id);

  const analyzed = useMemo(() =>
    allPosts.filter(p => (p.status === 'analyzed' || p.status === 'posted') && p.metrics && typeof p.metrics === 'object' && (p.metrics as any).impressions),
    [allPosts]
  );

  const bestPattern = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    analyzed.forEach(p => {
      const m = p.metrics as any;
      const pattern = m?.content_pattern || p.type || p.content_category;
      if (!pattern) return;
      const eng = Number(m?.engagement_rate || 0);
      if (!map[pattern]) map[pattern] = { total: 0, count: 0 };
      map[pattern].total += eng;
      map[pattern].count++;
    });
    let best = '';
    let bestAvg = 0;
    Object.entries(map).forEach(([k, v]) => { const avg = v.total / v.count; if (avg > bestAvg) { bestAvg = avg; best = k; } });
    return best || null;
  }, [analyzed]);

  const topTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    analyzed.forEach(p => {
      const m = p.metrics as any;
      const tags = m?.topic_tags || [];
      if (Array.isArray(tags)) tags.forEach((tg: string) => { tagCount[tg] = (tagCount[tg] || 0) + 1; });
    });
    return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [analyzed]);

  const sentimentDist = useMemo(() => {
    let pos = 0, neu = 0, neg = 0;
    analyzed.forEach(p => {
      const m = p.metrics as any;
      const s = m?.sentiment;
      if (typeof s === 'string') {
        if (s === 'positive') pos++;
        else if (s === 'negative') neg++;
        else neu++;
      } else if (s && typeof s === 'object') {
        pos += s.positive || 0;
        neu += s.neutral || 0;
        neg += s.negative || 0;
      }
    });
    const total = pos + neu + neg;
    if (total === 0) return null;
    return { pos: Math.round((pos / total) * 100), neu: Math.round((neu / total) * 100), neg: Math.round((neg / total) * 100) };
  }, [analyzed]);

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    [...analyzed].reverse().slice(0, 3).forEach(p => {
      const m = p.metrics as any;
      const followUps = m?.recommended_follow_ups;
      if (Array.isArray(followUps)) followUps.forEach((r: string) => { if (!recs.includes(r)) recs.push(r); });
    });
    return recs.slice(0, 5);
  }, [analyzed]);

  if (analyzed.length === 0) return null;

  return (
    <div className={cn(GLASS_CARD, 'p-6')}>
      <h2 className="font-playfair text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Brain className="h-4 w-4" /> {t('analytics.ai_learned')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bestPattern && (
          <div className="rounded-[16px] bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground mb-1">{t('analytics.best_content')}</p>
            <p className="text-sm font-semibold text-foreground">{bestPattern}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('analytics.best_content_desc')}</p>
          </div>
        )}
        {topTags.length > 0 && (
          <div className="rounded-[16px] bg-success/5 p-4">
            <p className="text-xs text-muted-foreground mb-2">{t('analytics.topics_resonate')}</p>
            <div className="flex flex-wrap gap-1.5">
              {topTags.map(([tag, count]) => (
                <Badge key={tag} variant="outline" className="text-[10px] rounded-full">{tag} ({count})</Badge>
              ))}
            </div>
          </div>
        )}
        {sentimentDist && (
          <div className="rounded-[16px] bg-warning/5 p-4">
            <p className="text-xs text-muted-foreground mb-2">{t('analytics.sentiment_dist')}</p>
            <div className="flex gap-2 h-3 rounded-full overflow-hidden">
              <div className="bg-success rounded-full" style={{ width: `${sentimentDist.pos}%` }} />
              <div className="bg-muted rounded-full" style={{ width: `${sentimentDist.neu}%` }} />
              <div className="bg-destructive rounded-full" style={{ width: `${sentimentDist.neg}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{t('analytics.positive')} {sentimentDist.pos}%</span>
              <span>{t('analytics.neutral')} {sentimentDist.neu}%</span>
              <span>{t('analytics.critical')} {sentimentDist.neg}%</span>
            </div>
          </div>
        )}
      </div>
      {recommendations.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{t('analytics.ai_recommendations')}</p>
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl bg-muted/30 p-3">
              <Zap className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
              <p className="text-xs text-foreground">{rec}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──── Cycle Comparison ────
function CycleComparison() {
  const { user } = useAuth();
  const { t } = useLang();
  const { posts: allPosts } = usePosts(user?.id);

  const cycles = useMemo(() => {
    const analyzed = allPosts.filter(p =>
      (p.status === 'analyzed' || p.status === 'posted') &&
      p.metrics && typeof p.metrics === 'object' && (p.metrics as any).impressions
    );
    const byNumber: Record<number, any[]> = {};
    analyzed.forEach(p => {
      const cn = (p as any).cycle_number || 1;
      if (!byNumber[cn]) byNumber[cn] = [];
      byNumber[cn].push(p);
    });
    return byNumber;
  }, [allPosts]);

  const cycleNumbers = Object.keys(cycles).map(Number).sort((a, b) => a - b);
  if (cycleNumbers.length < 2) return null;

  const firstCycle = cycleNumbers[0];
  const latestCycle = cycleNumbers[cycleNumbers.length - 1];

  const avgMetrics = (posts: any[]) => {
    const len = posts.length || 1;
    const totalImp = posts.reduce((s, p) => s + (Number((p.metrics as any)?.impressions) || 0), 0);
    const totalEng = posts.reduce((s, p) => s + (Number((p.metrics as any)?.engagement_rate) || 0), 0);
    const totalLikes = posts.reduce((s, p) => s + (Number((p.metrics as any)?.likes) || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (Number((p.metrics as any)?.comments) || 0), 0);
    return {
      impressions: Math.round(totalImp / len),
      engagement_rate: (totalEng / len).toFixed(1),
      likes: Math.round(totalLikes / len),
      comments: Math.round(totalComments / len),
    };
  };

  const first = avgMetrics(cycles[firstCycle]);
  const latest = avgMetrics(cycles[latestCycle]);

  const delta = (a: number, b: number) => {
    if (b === 0) return null;
    return Math.round(((a - b) / b) * 100);
  };

  const metrics = [
    { label: 'Impressions', first: first.impressions, latest: latest.impressions },
    { label: 'Engagement Rate', first: Number(first.engagement_rate), latest: Number(latest.engagement_rate) },
    { label: 'Likes', first: first.likes, latest: latest.likes },
    { label: t('analytics.comments'), first: first.comments, latest: latest.comments },
  ];

  return (
    <div className={cn(GLASS_CARD, 'p-6')}>
      <h2 className="font-playfair text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <ArrowRight className="h-4 w-4" /> {t('analytics.cycle_compare')}
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        {t('analytics.cycle_desc')}: {t('analytics.cycle')} {firstCycle} ({cycles[firstCycle].length} {t('analytics.posts')}) vs. {t('analytics.cycle')} {latestCycle} ({cycles[latestCycle].length} {t('analytics.posts')})
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(m => {
          const d = delta(m.latest, m.first);
          const isPositive = d !== null && d >= 0;
          return (
            <div key={m.label} className="rounded-[16px] bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">{m.label}</p>
              <div className="flex items-center justify-center gap-3">
                <div>
                  <p className="text-lg font-semibold text-foreground/60">{m.first}</p>
                  <p className="text-[10px] text-muted-foreground">{t('analytics.cycle')} {firstCycle}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold text-foreground">{m.latest}</p>
                  <p className="text-[10px] text-muted-foreground">{t('analytics.cycle')} {latestCycle}</p>
                </div>
              </div>
              {d !== null && (
                <Badge variant="secondary" className={cn('mt-2 text-[10px] rounded-full', isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                  {isPositive ? '+' : ''}{d}%
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
