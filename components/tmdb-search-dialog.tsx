"use client"

import type React from "react"

import { useState } from "react"
import { Search, Plus, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { tmdbClient, type TMDBMovie } from "@/lib/tmdb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TMDBSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TMDBSearchDialog({ open, onOpenChange, onSuccess }: TMDBSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set())
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null)
  const [movieDetails, setMovieDetails] = useState<TMDBMovie | null>(null)

  const searchTMDB = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await tmdbClient.searchMulti(query)
      setSearchResults(response.results)
    } catch (error) {
      console.error("Error searching TMDB:", error)
      alert("Error searching TMDB. Please check if the API is configured.")
    }
    setLoading(false)
  }

  const getMovieDetails = async (movie: TMDBMovie) => {
    try {
      const details = await tmdbClient.getDetails(movie.id, movie.media_type)
      setMovieDetails(details)
      setSelectedMovie(movie)
    } catch (error) {
      console.error("Error getting movie details:", error)
    }
  }

  const addMovieFromTMDB = async (tmdbMovie: TMDBMovie, useDetails = false) => {
    setAddingIds((prev) => new Set(prev).add(tmdbMovie.id))

    const supabase = createClient()
    const movieData = useDetails && movieDetails ? movieDetails : tmdbMovie

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

    const insertData = {
      title: movieData.title,
      description: movieData.overview,
      release_year: movieData.release_date ? new Date(movieData.release_date).getFullYear() : null,
      duration_minutes: movieData.runtime || null,
      rating: movieData.vote_average,
      poster_url: tmdbClient.getImageUrl(movieData.poster_path),
      backdrop_url: tmdbClient.getImageUrl(movieData.backdrop_path, "w1280"),
      tmdb_id: movieData.id,
      type: movieData.media_type,
      genre: movieData.genres?.[0]?.name || null,
      trailer_url: movieData.videos?.[0] ? tmdbClient.getYouTubeUrl(movieData.videos[0].key) : null,
      video_file_path: null,
      trailer_file_path: null,
    }

    const { error } = await supabase.from("movies").insert([insertData])

    if (error) {
      console.error("Error adding movie from TMDB:", error)
      alert("Error adding movie")
    } else {
      onSuccess()
      if (useDetails) {
        setSelectedMovie(null)
        setMovieDetails(null)
      }
    }

    setAddingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(tmdbMovie.id)
      return newSet
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchTMDB(searchQuery)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-white max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search TMDB Database</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for movies and TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>

          {/* Movie Details Modal */}
          {selectedMovie && movieDetails && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="relative">
                  {movieDetails.backdrop_path && (
                    <div
                      className="h-64 bg-cover bg-center rounded-t-lg"
                      style={{
                        backgroundImage: `url(${tmdbClient.getImageUrl(movieDetails.backdrop_path, "w1280")})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black/50 rounded-t-lg" />
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    className="absolute top-4 right-4 text-white hover:bg-white/20"
                    onClick={() => {
                      setSelectedMovie(null)
                      setMovieDetails(null)
                    }}
                  >
                    ✕
                  </Button>

                  <div className="p-6">
                    <div className="flex gap-6">
                      {movieDetails.poster_path && (
                        <img
                          src={tmdbClient.getImageUrl(movieDetails.poster_path, "w500") || ""}
                          alt={movieDetails.title}
                          className="w-32 h-48 object-cover rounded"
                        />
                      )}

                      <div className="flex-1 space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">{movieDetails.title}</h2>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                            <span>
                              {movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : "N/A"}
                            </span>
                            <span>★ {movieDetails.vote_average.toFixed(1)}</span>
                            {movieDetails.runtime && <span>{movieDetails.runtime} min</span>}
                            <Badge variant="secondary" className="capitalize">
                              {movieDetails.media_type}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-gray-300">{movieDetails.overview}</p>

                        {movieDetails.genres && movieDetails.genres.length > 0 && (
                          <div>
                            <h3 className="text-white font-medium mb-2">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                              {movieDetails.genres.map((genre) => (
                                <Badge key={genre.id} variant="outline">
                                  {genre.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {movieDetails.cast && movieDetails.cast.length > 0 && (
                          <div>
                            <h3 className="text-white font-medium mb-2">Cast</h3>
                            <div className="flex flex-wrap gap-2">
                              {movieDetails.cast.slice(0, 5).map((actor) => (
                                <span key={actor.id} className="text-gray-300 text-sm">
                                  {actor.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {movieDetails.videos && movieDetails.videos.length > 0 && (
                          <div>
                            <h3 className="text-white font-medium mb-2">Trailer</h3>
                            <a
                              href={tmdbClient.getYouTubeUrl(movieDetails.videos[0].key)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:text-primary/80"
                            >
                              Watch on YouTube <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                          </div>
                        )}

                        <div className="flex gap-4 pt-4">
                          <Button
                            onClick={() => addMovieFromTMDB(selectedMovie, true)}
                            disabled={addingIds.has(selectedMovie.id)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {addingIds.has(selectedMovie.id) ? "Adding..." : "Add to Database"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="space-y-4">
            {searchResults.length > 0 && <p className="text-gray-400">Found {searchResults.length} results</p>}

            {searchResults.map((movie) => (
              <div key={movie.id} className="flex items-start space-x-4 p-4 bg-background rounded-lg">
                <img
                  src={tmdbClient.getImageUrl(movie.poster_path, "w200") || "/placeholder.svg?height=150&width=100"}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded cursor-pointer hover:opacity-80"
                  onClick={() => getMovieDetails(movie)}
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="text-white font-medium cursor-pointer hover:text-primary"
                        onClick={() => getMovieDetails(movie)}
                      >
                        {movie.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}</span>
                        <span>★ {movie.vote_average.toFixed(1)}</span>
                        <Badge variant="secondary" className="capitalize">
                          {movie.media_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => getMovieDetails(movie)}>
                        Details
                      </Button>
                      <Button
                        onClick={() => addMovieFromTMDB(movie)}
                        disabled={addingIds.has(movie.id)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {addingIds.has(movie.id) ? (
                          "Adding..."
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm line-clamp-2">{movie.overview}</p>
                </div>
              </div>
            ))}

            {searchQuery && searchResults.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-400">No results found for "{searchQuery}"</p>
                <p className="text-gray-500 text-sm mt-2">
                  Make sure the TMDB API key is configured in your environment variables
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
