import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PostQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-foreground">Post Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">Verwalten und planen Sie Ihre LinkedIn-Posts</p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 py-16 px-6 text-center">
        <div className="rounded-xl bg-muted/50 p-4 mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="font-playfair text-lg font-semibold text-foreground mb-1">
          Noch keine Posts zur Überprüfung
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Starten Sie im Ideation Lab, um Ihre ersten Post-Ideen zu generieren.
        </p>
        <Button asChild>
          <Link to="/ideation">Erste Idee generieren</Link>
        </Button>
      </div>
    </div>
  );
}
