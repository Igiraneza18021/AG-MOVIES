-- Add new columns for file paths instead of URLs
ALTER TABLE movies 
ADD COLUMN video_file_path TEXT,
ADD COLUMN trailer_file_path TEXT;

-- Update existing movies to use file paths if they have URLs
-- This is optional - you can keep both for backward compatibility
