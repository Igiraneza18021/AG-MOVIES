import { createClient } from "@/lib/supabase/server"
import type { MovieWithCategories } from "@/lib/types"
import { HeroSection } from "@/components/hero-section"
import { MovieCarousel } from "@/components/movie-carousel"
import { ContinueWatching } from "@/components/continue-watching"
import { Navigation } from "@/components/navigation"

async function getMovies(): Promise<MovieWithCategories[]> {
  const supabase = await createClient()

  const { data: movies, error } = await supabase
    .from("movies")
    .select(`
      *,
      movie_categories(
        categories(*)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching movies:", error)
    return []
  }

  return movies || []
}

async function getMoviesByCategory(categorySlug: string): Promise<MovieWithCategories[]> {
  const supabase = await createClient()

  const { data: movies, error } = await supabase
    .from("movies")
    .select(`
      *,
      movie_categories!inner(
        categories!inner(slug)
      )
    `)
    .eq("movie_categories.categories.slug", categorySlug)
    .limit(10)

  if (error) {
    console.error(`Error fetching ${categorySlug} movies:`, error)
    return []
  }

  return movies || []
}

export default async function HomePage() {
  const [allMovies, actionMovies, dramaMovies, sciFiMovies] = await Promise.all([
    getMovies(),
    getMoviesByCategory("action"),
    getMoviesByCategory("drama"),
    getMoviesByCategory("sci-fi"),
  ])

  // Get featured movie (first movie for hero section)
  const featuredMovie = allMovies[0]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {featuredMovie && <HeroSection movie={featuredMovie} />}

      <div className="relative z-10 -mt-32 space-y-12 pb-20">
        <ContinueWatching />

        {allMovies.length > 0 && <MovieCarousel title="Trending Now" movies={allMovies.slice(0, 10)} />}

        {actionMovies.length > 0 && <MovieCarousel title="Action & Adventure" movies={actionMovies} />}

        {dramaMovies.length > 0 && <MovieCarousel title="Critically Acclaimed Dramas" movies={dramaMovies} />}

        {sciFiMovies.length > 0 && <MovieCarousel title="Sci-Fi & Fantasy" movies={sciFiMovies} />}
      </div>
    </div>
  )
}
