
INSERT INTO storage.buckets (id, name, public)
VALUES ('briefings', 'briefings', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can read own briefings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'briefings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read briefings"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'briefings');

CREATE POLICY "Service role can manage briefings"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'briefings');
