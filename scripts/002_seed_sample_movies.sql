-- Insert sample movies for testing
INSERT INTO movies (title, description, release_year, duration_minutes, genre, rating, poster_url, backdrop_url, type, tmdb_id) VALUES
  (
    'The Matrix',
    'A computer programmer discovers that reality as he knows it is actually a simulation, and he must join a rebellion to free humanity.',
    1999,
    136,
    'Action',
    8.7,
    '/placeholder.svg?height=600&width=400',
    '/placeholder.svg?height=400&width=800',
    'movie',
    603
  ),
  (
    'Inception',
    'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    2010,
    148,
    'Sci-Fi',
    8.8,
    '/placeholder.svg?height=600&width=400',
    '/placeholder.svg?height=400&width=800',
    'movie',
    27205
  ),
  (
    'Stranger Things',
    'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    2016,
    50,
    'Horror',
    8.7,
    '/placeholder.svg?height=600&width=400',
    '/placeholder.svg?height=400&width=800',
    'tv',
    66732
  ),
  (
    'The Dark Knight',
    'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    2008,
    152,
    'Action',
    9.0,
    '/placeholder.svg?height=600&width=400',
    '/placeholder.svg?height=400&width=800',
    'movie',
    155
  ),
  (
    'Breaking Bad',
    'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    2008,
    47,
    'Drama',
    9.5,
    '/placeholder.svg?height=600&width=400',
    '/placeholder.svg?height=400&width=800',
    'tv',
    1396
  ),
  (
    'Pulp Fiction',
    'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    1994,
    154,
    'Drama',
    8.9,
    '/placeholder.svg?height=600&width=400',
    '/placeholder.svg?height=400&width=800',
    'movie',
    680
  )
ON CONFLICT (tmdb_id) DO NOTHING;

-- Link movies to categories
INSERT INTO movie_categories (movie_id, category_id)
SELECT m.id, c.id
FROM movies m, categories c
WHERE (m.title = 'The Matrix' AND c.slug IN ('action', 'sci-fi'))
   OR (m.title = 'Inception' AND c.slug IN ('sci-fi', 'thriller'))
   OR (m.title = 'Stranger Things' AND c.slug IN ('horror', 'thriller'))
   OR (m.title = 'The Dark Knight' AND c.slug IN ('action', 'thriller'))
   OR (m.title = 'Breaking Bad' AND c.slug IN ('drama', 'thriller'))
   OR (m.title = 'Pulp Fiction' AND c.slug IN ('drama', 'action'))
ON CONFLICT (movie_id, category_id) DO NOTHING;
