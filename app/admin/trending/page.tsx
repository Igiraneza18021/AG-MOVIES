"use client"

import { useState, useEffect } from "react"
import { Plus, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { tmdbClient, type TMDBMovie } from "@/lib/tmdb"
import { AdminNavigation } from "@/components/admin-navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TrendingPage() {
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set())
  const [timeWindow, setTimeWindow] = useState<"day" | "week">("week")
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all")

  useEffect(() => {
    fetchTrending()
  }, [timeWindow, mediaType])

  const fetchTrending = async () => {
    setLoading(true)
    try {
      const response = await tmdbClient.getTrending(timeWindow, mediaType)
      setTrendingMovies(response.results)
    } catch (error) {
      console.error("Error fetching trending:", error)
    }
    setLoading(false)
  }

  const addMovieFromTMDB = async (tmdbMovie: TMDBMovie) => {
    setAddingIds((prev) => new Set(prev).add(tmdbMovie.id))

    const supabase = createClient()

    // Check if movie already exists
    const { data: existingMovie } = await supabase.from("movies").select("id").eq("tmdb_id", tmdbMovie.id).single()

    if (existingMovie) {
      alert("This movie is already in your database")
      setAddingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(tmdbMovie.id)
        return newSet
      })
      return
    }

    const movieData = {
      title: tmdbMovie.title,
      description: tmdbMovie.overview,
      release_year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : null,
      rating: tmdbMovie.vote_average,
      poster_url: tmdbClient.getImageUrl(tmdbMovie.poster_path),
      backdrop_url: tmdbClient.getImageUrl(tmdbMovie.backdrop_path, "w1280"),
      tmdb_id: tmdbMovie.id,
      type: tmdbMovie.media_type,
    }

    const { error } = await supabase.from("movies").insert([movieData])

    if (error) {
      console.error("Error adding movie from TMDB:", error)
      alert("Error adding movie")
    } else {
      alert("Movie added successfully!")
    }

    setAddingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(tmdbMovie.id)
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <TrendingUp className="h-8 w-8 mr-3 text-primary" />
              Trending Content
            </h1>
            <p className="text-gray-400">Discover what's trending on TMDB and add to your platform</p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={timeWindow} onValueChange={(value: "day" | "week") => setTimeWindow(value)}>
              <SelectTrigger className="w-32 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mediaType} onValueChange={(value: "all" | "movie" | "tv") => setMediaType(value)}>
              <SelectTrigger className="w-32 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="tv">TV Shows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trending Content */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">
              Trending {mediaType === "all" ? "Content" : mediaType === "movie" ? "Movies" : "TV Shows"} -{" "}
              {timeWindow === "day" ? "Today" : "This Week"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading trending content...</p>
              </div>
            ) : trendingMovies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No trending content found</p>
                <p className="text-gray-500 text-sm mt-2">Make sure the TMDB API key is configured</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingMovies.map((movie, index) => (
                  <div key={movie.id} className="bg-background rounded-lg p-4 relative">
                    {/* Trending Rank */}
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                      #{index + 1}
                    </div>

                    <div className="flex space-x-4">
                      <img
                        src={
                          tmdbClient.getImageUrl(movie.poster_path, "w200") || "/placeholder.svg?height=150&width=100"
                        }
                        alt={movie.title}
                        className="w-20 h-30 object-cover rounded"
                      />

                      <div className="flex-1 space-y-2">
                        <h3 className="text-white font-medium line-clamp-2">{movie.title}</h3>

                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}</span>
                          <span>★ {movie.vote_average.toFixed(1)}</span>
                          <Badge variant="secondary" className="capitalize text-xs">
                            {movie.media_type}
                          </Badge>
                        </div>

                        <p className="text-gray-300 text-sm line-clamp-3">{movie.overview}</p>

                        <Button
                          size="sm"
                          onClick={() => addMovieFromTMDB(movie)}
                          disabled={addingIds.has(movie.id)}
                          className="bg-primary hover:bg-primary/90 w-full"
                        >
                          {addingIds.has(movie.id) ? (
                            "Adding..."
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Database
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
