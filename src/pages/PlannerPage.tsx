import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'outline' | 'default' }> = {
  draft: { label: 'Entwurf', variant: 'secondary' },
  approved: { label: 'Freigegeben', variant: 'outline' },
  scheduled: { label: 'Geplant', variant: 'default' },
  posted: { label: 'Veröffentlicht', variant: 'default' },
};

export default function PlannerPage() {
  const [filter, setFilter] = useState('all');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-foreground">Content Planner</h1>
          <p className="text-sm text-muted-foreground">Verwalten Sie Ihre LinkedIn-Posts</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] bg-card">
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

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="border-border shadow-sm"><CardContent className="p-8 text-center text-muted-foreground">Keine Posts gefunden</CardContent></Card>
        )}
        {filtered.map(post => {
          const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
          return (
            <Card key={post.id} className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEdit(post)}>
              <CardContent className="p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                  {post.type && <Badge variant="outline" className="text-xs">{post.type}</Badge>}
                  {post.angle && <Badge variant="outline" className="text-xs">{post.angle}</Badge>}
                </div>
                {post.hook && <p className="font-playfair text-sm font-semibold text-foreground">{post.hook}</p>}
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {post.scheduled_at
                    ? `Geplant: ${format(new Date(post.scheduled_at), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr`
                    : `Erstellt: ${format(new Date(post.created_at), 'dd. MMM yyyy', { locale: de })}`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPost(null)}>Abbrechen</Button>
            <Button onClick={saveEdit} disabled={updateMutation.isPending}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
