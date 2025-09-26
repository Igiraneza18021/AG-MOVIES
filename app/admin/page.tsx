"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, SearchIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminNavigation } from "@/components/admin-navigation"
import { AddMovieDialog } from "@/components/add-movie-dialog"
import { EditMovieDialog } from "@/components/edit-movie-dialog"
import { TMDBSearchDialog } from "@/components/tmdb-search-dialog"
import type { MovieWithCategories } from "@/lib/types"

export default function AdminDashboard() {
  const [movies, setMovies] = useState<MovieWithCategories[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showTMDBDialog, setShowTMDBDialog] = useState(false)
  const [editingMovie, setEditingMovie] = useState<MovieWithCategories | null>(null)

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
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
    } else {
      setMovies(data || [])
    }
    setLoading(false)
  }

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return

    const supabase = createClient()
    const { error } = await supabase.from("movies").delete().eq("id", movieId)

    if (error) {
      console.error("Error deleting movie:", error)
      alert("Error deleting movie")
    } else {
      fetchMovies()
    }
  }

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
            <p className="text-gray-400">Manage movies and TV shows in your streaming platform</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowTMDBDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <SearchIcon className="h-4 w-4 mr-2" />
              Search TMDB
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Movie
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Movies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{movies.filter((m) => m.type === "movie").length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total TV Shows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{movies.filter((m) => m.type === "tv").length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {movies.length > 0
                  ? (movies.reduce((sum, m) => sum + (m.rating || 0), 0) / movies.length).toFixed(1)
                  : "0.0"}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{movies.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search movies and shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-white"
            />
          </div>
        </div>

        {/* Movies Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">All Content ({filteredMovies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading movies...</p>
              </div>
            ) : filteredMovies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No movies found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Genre</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Year</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Rating</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovies.map((movie) => (
                      <tr key={movie.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={movie.poster_url || "/placeholder.svg?height=60&width=40&query=movie poster"}
                              alt={movie.title}
                              className="w-10 h-15 object-cover rounded"
                            />
                            <div>
                              <p className="text-white font-medium">{movie.title}</p>
                              <p className="text-gray-400 text-sm line-clamp-1">{movie.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="capitalize">
                            {movie.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{movie.genre || "N/A"}</td>
                        <td className="py-3 px-4 text-gray-300">{movie.release_year || "N/A"}</td>
                        <td className="py-3 px-4">
                          {movie.rating ? (
                            <span className="text-yellow-500">★ {movie.rating}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMovie(movie)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMovie(movie.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddMovieDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={fetchMovies} />

      <TMDBSearchDialog open={showTMDBDialog} onOpenChange={setShowTMDBDialog} onSuccess={fetchMovies} />

      {editingMovie && (
        <EditMovieDialog
          movie={editingMovie}
          open={!!editingMovie}
          onOpenChange={(open) => !open && setEditingMovie(null)}
          onSuccess={fetchMovies}
        />
      )}
    </div>
  )
}
