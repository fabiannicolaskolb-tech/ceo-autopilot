import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Repeat2, Send, Globe, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LinkedInPostPreviewProps {
  authorName: string;
  authorHeadline?: string;
  authorAvatar?: string;
  content: string;
  hook?: string;
  postedAt?: string;
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    impressions?: number;
  };
  showActions?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export function LinkedInPostPreview({
  authorName,
  authorHeadline = 'LinkedIn Creator',
  authorAvatar,
  content,
  hook,
  postedAt = 'Just now',
  metrics,
  className,
}: LinkedInPostPreviewProps) {
  const [showFull, setShowFull] = useState(false);

  const initials = authorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Format content as LinkedIn-style paragraphs
  const fullText = hook ? `${hook}\n\n${content}` : content;
  const paragraphs = fullText.split(/\n+/).filter(Boolean);
  const isLong = paragraphs.length > 4 || fullText.length > 300;
  const displayParagraphs = showFull ? paragraphs : paragraphs.slice(0, 3);
  const truncated = !showFull && isLong;

  const likeCount = metrics?.likes ?? 0;
  const commentCount = metrics?.comments ?? 0;
  const shareCount = metrics?.shares ?? 0;

  return (
    <div
      className={cn(
        'max-w-[600px] w-full bg-white dark:bg-[#1b1f23] rounded-lg shadow-sm border border-[#e0e0e0] dark:border-[#333] font-sans',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-0">
        <Avatar className="h-12 w-12 ring-0">
          {authorAvatar ? (
            <AvatarImage src={authorAvatar} alt={authorName} />
          ) : null}
          <AvatarFallback className="bg-[#0a66c2] text-white text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#191919] dark:text-[#e8e8e8] leading-tight">
            {authorName}
          </p>
          <p className="text-xs text-[#666] dark:text-[#999] leading-tight mt-0.5 line-clamp-1">
            {authorHeadline}
          </p>
          <p className="text-xs text-[#666] dark:text-[#999] leading-tight mt-0.5 flex items-center gap-1">
            {postedAt} · <Globe className="h-3 w-3" />
          </p>
        </div>
        <button className="text-[#666] dark:text-[#999] hover:text-[#191919] dark:hover:text-white transition-colors p-1">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pt-3 pb-2">
        <div className="text-sm text-[#191919] dark:text-[#e8e8e8] leading-relaxed space-y-2">
          {displayParagraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
        {truncated && (
          <button
            onClick={() => setShowFull(true)}
            className="text-sm text-[#666] dark:text-[#999] hover:text-[#0a66c2] dark:hover:text-[#70b5f9] font-medium mt-1"
          >
            …mehr anzeigen
          </button>
        )}
        {showFull && isLong && (
          <button
            onClick={() => setShowFull(false)}
            className="text-sm text-[#666] dark:text-[#999] hover:text-[#0a66c2] dark:hover:text-[#70b5f9] font-medium mt-1"
          >
            Weniger anzeigen
          </button>
        )}
      </div>

      {/* Engagement summary */}
      {(likeCount > 0 || commentCount > 0 || shareCount > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-xs text-[#666] dark:text-[#999]">
          <div className="flex items-center gap-1">
            {likeCount > 0 && (
              <>
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#0a66c2] text-white text-[8px]">👍</span>
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

      {/* Divider */}
      <div className="mx-4 border-t border-[#e0e0e0] dark:border-[#333]" />

      {/* Action bar */}
      <div className="flex items-center justify-around px-2 py-1">
        {[
          { icon: ThumbsUp, label: 'Gefällt mir' },
          { icon: MessageCircle, label: 'Kommentieren' },
          { icon: Repeat2, label: 'Reposten' },
          { icon: Send, label: 'Senden' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-md text-xs font-medium text-[#666] dark:text-[#999] hover:text-[#191919] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
