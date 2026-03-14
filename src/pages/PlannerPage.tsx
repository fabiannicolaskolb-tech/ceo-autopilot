import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon, Rocket, ChevronLeft, ChevronRight, List, CalendarDays, Send, Loader2, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { MeshBackground } from '@/components/MeshBackground';
import { cn } from '@/lib/utils';

const GLASS_CARD = 'rounded-[24px] bg-card/80 backdrop-blur-xl shadow-[0_4px_24px_-4px_hsl(220_55%_20%/0.06),0_12px_48px_-8px_hsl(220_55%_20%/0.04)]';
const GLASS_CARD_HOVER = `${GLASS_CARD} transition-all duration-300 hover:shadow-[0_8px_32px_-4px_hsl(220_55%_20%/0.1)]`;

const STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'outline' | 'default'; colorClass: string; dotClass: string }> = {
  draft: { label: 'Entwurf', variant: 'secondary', colorClass: 'bg-[hsl(var(--status-draft))]', dotClass: 'bg-[hsl(var(--status-draft))]' },
  approved: { label: 'Freigegeben', variant: 'outline', colorClass: 'bg-[hsl(var(--status-approved))]', dotClass: 'bg-[hsl(var(--status-approved))]' },
  scheduled: { label: 'Geplant', variant: 'default', colorClass: 'bg-[hsl(var(--status-scheduled))]', dotClass: 'bg-[hsl(var(--status-scheduled))]' },
  posted: { label: 'Veröffentlicht', variant: 'default', colorClass: 'bg-[hsl(var(--status-posted))]', dotClass: 'bg-[hsl(var(--status-posted))]' },
};

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

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

  // Monday-based offset (0=Mon, 6=Sun)
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
      {/* Month navigation */}
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

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn('h-2.5 w-2.5 rounded-full', cfg.dotClass)} />
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden bg-border/50">
        {/* Header */}
        {WEEKDAYS.map(d => (
          <div key={d} className="bg-muted/60 py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}

        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card/40 min-h-[90px] p-1" />
        ))}

        {/* Day cells */}
        {days.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const dayPosts = postsByDate.get(key) || [];
          const today = isToday(day);

          return (
            <div
              key={key}
              className={cn(
                'bg-card/60 min-h-[90px] p-1.5 transition-colors',
                today && 'bg-primary/[0.04]',
              )}
            >
              <div className={cn(
                'text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                today ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map(post => {
                  const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
                  return (
                    <Tooltip key={post.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onPostClick(post)}
                          className={cn(
                            'w-full text-left rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate transition-all hover:opacity-80 cursor-pointer',
                            cfg.colorClass, 'text-white'
                          )}
                        >
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
                {dayPosts.length > 3 && (
                  <p className="text-[10px] text-muted-foreground pl-1">+{dayPosts.length - 3} mehr</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Trailing empty cells */}
        {Array.from({ length: (7 - ((startOffset + days.length) % 7)) % 7 }).map((_, i) => (
          <div key={`trail-${i}`} className="bg-card/40 min-h-[90px] p-1" />
        ))}
      </div>
    </div>
  );
}

// ──── Main Page ────
export default function PlannerPage() {
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [editPost, setEditPost] = useState<any | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState<Date | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content, scheduled_at }: { id: string; content: string; scheduled_at?: string }) => {
      const { error } = await supabase.from('posts').update({ content, scheduled_at }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setEditPost(null);
      toast({ title: 'Post aktualisiert' });
    },
  });

  const triggerN8nMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('trigger-n8n', {
        body: { postId, action: 'publish' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setEditPost(null);
      toast({ title: 'Workflow gestartet', description: 'Der Post wurde an n8n gesendet.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    },
  });

  const triggerGenericMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('trigger-n8n-generic', {
        body: {
          user_id: user?.id,
          request_id: crypto.randomUUID(),
          command: 'orchestrate',
          cycle_number: 1,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Workflow gestartet', description: 'n8n wurde erfolgreich getriggert.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    },
  });

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter);

  const openEdit = (post: any) => {
    setEditPost(post);
    setEditContent(post.content || '');
    setEditDate(post.scheduled_at ? new Date(post.scheduled_at) : undefined);
  };

  const saveEdit = () => {
    if (!editPost) return;
    updateMutation.mutate({
      id: editPost.id,
      content: editContent,
      scheduled_at: editDate?.toISOString(),
    });
  };

  return (
    <div className="relative space-y-6">
      <MeshBackground />

      {/* Header */}
      <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-foreground tracking-tight">Content Gallery</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Verwalten Sie Ihre LinkedIn-Posts</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => triggerGenericMutation.mutate()}
              disabled={triggerGenericMutation.isPending}
              variant="outline"
              className="gap-2 rounded-xl"
            >
              {triggerGenericMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              n8n starten
            </Button>
            <Tabs value={view} onValueChange={v => setView(v as 'list' | 'calendar')}>
              <TabsList>
                <TabsTrigger value="list" className="gap-1.5">
                  <List className="h-3.5 w-3.5" /> Liste
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Kalender
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px] bg-card/60 backdrop-blur-sm rounded-xl">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="draft">Entwürfe</SelectItem>
                <SelectItem value="approved">Freigegeben</SelectItem>
                <SelectItem value="scheduled">Geplant</SelectItem>
                <SelectItem value="posted">Veröffentlicht</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'calendar' ? (
        <div className={cn(GLASS_CARD, 'p-6')}>
          <CalendarView posts={filtered} onPostClick={openEdit} />
        </div>
      ) : (
        <>
          {filtered.length === 0 && (
            <div className={cn(GLASS_CARD, 'p-8')}>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-muted/60 p-4 mb-3">
                  <Rocket className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground/70">Keine Posts gefunden</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  Starten Sie im Ideation Lab, um Ihre ersten Post-Ideen zu generieren.
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(post => {
              const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
              return (
                <div
                  key={post.id}
                  className={cn(GLASS_CARD_HOVER, 'aspect-square p-4 cursor-pointer flex flex-col justify-between overflow-hidden')}
                  onClick={() => openEdit(post)}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <Badge variant={cfg.variant} className={cn('text-[10px] rounded-full px-2 py-0', cfg.colorClass, 'text-white border-0')}>{cfg.label}</Badge>
                      {post.type && <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">{post.type}</Badge>}
                    </div>
                    {post.hook && (
                      <p className="font-playfair text-sm font-semibold text-foreground line-clamp-2">{post.hook}</p>
                    )}
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
        </>
      )}

      <Dialog open={!!editPost} onOpenChange={open => !open && setEditPost(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair">Post bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="min-h-[150px] bg-card" />
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Veröffentlichungsdatum</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDate ? format(editDate, 'PPP', { locale: de }) : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={editDate} onSelect={setEditDate} locale={de} className="pointer-events-auto p-3" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditPost(null)}>Abbrechen</Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending}>Speichern</Button>
            <Button
              onClick={() => editPost && triggerN8nMutation.mutate(editPost.id)}
              disabled={triggerN8nMutation.isPending}
              className="bg-[hsl(var(--status-posted))] hover:bg-[hsl(var(--status-posted))]/90 text-white gap-2"
            >
              {triggerN8nMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Veröffentlichen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
