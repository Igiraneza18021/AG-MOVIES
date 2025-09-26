-- Add sample video URLs to existing movies for demonstration
-- In production, these would be actual streaming URLs

UPDATE movies 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    trailer_url = 'https://www.youtube.com/watch?v=YE7VzlLtp-4'
WHERE title = 'The Matrix';

UPDATE movies 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    trailer_url = 'https://www.youtube.com/watch?v=TLkA0RELQ1g'
WHERE title = 'Inception';

UPDATE movies 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    trailer_url = 'https://www.youtube.com/watch?v=ZlNFpri-Y40'
WHERE title = 'Interstellar';

UPDATE movies 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    trailer_url = 'https://www.youtube.com/watch?v=2LqzF5WauAw'
WHERE title = 'The Dark Knight';

UPDATE movies 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    trailer_url = 'https://www.youtube.com/watch?v=QhBnZ6NPOY0'
WHERE title = 'Pulp Fiction';

-- Add some sample movies with video URLs if they don't exist
INSERT INTO movies (title, description, release_year, duration_minutes, genre, rating, type, poster_url, backdrop_url, video_url, trailer_url)
VALUES 
  (
    'Big Buck Bunny',
    'A large and lovable rabbit deals with three tiny bullies, led by a flying squirrel, who are determined to squelch his happiness.',
    2008,
    10,
    'Animation',
    7.2,
    'movie',
    '/placeholder.svg?height=450&width=300',
    '/placeholder.svg?height=720&width=1280',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://www.youtube.com/watch?v=YE7VzlLtp-4'
  ),
  (
    'Elephants Dream',
    'The story of two strange characters exploring a capricious and seemingly infinite machine.',
    2006,
    11,
    'Animation',
    6.8,
    'movie',
    '/placeholder.svg?height=450&width=300',
    '/placeholder.svg?height=720&width=1280',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://www.youtube.com/watch?v=TLkA0RELQ1g'
  )
ON CONFLICT (title) DO NOTHING;
