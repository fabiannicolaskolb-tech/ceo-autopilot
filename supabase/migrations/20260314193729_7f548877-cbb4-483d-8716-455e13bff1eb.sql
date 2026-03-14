
CREATE TABLE public.voice_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id text,
  transcript text,
  key_points jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice_insights" ON public.voice_insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice_insights" ON public.voice_insights
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own voice_insights" ON public.voice_insights
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
