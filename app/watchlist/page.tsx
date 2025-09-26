"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Trash2, Play, Info } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWatchlist } from "@/hooks/use-watchlist"
import type { MovieWithCategories } from "@/lib/types"

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist()
  const [movies, setMovies] = useState<MovieWithCategories[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you'd fetch movie details from the database
    // For now, we'll simulate this with the watchlist data
    const fetchMovieDetails = async () => {
      setLoading(true)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMovies(watchlist)
      setLoading(false)
    }

    fetchMovieDetails()
  }, [watchlist])

  const handleRemove = (movieId: string) => {
    removeFromWatchlist(movieId)
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to remove all items from your watchlist?")) {
      clearWatchlist()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-400">Loading your watchlist...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
            <p className="text-gray-400">
              {movies.length === 0 ? "Your watchlist is empty" : `${movies.length} items in your watchlist`}
            </p>
          </div>

          {movies.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-red-400 border-red-400 hover:bg-red-400/10 bg-transparent"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Watchlist Content */}
        {movies.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Your watchlist is empty</h2>
              <p className="text-gray-400 mb-8">
                Add movies and TV shows to your watchlist to keep track of what you want to watch later.
              </p>
              <Link href="/home">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Browse Content
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid View */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <div key={movie.id} className="group relative">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-3">
                    <img
                      src={movie.poster_url || "/placeholder.svg?height=450&width=300&query=movie poster"}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex space-x-2">
                        <Link href={`/watch/${movie.id}`}>
                          <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                            <Play className="h-4 w-4 fill-current" />
                          </Button>
                        </Link>
                        <Link href={`/movie/${movie.id}`}>
                          <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                            <Info className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-400/20"
                          onClick={() => handleRemove(movie.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Remove Button (always visible on mobile) */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-black/50 text-red-400 hover:bg-red-400/20 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemove(movie.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Link href={`/movie/${movie.id}`}>
                      <h3 className="text-white font-medium hover:text-primary transition-colors line-clamp-2">
                        {movie.title}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{movie.release_year}</span>
                      {movie.rating && <span className="text-yellow-500">★ {movie.rating}</span>}
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {movie.type === "movie" ? "Movie" : "TV"}
                      </Badge>
                      {movie.genre && (
                        <Badge variant="outline" className="text-xs">
                          {movie.genre}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
