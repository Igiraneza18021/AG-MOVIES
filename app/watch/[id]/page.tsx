import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { EnhancedVideoPlayer } from "@/components/enhanced-video-player"
import type { MovieWithCategories } from "@/lib/types"

async function getMovie(id: string): Promise<MovieWithCategories | null> {
  const supabase = await createClient()

  const { data: movie, error } = await supabase.from("movies").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching movie:", error)
    return null
  }

  return movie
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { id } = await params
  const { t } = await searchParams
  const movie = await getMovie(id)

  if (!movie) {
    notFound()
  }

  const startTime = t ? Number.parseInt(t) : 0

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player */}
      <div className="relative">
        <EnhancedVideoPlayer movie={movie} startTime={startTime} />

        {/* Back Button Overlay */}
        <div className="absolute top-4 left-4 z-50">
          <Link href={`/movie/${movie.id}`}>
            <Button variant="ghost" className="text-white hover:bg-white/20 bg-black/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Movie Info Below Video */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-4">{movie.title}</h1>

          <div className="flex items-center space-x-4 text-sm text-gray-300 mb-6">
            {movie.rating && (
              <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-semibold">★ {movie.rating}</span>
            )}
            {movie.release_year && <span>{movie.release_year}</span>}
            {movie.duration_minutes && (
              <span>
                {Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m
              </span>
            )}
            {movie.genre && <span className="bg-gray-700 px-2 py-1 rounded text-xs">{movie.genre}</span>}
          </div>

          {movie.description && <p className="text-gray-300 leading-relaxed text-lg max-w-3xl">{movie.description}</p>}
        </div>
      </div>
    </div>
  )
}
