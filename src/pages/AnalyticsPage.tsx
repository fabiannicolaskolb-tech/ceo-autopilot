import React from 'react';
import { Eye, Heart, MessageCircle, Share2, TrendingUp, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const impressionsData = [
  { week: 'KW1', value: 2400 }, { week: 'KW2', value: 3100 }, { week: 'KW3', value: 2800 },
  { week: 'KW4', value: 4200 }, { week: 'KW5', value: 3800 }, { week: 'KW6', value: 5100 },
  { week: 'KW7', value: 4700 }, { week: 'KW8', value: 6200 },
];

const engagementData = [
  { week: 'KW1', value: 3.2 }, { week: 'KW2', value: 4.1 }, { week: 'KW3', value: 3.8 },
  { week: 'KW4', value: 5.2 }, { week: 'KW5', value: 4.6 }, { week: 'KW6', value: 5.8 },
  { week: 'KW7', value: 5.1 }, { week: 'KW8', value: 6.3 },
];

const topPosts = [
  { hook: 'Die unbequeme Wahrheit über Führung', date: '12. März 2026', impressions: 8420, likes: 342, comments: 87, shares: 45, engagement: 5.6 },
  { hook: 'Warum ich montags keine Meetings mache', date: '5. März 2026', impressions: 6100, likes: 278, comments: 64, shares: 31, engagement: 6.1 },
  { hook: '3 Bücher, die mein Denken verändert haben', date: '1. März 2026', impressions: 5200, likes: 195, comments: 42, shares: 28, engagement: 5.1 },
];

const kpis = [
  { label: 'Gesamt Impressions', value: '38.4K', icon: Eye },
  { label: 'Ø Engagement Rate', value: '4.8%', icon: TrendingUp },
  { label: 'Posts/Woche', value: '3.2', icon: FileText },
  { label: 'Follower-Wachstum', value: '+127', icon: Users },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Performance-Übersicht Ihres LinkedIn-Auftritts</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => (
          <Card key={k.label} className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <k.icon className="h-5 w-5 text-muted-foreground" />
              <p className="mt-3 text-2xl font-semibold text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="font-playfair text-base">Impressions Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={impressionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(220, 13%, 88%)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="hsl(220, 55%, 20%)" fill="hsl(220, 55%, 20%)" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle className="font-playfair text-base">Engagement Rate Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid hsl(220, 13%, 88%)', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="value" stroke="hsl(160, 60%, 38%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(160, 60%, 38%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">Post Performance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {topPosts.map((p, i) => (
            <div key={i} className="flex items-start justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-playfair text-sm font-semibold text-foreground">{p.hook}</p>
                <p className="text-xs text-muted-foreground">{p.date}</p>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.impressions.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.comments}</span>
                  <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{p.shares}</span>
                </div>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success text-xs">{p.engagement}%</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-border shadow-sm">
        <CardHeader><CardTitle className="font-playfair text-base">AI Insights</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            'Story Posts erzielen 2.3x mehr Engagement als reine Tipps-Posts.',
            'Ihre beste Posting-Zeit ist Dienstag zwischen 8:00 und 10:00 Uhr.',
            'Posts mit einer provokanten Frage als Hook erhalten 45% mehr Kommentare.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm text-foreground">{tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
