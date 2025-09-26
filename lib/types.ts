export interface Movie {
  id: string
  title: string
  description: string | null
  release_year: number | null
  duration_minutes: number | null
  genre: string | null
  rating: number | null
  poster_url: string | null
  backdrop_url: string | null
  video_url: string | null
  trailer_url: string | null
  video_file_path: string | null
  trailer_file_path: string | null
  tmdb_id: number | null
  type: "movie" | "tv"
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface CastMember {
  id: string
  name: string
  role: string | null
  character_name: string | null
  profile_image_url: string | null
  tmdb_id: number | null
  created_at: string
}

export interface MovieWithCategories extends Movie {
  categories?: Category[]
  cast?: CastMember[]
}
