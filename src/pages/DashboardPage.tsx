import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, Users, Eye, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const stats = [
  { label: 'Posts/Woche', value: '3.2', change: '+12%', icon: FileText },
  { label: 'Ø Engagement', value: '4.8%', change: '+0.6%', icon: TrendingUp },
  { label: 'Follower-Wachstum', value: '+127', change: '+18%', icon: Users },
  { label: 'Impressions', value: '12.4K', change: '+22%', icon: Eye },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const draftCount = 3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ihr LinkedIn-Überblick auf einen Blick</p>
      </div>

      {/* Next Action */}
      <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-foreground">Nächste Aktion</p>
            <p className="text-sm text-muted-foreground">{draftCount} offene Entwürfe warten auf Ihre Freigabe</p>
          </div>
          <Button size="sm" onClick={() => navigate('/planner')}>Zum Planner</Button>
        </CardContent>
      </Card>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <s.icon className="h-5 w-5 text-muted-foreground" />
                <Badge variant="secondary" className="bg-success/10 text-success text-xs font-medium">{s.change}</Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-semibold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Scheduled Post */}
      <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="font-playfair text-lg">Nächster geplanter Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="default" className="text-xs">Geplant</Badge>
                <Badge variant="outline" className="text-xs">Story Post</Badge>
                <Badge variant="outline" className="text-xs">Personal Branding</Badge>
              </div>
              <p className="text-sm text-foreground line-clamp-2">
                Die größte Lektion meiner Karriere? Scheitern ist nicht das Gegenteil von Erfolg – es ist ein Teil davon...
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Geplant für Montag, 10:00 Uhr</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
