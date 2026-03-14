-- Spalte für Content-Kategorisierung
ALTER TABLE public.posts
  ADD COLUMN content_category text
  CHECK (content_category IN ('Leadership', 'Industry Insights', 'Personal Story', 'Case Study', 'Question'));

-- Index für schnellere Analytics-Abfragen
CREATE INDEX idx_posts_user_metrics ON public.posts(user_id, status);