
-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- RLS policies for storage
CREATE POLICY "Users can upload own pictures" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own pictures" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own pictures" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read access for profile pictures" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-pictures');

-- Add avatar columns
ALTER TABLE profiles
  ADD COLUMN avatar_url_1 text,
  ADD COLUMN avatar_url_2 text,
  ADD COLUMN avatar_url_3 text;
