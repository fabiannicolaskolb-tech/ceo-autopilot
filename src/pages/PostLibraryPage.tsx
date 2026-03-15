import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  FileText, Send, Check, Clock, BarChart3, Copy, Pencil, Trash2,
  CalendarDays, ChevronDown, ChevronUp, Inbox, Sparkles,
  Eye, Heart, MessageCircle, Share2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/hooks/useRealtime';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MeshBackground } from '@/components/MeshBackground';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const GLASS_CARD = 'rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Entwurf', color: 'bg-muted text-muted-foreground', icon: FileText },
  approved: { label: 'Freigegeben', color: 'bg-[hsl(var(--status-approved))]/15 text-[hsl(var(--status-approved))]', icon: Check },
  scheduled: { label: 'Geplant', color: 'bg-[hsl(var(--status-scheduled))]/15 text-[hsl(var(--status-scheduled))]', icon: Clock },
  posted: { label: 'Veröffentlicht', color: 'bg-[hsl(var(--status-posted))]/15 text-[hsl(var(--status-posted))]', icon: Send },
  analyzed: { label: 'Analysiert', color: 'bg-warning/15 text-warning', icon: BarChart3 },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <Badge variant="secondary" className={cn('text-xs rounded-full gap-1', cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

interface PostCardProps {
  post: any;
  tab: 'drafts' | 'published';
  onMutate: () => void;
}

function PostCard({ post, tab, onMutate }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [saving, setSaving] = useState(false);

  const hashtags: string[] = Array.isArray(post.hashtags) ? post.hashtags : [];
  const metrics = post.metrics && typeof post.metrics === 'object' ? post.metrics as any : null;
  const hasMetrics = metrics && (metrics.impressions || metrics.likes || metrics.comments);

  const handleApprove = async () => {
    const { error } = await supabase.from('posts').update({ status: 'approved' }).eq('id', post.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Post freigegeben' });
    onMutate();
  };

  const handleSchedule = async () => {
    if (!scheduleDate) return;
    const [h, m] = scheduleTime.split(':').map(Number);
    const dt = new Date(scheduleDate);
    dt.setHours(h, m, 0, 0);
    const { error } = await supabase.from('posts').update({ status: 'scheduled', scheduled_at: dt.toISOString() }).eq('id', post.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Post geplant', description: format(dt, 'dd.MM.yyyy HH:mm', { locale: de }) });
    onMutate();
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const { error } = await supabase.from('posts').update({ content: editContent }).eq('id', post.id);
    setSaving(false);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Änderungen gespeichert' });
    setEditing(false);
    onMutate();
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Post gelöscht' });
    onMutate();
  };

  const handleCopy = () => {
    const text = `${post.content || ''}\n\n${hashtags.map(h => `#${h}`).join(' ')}`.trim();
    navigator.clipboard.writeText(text);
    toast({ title: 'In Zwischenablage kopiert' });
  };

  const contentPreview = post.content || '';
  const isLong = contentPreview.length > 200;

  return (
    <div className={cn(GLASS_CARD, 'p-5 space-y-3 transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)]')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <StatusBadge status={post.status} />
          {post.cycle_number && post.cycle_number > 0 && (
            <Badge variant="outline" className="text-[10px] rounded-full">Zyklus {post.cycle_number}</Badge>
          )}
          {post.type && <Badge variant="outline" className="text-xs rounded-full">{post.type}</Badge>}
          {post.angle && <Badge variant="outline" className="text-xs rounded-full">{post.angle}</Badge>}
        </div>
        <span className="text-[11px] text-muted-foreground">
          {post.posted_at ? format(new Date(post.posted_at), 'dd.MM.yyyy', { locale: de }) : format(new Date(post.created_at), 'dd.MM.yyyy', { locale: de })}
        </span>
      </div>

      {/* Content */}
      {editing ? (
        <div className="space-y-2">
          <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={6} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit} disabled={saving}>Speichern</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Abbrechen</Button>
          </div>
        </div>
      ) : (
        <div>
          <p className={cn('text-sm text-foreground leading-relaxed whitespace-pre-line', !expanded && isLong && 'line-clamp-3')}>
            {contentPreview}
          </p>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
              {expanded ? <><ChevronUp className="h-3 w-3" /> Weniger anzeigen</> : <><ChevronDown className="h-3 w-3" /> Mehr anzeigen</>}
            </button>
          )}
        </div>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((tag, i) => (
            <span key={i} className="text-[11px] text-primary/70 bg-primary/5 rounded-full px-2 py-0.5">#{tag}</span>
          ))}
        </div>
      )}

      {/* Mini Metrics for Published */}
      {tab === 'published' && hasMetrics && (
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1 border-t border-border/50">
          {metrics.impressions != null && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{Number(metrics.impressions).toLocaleString()}</span>}
          {metrics.likes != null && <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{metrics.likes}</span>}
          {metrics.comments != null && <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{metrics.comments}</span>}
          {metrics.shares != null && <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{metrics.shares}</span>}
          {metrics.engagement_rate != null && <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />{metrics.engagement_rate}%</span>}
          {metrics.score != null && (
            <Badge variant="secondary" className="text-[10px] rounded-full bg-warning/15 text-warning">Score: {metrics.score}/10</Badge>
          )}
        </div>
      )}

      {/* Expanded AI Insights for Published */}
      {tab === 'published' && expanded && metrics && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          {metrics.performance_summary && (
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1"><Sparkles className="h-3 w-3" /> Performance Summary</p>
              <p className="text-xs text-muted-foreground">{metrics.performance_summary}</p>
            </div>
          )}
          {metrics.what_worked && (
            <div className="rounded-xl bg-success/5 p-3">
              <p className="text-xs font-medium text-success mb-1">✓ Was funktioniert hat</p>
              <p className="text-xs text-muted-foreground">{metrics.what_worked}</p>
            </div>
          )}
          {metrics.what_to_improve && (
            <div className="rounded-xl bg-warning/5 p-3">
              <p className="text-xs font-medium text-warning mb-1">↗ Verbesserungspotenzial</p>
              <p className="text-xs text-muted-foreground">{metrics.what_to_improve}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {tab === 'drafts' && (
          <>
            {post.status === 'draft' && (
              <Button size="sm" variant="default" className="text-xs h-8" onClick={handleApprove}>
                <Check className="h-3 w-3 mr-1" /> Freigeben
              </Button>
            )}
            {post.status === 'approved' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="default" className="text-xs h-8">
                    <CalendarDays className="h-3 w-3 mr-1" /> Planen
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 space-y-3" align="start">
                  <Calendar mode="single" selected={scheduleDate} onSelect={setScheduleDate} className="p-3 pointer-events-auto" />
                  <div className="flex items-center gap-2">
                    <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-28 h-8 text-xs" />
                    <Button size="sm" className="text-xs h-8" onClick={handleSchedule} disabled={!scheduleDate}>Bestätigen</Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => { setEditing(true); setEditContent(post.content || ''); }}>
              <Pencil className="h-3 w-3 mr-1" /> Bearbeiten
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" className="text-xs h-8" onClick={handleCopy}>
          <Copy className="h-3 w-3 mr-1" /> Kopieren
        </Button>
        {tab === 'drafts' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-xs h-8 text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3 mr-1" /> Löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Post löschen?</AlertDialogTitle>
                <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export default function PostLibraryPage() {
  const { user } = useAuth();
  const { posts, loading } = usePosts(user?.id);
  const [tab, setTab] = useState<'drafts' | 'published'>('drafts');
  const [refreshKey, setRefreshKey] = useState(0);

  const drafts = useMemo(() => posts.filter(p => ['draft', 'approved', 'scheduled'].includes(p.status)), [posts, refreshKey]);
  const published = useMemo(() => posts.filter(p => ['posted', 'analyzed'].includes(p.status)), [posts, refreshKey]);

  const currentPosts = tab === 'drafts' ? drafts : published;

  const handleMutate = () => setRefreshKey(k => k + 1);

  return (
    <div className="relative space-y-6">
      <MeshBackground />

      {/* Header */}
      <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">Post Library</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Verwalten und planen Sie Ihre LinkedIn-Posts</p>
          </div>
          <Tabs value={tab} onValueChange={v => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="drafts" className="gap-1.5">
                Entwürfe & Geplant
                <Badge variant="secondary" className="text-[10px] rounded-full h-5 min-w-5 px-1.5">{drafts.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="published" className="gap-1.5">
                Veröffentlicht
                <Badge variant="secondary" className="text-[10px] rounded-full h-5 min-w-5 px-1.5">{published.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={cn(GLASS_CARD, 'p-5 space-y-3')}>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      ) : currentPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 py-16 px-6 text-center">
          <div className="rounded-xl bg-muted/50 p-4 mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-playfair text-lg font-semibold text-foreground mb-1">
            {tab === 'drafts' ? 'Noch keine Entwürfe' : 'Noch keine veröffentlichten Posts'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            {tab === 'drafts'
              ? 'Starten Sie im Ideation Lab, um Ihre ersten Post-Ideen zu generieren.'
              : 'Geben Sie einen Entwurf frei, um loszulegen.'}
          </p>
          {tab === 'drafts' && (
            <Button asChild>
              <Link to="/ideation">Erste Idee generieren</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {currentPosts.map(post => (
            <PostCard key={post.id} post={post} tab={tab} onMutate={handleMutate} />
          ))}
        </div>
      )}
    </div>
  );
}
