"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, Filter, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MovieWithCategories, Category } from "@/lib/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [movies, setMovies] = useState<MovieWithCategories[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("title")

  useEffect(() => {
    fetchCategories()
    if (initialQuery) {
      searchMovies(initialQuery)
    }
  }, [initialQuery])

  const fetchCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("categories").select("*").order("name")
    if (data) setCategories(data)
  }

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      setMovies([])
      return
    }

    setLoading(true)
    const supabase = createClient()

    let queryBuilder = supabase
      .from("movies")
      .select(`
        *,
        movie_categories(
          categories(*)
        )
      `)
      .or(`title.ilike.%${query}%, description.ilike.%${query}%`)

    if (selectedGenre !== "all") {
      queryBuilder = queryBuilder.eq("genre", selectedGenre)
    }

    if (selectedType !== "all") {
      queryBuilder = queryBuilder.eq("type", selectedType)
    }

    const { data, error } = await queryBuilder.order(sortBy)

    if (error) {
      console.error("Search error:", error)
    } else {
      setMovies(data || [])
    }
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchMovies(searchQuery)
  }

  const filteredAndSortedMovies = useMemo(() => {
    const filtered = [...movies]

    // Sort movies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "year":
          return (b.release_year || 0) - (a.release_year || 0)
        case "title":
        default:
          return a.title.localeCompare(b.title)
      }
    })

    return filtered
  }, [movies, sortBy])

  const clearFilters = () => {
    setSelectedGenre("all")
    setSelectedType("all")
    setSortBy("title")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Search Movies & TV Shows</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for movies, TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-white"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filters:</span>
            </div>

            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="Action">Action</SelectItem>
                <SelectItem value="Comedy">Comedy</SelectItem>
                <SelectItem value="Drama">Drama</SelectItem>
                <SelectItem value="Horror">Horror</SelectItem>
                <SelectItem value="Romance">Romance</SelectItem>
                <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                <SelectItem value="Thriller">Thriller</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="tv">TV Shows</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>

            {(selectedGenre !== "all" || selectedType !== "all" || sortBy !== "title") && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          {searchQuery && (
            <p className="text-gray-400 mb-6">
              {loading ? "Searching..." : `Found ${filteredAndSortedMovies.length} results for "${searchQuery}"`}
            </p>
          )}

          {filteredAndSortedMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredAndSortedMovies.map((movie) => (
                <Link key={movie.id} href={`/movie/${movie.id}`} className="group">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-3">
                    <img
                      src={movie.poster_url || "/placeholder.svg?height=450&width=300&query=movie poster"}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {movie.title}
                    </h3>
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
                </Link>
              ))}
            </div>
          ) : searchQuery && !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No results found for "{searchQuery}"</p>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          ) : !searchQuery ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Start typing to search for movies and TV shows</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
