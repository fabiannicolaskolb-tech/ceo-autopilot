import React from 'react';
import { ThumbsUp, MessageCircle, Repeat2, Send, Globe, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface LinkedInPostPreviewProps {
  authorName: string;
  authorHeadline?: string;
  authorAvatar?: string;
  content: string;
  hook?: string;
  imageUrl?: string | null;
  postedAt?: string;
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    impressions?: number;
  };
  showActions?: boolean;
  className?: string;
}

export function LinkedInPostPreview({
  authorName,
  authorHeadline = 'LinkedIn Creator',
  authorAvatar,
  content,
  hook,
  imageUrl,
  postedAt = 'Just now',
  metrics,
  showActions = true,
  className,
}: LinkedInPostPreviewProps) {
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const fullText = hook ? `${hook}\n\n${content}` : content;
  const paragraphs = fullText.split(/\n+/).filter(Boolean);

  const likeCount = metrics?.likes ?? 0;
  const commentCount = metrics?.comments ?? 0;
  const shareCount = metrics?.shares ?? 0;

  return (
    <div
      className={cn(
        'max-w-[600px] w-full rounded-lg shadow-sm border border-[hsl(210_16%_90%)] bg-[hsl(0_0%_100%)] font-sans',
        className,
      )}
    >
      <div className="flex items-start gap-3 p-4 pb-0">
        <Avatar className="h-12 w-12 ring-0">
          {authorAvatar ? <AvatarImage src={authorAvatar} alt={authorName} /> : null}
          <AvatarFallback className="bg-[hsl(210_100%_40%)] text-[hsl(0_0%_100%)] text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[hsl(222_47%_11%)] leading-tight">{authorName}</p>
          <p className="text-xs text-[hsl(215_10%_45%)] leading-tight mt-0.5 line-clamp-1">{authorHeadline}</p>
          <p className="text-xs text-[hsl(215_10%_45%)] leading-tight mt-0.5 flex items-center gap-1">
            {postedAt} · <Globe className="h-3 w-3" />
          </p>
        </div>

        <button className="text-[hsl(215_10%_45%)] hover:text-[hsl(222_47%_11%)] transition-colors p-1">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 pt-3 pb-3">
        <div className="text-sm text-[hsl(222_47%_11%)] leading-relaxed space-y-2">
          {(paragraphs.length ? paragraphs : ['']).map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      </div>

      {(likeCount > 0 || commentCount > 0 || shareCount > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-xs text-[hsl(215_10%_45%)]">
          <div className="flex items-center gap-1">
            {likeCount > 0 && (
              <>
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[hsl(210_100%_40%)] text-[hsl(0_0%_100%)] text-[8px]">👍</span>
                <span>{likeCount.toLocaleString()}</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            {commentCount > 0 && <span>{commentCount} Kommentar{commentCount !== 1 ? 'e' : ''}</span>}
            {shareCount > 0 && <span>{shareCount} Reposts</span>}
          </div>
        </div>
      )}

      {showActions && (
        <>
          <div className="mx-4 border-t border-[hsl(210_16%_90%)]" />
          <div className="flex items-center justify-around px-2 py-1">
            {[
              { icon: ThumbsUp, label: 'Gefällt mir' },
              { icon: MessageCircle, label: 'Kommentieren' },
              { icon: Repeat2, label: 'Reposten' },
              { icon: Send, label: 'Senden' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-medium text-[hsl(215_10%_45%)] hover:text-[hsl(222_47%_11%)] hover:bg-[hsl(210_20%_96%)] transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
