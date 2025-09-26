-- Create movies table for storing movie/TV show information
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  release_year INTEGER,
  duration_minutes INTEGER,
  genre TEXT,
  rating DECIMAL(3,1),
  poster_url TEXT,
  backdrop_url TEXT,
  video_url TEXT,
  trailer_url TEXT,
  tmdb_id INTEGER UNIQUE,
  type TEXT CHECK (type IN ('movie', 'tv')) DEFAULT 'movie',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table for organizing content
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create movie_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS movie_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id, category_id)
);

-- Create cast table for storing actor/director information
CREATE TABLE IF NOT EXISTS cast_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT, -- 'actor', 'director', 'producer', etc.
  character_name TEXT, -- for actors
  profile_image_url TEXT,
  tmdb_id INTEGER UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create movie_cast junction table
CREATE TABLE IF NOT EXISTS movie_cast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  cast_member_id UUID REFERENCES cast_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'actor', 'director', etc.
  character_name TEXT, -- for actors
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id, cast_member_id, role)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_type ON movies(type);
CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating);
CREATE INDEX IF NOT EXISTS idx_movies_release_year ON movies(release_year);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movie_categories_movie_id ON movie_categories(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_categories_category_id ON movie_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_movie_cast_movie_id ON movie_cast(movie_id);
CREATE INDEX IF NOT EXISTS idx_cast_members_tmdb_id ON cast_members(tmdb_id);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Action', 'action', 'High-energy movies with intense sequences'),
  ('Comedy', 'comedy', 'Light-hearted and humorous content'),
  ('Drama', 'drama', 'Serious, realistic storytelling'),
  ('Horror', 'horror', 'Scary and suspenseful content'),
  ('Romance', 'romance', 'Love stories and romantic comedies'),
  ('Sci-Fi', 'sci-fi', 'Science fiction and futuristic themes'),
  ('Thriller', 'thriller', 'Suspenseful and exciting content'),
  ('Documentary', 'documentary', 'Non-fiction educational content'),
  ('Animation', 'animation', 'Animated movies and shows'),
  ('Fantasy', 'fantasy', 'Magical and fantastical stories')
ON CONFLICT (slug) DO NOTHING;
