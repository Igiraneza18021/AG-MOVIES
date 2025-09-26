-- Create storage bucket for movie videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'movie-videos',
  'movie-videos',
  true,
  5368709120, -- 5GB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv']
);

-- Create storage policy for public read access
CREATE POLICY "Public read access for movie videos" ON storage.objects
FOR SELECT USING (bucket_id = 'movie-videos');

-- Create storage policy for authenticated upload
CREATE POLICY "Authenticated upload for movie videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'movie-videos');

-- Create storage policy for authenticated update
CREATE POLICY "Authenticated update for movie videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'movie-videos');

-- Create storage policy for authenticated delete
CREATE POLICY "Authenticated delete for movie videos" ON storage.objects
FOR DELETE USING (bucket_id = 'movie-videos');
