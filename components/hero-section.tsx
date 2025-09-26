import Link from "next/link"
import { Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WatchlistButton } from "@/components/watchlist-button"
import type { MovieWithCategories } from "@/lib/types"

interface HeroSectionProps {
  movie: MovieWithCategories
}

export function HeroSection({ movie }: HeroSectionProps) {
  return (
    <div className="relative h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${movie.backdrop_url || "/placeholder.svg?height=1080&width=1920"}')`,
          }}
        />
        <div className="absolute inset-0 hero-gradient-left" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight text-balance">{movie.title}</h1>

          <div className="flex items-center space-x-4 text-sm text-gray-300">
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

          <p className="text-lg text-gray-200 leading-relaxed text-pretty max-w-xl">{movie.description}</p>

          <div className="flex items-center space-x-4">
            <Link href={`/watch/${movie.id}`}>
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold px-8">
                <Play className="h-5 w-5 mr-2 fill-current" />
                Play
              </Button>
            </Link>

            <Link href={`/movie/${movie.id}`}>
              <Button
                variant="secondary"
                size="lg"
                className="bg-gray-600/80 text-white hover:bg-gray-600 font-semibold px-8"
              >
                <Info className="h-5 w-5 mr-2" />
                More Info
              </Button>
            </Link>

            <WatchlistButton movie={movie} />
          </div>
        </div>
      </div>
    </div>
  )
}
