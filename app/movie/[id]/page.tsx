import { notFound } from "next/navigation"
import Link from "next/link"
import { Play, ThumbsUp, Share, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { MovieCarousel } from "@/components/movie-carousel"
import { WatchlistButton } from "@/components/watchlist-button"
import type { MovieWithCategories } from "@/lib/types"

async function getMovie(id: string): Promise<MovieWithCategories | null> {
  const supabase = await createClient()

  const { data: movie, error } = await supabase
    .from("movies")
    .select(`
      *,
      movie_categories(
        categories(*)
      ),
      movie_cast(
        cast_members(*),
        role,
        character_name,
        order_index
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching movie:", error)
    return null
  }

  return movie
}

async function getSimilarMovies(movieId: string, genre: string): Promise<MovieWithCategories[]> {
  const supabase = await createClient()

  const { data: movies, error } = await supabase
    .from("movies")
    .select("*")
    .eq("genre", genre)
    .neq("id", movieId)
    .limit(10)

  if (error) {
    console.error("Error fetching similar movies:", error)
    return []
  }

  return movies || []
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const movie = await getMovie(id)

  if (!movie) {
    notFound()
  }

  const similarMovies = movie.genre ? await getSimilarMovies(movie.id, movie.genre) : []

  // Extract cast information
  const cast =
    movie.movie_cast?.map((mc: any) => ({
      ...mc.cast_members,
      role: mc.role,
      character_name: mc.character_name,
      order_index: mc.order_index,
    })) || []

  const actors = cast.filter((c: any) => c.role === "actor").sort((a: any, b: any) => a.order_index - b.order_index)
  const directors = cast.filter((c: any) => c.role === "director")

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <div className="relative h-[70vh] flex items-end">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${movie.backdrop_url || "/placeholder.svg?height=720&width=1280"}')`,
            }}
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-3xl space-y-6">
            <Link href="/home">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight text-balance">{movie.title}</h1>

            <div className="flex items-center space-x-4 text-sm text-gray-300">
              {movie.rating && (
                <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  ★ {movie.rating}
                </span>
              )}
              {movie.release_year && <span>{movie.release_year}</span>}
              {movie.duration_minutes && (
                <span>
                  {Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m
                </span>
              )}
              <Badge variant="secondary" className="bg-gray-700 text-white">
                {movie.type === "movie" ? "Movie" : "TV Show"}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Link href={`/watch/${movie.id}`}>
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold px-8">
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  Play
                </Button>
              </Link>

              <WatchlistButton movie={movie} />

              <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 p-3">
                <ThumbsUp className="h-6 w-6" />
              </Button>

              <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 p-3">
                <Share className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{movie.description}</p>
            </div>

            {/* Cast */}
            {actors.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {actors.slice(0, 8).map((actor: any) => (
                    <div key={actor.id} className="text-center">
                      <div className="aspect-square rounded-full overflow-hidden bg-gray-700 mb-2">
                        <img
                          src={actor.profile_image_url || "/placeholder.svg?height=150&width=150&query=actor profile"}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-white font-medium text-sm">{actor.name}</h3>
                      {actor.character_name && <p className="text-gray-400 text-xs">{actor.character_name}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Movie Info */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                {directors.length > 0 && (
                  <div>
                    <span className="text-gray-400">Director:</span>
                    <span className="text-white ml-2">{directors.map((d: any) => d.name).join(", ")}</span>
                  </div>
                )}
                {movie.genre && (
                  <div>
                    <span className="text-gray-400">Genre:</span>
                    <span className="text-white ml-2">{movie.genre}</span>
                  </div>
                )}
                {movie.release_year && (
                  <div>
                    <span className="text-gray-400">Release Year:</span>
                    <span className="text-white ml-2">{movie.release_year}</span>
                  </div>
                )}
                {movie.duration_minutes && (
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white ml-2">
                      {Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            {movie.movie_categories && movie.movie_categories.length > 0 && (
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.movie_categories.map((mc: any) => (
                    <Badge key={mc.categories.id} variant="secondary" className="bg-primary/20 text-primary">
                      {mc.categories.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="mt-16">
            <MovieCarousel title="More Like This" movies={similarMovies} />
          </div>
        )}
      </div>
    </div>
  )
}
