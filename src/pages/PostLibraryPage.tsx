import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  FileText, Send, Check, Clock, BarChart3, Copy, Pencil, Trash2,
  CalendarDays, ChevronDown, ChevronUp, Inbox, Sparkles,
  Eye, Heart, MessageCircle, Share2, List, ChevronLeft, ChevronRight,
  Loader2, Zap, Rocket, Newspaper,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MeshBackground } from '@/components/MeshBackground';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { LinkedInPostPreview } from '@/components/LinkedInPostPreview';

const GLASS_CARD = 'rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]';
const GLASS_CARD_HOVER = `${GLASS_CARD} transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)]`;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; dotClass: string }> = {
  draft: { label: 'Entwurf', color: 'bg-muted text-muted-foreground', icon: FileText, dotClass: 'bg-[hsl(var(--status-draft))]' },
  approved: { label: 'Freigegeben', color: 'bg-[hsl(var(--status-approved))]/15 text-[hsl(var(--status-approved))]', icon: Check, dotClass: 'bg-[hsl(var(--status-approved))]' },
  scheduled: { label: 'Geplant', color: 'bg-[hsl(var(--status-scheduled))]/15 text-[hsl(var(--status-scheduled))]', icon: Clock, dotClass: 'bg-[hsl(var(--status-scheduled))]' },
  posted: { label: 'Veröffentlicht', color: 'bg-[hsl(var(--status-posted))]/15 text-[hsl(var(--status-posted))]', icon: Send, dotClass: 'bg-[hsl(var(--status-posted))]' },
  analyzed: { label: 'Analysiert', color: 'bg-warning/15 text-warning', icon: BarChart3, dotClass: 'bg-[hsl(var(--warning))]' },
};

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

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

function getPostDate(post: any): Date | null {
  if (post.posted_at) return new Date(post.posted_at);
  if (post.scheduled_at) return new Date(post.scheduled_at);
  return new Date(post.created_at);
}

// ──── Calendar View ────
function CalendarView({ posts, onPostClick }: { posts: any[]; onPostClick: (post: any) => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = (getDay(monthStart) + 6) % 7;

  const postsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    posts.forEach(post => {
      const d = getPostDate(post);
      if (d) {
        const key = format(d, 'yyyy-MM-dd');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(post);
      }
    });
    return map;
  }, [posts]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-playfair text-lg font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 px-1">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn('h-2.5 w-2.5 rounded-full', cfg.dotClass)} />
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-border/50">
        {WEEKDAYS.map(d => (
          <div key={d} className="bg-muted/60 py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card/40 min-h-[90px] p-1" />
        ))}
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayPosts = postsByDate.get(key) || [];
          const today = isToday(day);
          return (
            <div key={key} className={cn('bg-card/60 min-h-[90px] p-1.5 transition-colors', today && 'bg-primary/[0.04]')}>
              <div className={cn('text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full', today ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map(post => {
                  const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
                  return (
                    <Tooltip key={post.id}>
                      <TooltipTrigger asChild>
                        <button onClick={() => onPostClick(post)} className={cn('w-full text-left rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate transition-all hover:opacity-80 cursor-pointer', cfg.dotClass, 'text-white')}>
                          {post.hook || post.content?.slice(0, 30) || 'Post'}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[240px]">
                        <p className="font-semibold text-xs">{cfg.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.hook || post.content?.slice(0, 80) || '—'}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                {dayPosts.length > 3 && <p className="text-[10px] text-muted-foreground pl-1">+{dayPosts.length - 3} mehr</p>}
              </div>
            </div>
          );
        })}
        {Array.from({ length: (7 - ((startOffset + days.length) % 7)) % 7 }).map((_, i) => (
          <div key={`trail-${i}`} className="bg-card/40 min-h-[90px] p-1" />
        ))}
      </div>
    </div>
  );
}

// ──── Post Card ────
interface PostCardProps {
  post: any;
  tab: 'drafts' | 'published';
  onMutate: () => void;
}

function PostCard({ post, tab, onMutate }: PostCardProps) {
  const { profile } = useAuth();
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
    // Trigger n8n workflow
    const { error: fnError } = await supabase.functions.invoke('trigger-n8n', { body: { postId: post.id } });
    if (fnError) console.error('n8n trigger error:', fnError);
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
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) { toast({ title: 'Fehler', description: 'Nicht eingeloggt', variant: 'destructive' }); return; }
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/posts?id=eq.${post.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );
    if (!res.ok) { toast({ title: 'Fehler beim Löschen', variant: 'destructive' }); return; }
    toast({ title: 'Post gelöscht' });
    onMutate();
  };

  const handleCopy = () => {
    const text = `${post.content || ''}\n\n${hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ')}`.trim();
    navigator.clipboard.writeText(text);
    toast({ title: 'In Zwischenablage kopiert' });
  };

  const contentPreview = post.content || '';
  const isLong = contentPreview.length > 200;

  const userName = profile?.name || 'Du';
  const typeLabel = post.type || post.content_category || 'Post';

  return (
    <div className={cn(GLASS_CARD, 'overflow-hidden transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)]')}>
      {/* LinkedIn-style Header */}
      <div className="p-5 pb-0 space-y-3">
        <div className="flex items-center gap-3">
          {profile?.avatar_url_1 ? (
            <img src={profile.avatar_url_1} alt={userName} className="h-10 w-10 rounded-full object-cover ring-2 ring-border" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">{userName}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {post.posted_at ? format(new Date(post.posted_at), 'dd. MMM', { locale: de }) : format(new Date(post.created_at), 'dd. MMM', { locale: de })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {typeLabel} · {post.angle || 'shared'}
            </p>
          </div>
          <StatusBadge status={post.status} />
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
            <p className={cn('text-sm text-foreground leading-relaxed whitespace-pre-line', !expanded && isLong && 'line-clamp-4')}>
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
              <span key={i} className="text-[11px] text-primary/70">{tag.startsWith('#') ? tag : `#${tag}`}</span>
            ))}
          </div>
        )}
      </div>

      {/* Post Image — full width, below content */}
      {post.image_url && (
        <div className="mt-3 border-t border-border/30">
          <img
            src={post.image_url}
            alt="Post Bild"
            className="w-full object-cover max-h-[400px]"
            loading="lazy"
          />
        </div>
      )}

      {/* Metrics & Actions */}
      <div className="p-5 pt-3 space-y-3">
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
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/30">
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
    </div>
  );
}

// ──── Gallery Grid View ────
function GalleryGrid({ posts, onPostClick }: { posts: any[]; onPostClick?: (post: any) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.map(post => {
        const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
        return (
          <div
            key={post.id}
            className={cn(GLASS_CARD_HOVER, 'aspect-square p-4 cursor-pointer flex flex-col justify-between overflow-hidden')}
            onClick={() => onPostClick?.(post)}
          >
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <Badge variant="secondary" className={cn('text-[10px] rounded-full px-2 py-0', cfg.dotClass, 'text-white border-0')}>{cfg.label}</Badge>
                {post.type && <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">{post.type}</Badge>}
              </div>
              {post.hook && <p className="font-playfair text-sm font-semibold text-foreground line-clamp-2">{post.hook}</p>}
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-4">{post.content}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {post.scheduled_at
                ? format(new Date(post.scheduled_at), 'dd. MMM yyyy', { locale: de })
                : format(new Date(post.created_at), 'dd. MMM yyyy', { locale: de })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ──── Approval Card ────
function ApprovalCard({ post, onMutate }: { post: any; onMutate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [saving, setSaving] = useState(false);
  const contentText = post.hook || post.content?.split('\n')[0] || '—';

  const handleApprove = async () => {
    const { error } = await supabase.from('posts').update({ status: 'approved' }).eq('id', post.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    // Trigger n8n workflow
    const { error: fnError } = await supabase.functions.invoke('trigger-n8n', { body: { postId: post.id } });
    if (fnError) console.error('n8n trigger error:', fnError);
    toast({ title: 'Post freigegeben ✓' });
    onMutate();
  };

  const handleReject = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) { toast({ title: 'Fehler', description: 'Nicht eingeloggt', variant: 'destructive' }); return; }
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/posts?id=eq.${post.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );
    if (!res.ok) { toast({ title: 'Fehler beim Löschen', variant: 'destructive' }); return; }
    toast({ title: 'Post abgelehnt und gelöscht' });
    onMutate();
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const { error } = await supabase.from('posts').update({ content: editContent }).eq('id', post.id);
    setSaving(false);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Änderungen gespeichert ✓' });
    setEditing(false);
    onMutate();
  };

  return (
    <div className={cn(GLASS_CARD, 'overflow-hidden border-l-4 border-l-primary')}>
      {/* Image preview if available */}
      {post.image_url && (
        <div className="w-full h-32 overflow-hidden">
          <img src={post.image_url} alt="Post Bild" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            {post.type && <Badge variant="outline" className="text-[10px] rounded-full">{post.type}</Badge>}
            {post.angle && <Badge variant="outline" className="text-[10px] rounded-full">{post.angle}</Badge>}
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(post.created_at), 'dd. MMM · HH:mm', { locale: de })}
            </span>
          </div>
        </div>

        {/* Content */}
        {editing ? (
          <div className="space-y-2">
            <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={6} className="text-xs" />
            <div className="flex gap-2">
              <Button size="sm" className="text-xs h-7" onClick={handleSaveEdit} disabled={saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}Speichern
              </Button>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => { setEditing(false); setEditContent(post.content || ''); }}>Abbrechen</Button>
            </div>
          </div>
        ) : (
          <div>
            <p className={cn('text-sm text-foreground whitespace-pre-line leading-relaxed', !expanded && isLong && 'line-clamp-4')}>{contentText}</p>
            {isLong && (
              <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
                {expanded ? <><ChevronUp className="h-3 w-3" /> Weniger anzeigen</> : <><ChevronDown className="h-3 w-3" /> Mehr anzeigen</>}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/50">
            <Button size="sm" className="text-xs h-8 flex-1" onClick={handleApprove}>
              <Check className="h-3 w-3 mr-1" /> Freigeben
            </Button>
            <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3 mr-1" /> Bearbeiten
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="text-xs h-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Post ablehnen?</AlertDialogTitle>
                  <AlertDialogDescription>Der Post wird unwiderruflich gelöscht.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReject}>Ablehnen & Löschen</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}

// ──── Feed View (LinkedIn Preview) ────
function FeedView({ posts, profile }: { posts: any[]; profile: any }) {
  const authorName = profile?.name || 'LinkedIn Creator';
  const authorHeadline = [profile?.role, profile?.company].filter(Boolean).join(' at ') || 'Professional';
  const authorAvatar = profile?.avatar_url_1 || undefined;

  if (posts.length === 0) return <EmptyState tab="drafts" />;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {posts.map(post => {
        const metrics = post.metrics && typeof post.metrics === 'object' ? post.metrics as any : undefined;
        const postedAt = post.posted_at
          ? format(new Date(post.posted_at), 'dd. MMM yyyy', { locale: de })
          : post.scheduled_at
            ? format(new Date(post.scheduled_at), 'dd. MMM yyyy', { locale: de })
            : 'Just now';

        return (
          <LinkedInPostPreview
            key={post.id}
            authorName={authorName}
            authorHeadline={authorHeadline}
            authorAvatar={authorAvatar}
            content={post.content || ''}
            hook={post.hook || undefined}
            imageUrl={post.image_url}
            postedAt={postedAt}
            showActions={false}
            metrics={metrics ? {
              likes: metrics.likes,
              comments: metrics.comments,
              shares: metrics.shares,
              impressions: metrics.impressions,
            } : undefined}
          />
        );
      })}
    </div>
  );
}

// ──── Main Page ────
export default function PostLibraryPage() {
  const { user, profile } = useAuth();
  const { posts, loading } = usePosts(user?.id);
  const [tab, setTab] = useState<'drafts' | 'published'>('drafts');
  const [viewMode, setViewMode] = useState<'list' | 'gallery' | 'calendar' | 'feed'>('list');
  const [refreshKey, setRefreshKey] = useState(0);

  const pendingApproval = useMemo(() =>
    posts.filter(p => p.status === 'draft').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [posts, refreshKey]);
  const drafts = useMemo(() => posts.filter(p => ['approved', 'scheduled'].includes(p.status)), [posts, refreshKey]);
  const published = useMemo(() => posts.filter(p => ['posted', 'analyzed'].includes(p.status)), [posts, refreshKey]);

  const currentPosts = tab === 'drafts' ? drafts : published;

  const handleMutate = () => setRefreshKey(k => k + 1);


  // Dummy handler for gallery/calendar clicks (scrolls to card view)
  const handlePostClick = (_post: any) => {
    setViewMode('list');
  };

  return (
    <div className="relative space-y-6">
      <MeshBackground />

      {/* Header */}
      <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">Post Library</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Verwalten, planen und visualisieren Sie Ihre LinkedIn-Posts</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* View mode toggle */}
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as any)}>
              <TabsList className="h-9">
                <TabsTrigger value="list" className="gap-1 text-xs px-2.5">
                  <List className="h-3 w-3" /> Liste
                </TabsTrigger>
                <TabsTrigger value="gallery" className="gap-1 text-xs px-2.5">
                  <FileText className="h-3 w-3" /> Galerie
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-1 text-xs px-2.5">
                  <CalendarDays className="h-3 w-3" /> Kalender
                </TabsTrigger>
                <TabsTrigger value="feed" className="gap-1 text-xs px-2.5">
                  <Newspaper className="h-3 w-3" /> Feed
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content tabs (only for list view) */}
        {viewMode === 'list' && (
          <div className="mt-4">
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
        )}
      </div>

      {/* Approval Queue (hidden in feed mode) */}
      {viewMode === 'list' && !loading && pendingApproval.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-warning/15">
              <Zap className="h-3.5 w-3.5 text-warning" />
            </div>
            <h2 className="font-playfair text-lg font-semibold text-foreground">Zur Freigabe</h2>
            <Badge variant="secondary" className="text-[10px] rounded-full bg-warning/15 text-warning">{pendingApproval.length}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingApproval.map(post => (
              <ApprovalCard key={post.id} post={post} onMutate={handleMutate} />
            ))}
          </div>
        </div>
      )}

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
      ) : viewMode === 'calendar' ? (
        <div className={cn(GLASS_CARD, 'p-6')}>
          <CalendarView posts={posts} onPostClick={handlePostClick} />
        </div>
      ) : viewMode === 'feed' ? (
        <FeedView posts={posts} profile={profile} />
      ) : viewMode === 'gallery' ? (
        posts.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <GalleryGrid posts={posts} onPostClick={handlePostClick} />
        )
      ) : currentPosts.length === 0 && (tab !== 'drafts' || pendingApproval.length === 0) ? (
        <EmptyState tab={tab} />
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

function EmptyState({ tab }: { tab: string }) {
  return (
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
  );
}
