"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, X, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { MovieWithCategories } from "@/lib/types"

interface EditMovieDialogProps {
  movie: MovieWithCategories
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface UploadStatus {
  video?: "idle" | "uploading" | "success" | "error"
  trailer?: "idle" | "uploading" | "success" | "error"
}

export function EditMovieDialog({ movie, open, onOpenChange, onSuccess }: EditMovieDialogProps) {
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({})
  const [uploadProgress, setUploadProgress] = useState({ video: 0, trailer: 0 })
  const [allCategories, setAllCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    release_year: "",
    duration_minutes: "",
    genre: "",
    rating: "",
    poster_url: "",
    backdrop_url: "",
    video_url: "",
    trailer_url: "",
    type: "movie" as "movie" | "tv",
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [trailerFile, setTrailerFile] = useState<File | null>(null)

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || "",
        description: movie.description || "",
        release_year: movie.release_year?.toString() || "",
        duration_minutes: movie.duration_minutes?.toString() || "",
        genre: movie.genre || "",
        rating: movie.rating?.toString() || "",
        poster_url: movie.poster_url || "",
        backdrop_url: movie.backdrop_url || "",
        video_url: movie.video_url || "",
        trailer_url: movie.trailer_url || "",
        type: movie.type,
      })
      // Prefill selected categories from movie prop; our type exposes categories?: Category[]
      const idsFromMovie = (movie as any)?.categories?.map((c: any) => c?.id).filter(Boolean)
      if (Array.isArray(idsFromMovie)) setSelectedCategoryIds(idsFromMovie)
    }
  }, [movie])

  // Load categories when dialog opens
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("categories").select("id,name,slug").order("name")
      if (data) setAllCategories(data)
    }
    if (open) fetchCategories()
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "video" | "trailer") => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov", "video/wmv"]
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid video file (MP4, WebM, OGG, AVI, MOV, WMV)")
        return
      }

      // Validate file size (5GB limit)
      const maxSize = 5 * 1024 * 1024 * 1024 // 5GB
      if (file.size > maxSize) {
        alert("File size must be less than 5GB")
        return
      }

      if (type === "video") {
        setVideoFile(file)
        setUploadStatus((prev) => ({ ...prev, video: "idle" }))
      } else {
        setTrailerFile(file)
        setUploadStatus((prev) => ({ ...prev, trailer: "idle" }))
      }
    }
  }

  const uploadFile = async (file: File, movieId: string, type: "video" | "trailer") => {
    const formData = new FormData()
    formData.append(type, file)
    formData.append("movieId", movieId)
    formData.append("type", type)

    setUploadStatus((prev) => ({ ...prev, [type]: "uploading" }))
    setUploadProgress((prev) => ({ ...prev, [type]: 0 }))

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => ({
          ...prev,
          [type]: Math.min(prev[type] + Math.random() * 20, 90),
        }))
      }, 500)

      const response = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      if (result.success) {
        setUploadStatus((prev) => ({ ...prev, [type]: "success" }))
        setUploadProgress((prev) => ({ ...prev, [type]: 100 }))
        return true
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      console.error(`${type} upload error:`, error)
      setUploadStatus((prev) => ({ ...prev, [type]: "error" }))
      setUploadProgress((prev) => ({ ...prev, [type]: 0 }))
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    // First, update the basic movie data
    const movieData = {
      ...formData,
      release_year: formData.release_year ? Number.parseInt(formData.release_year) : null,
      duration_minutes: formData.duration_minutes ? Number.parseInt(formData.duration_minutes) : null,
      rating: formData.rating ? Number.parseFloat(formData.rating) : null,
      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase.from("movies").update(movieData).eq("id", movie.id)

    if (updateError) {
      console.error("Error updating movie:", updateError)
      alert("Error updating movie")
      setLoading(false)
      return
    }

    // Update category links
    {
      // Remove existing links then insert new selection
      const { error: delError } = await supabase.from("movie_categories").delete().eq("movie_id", movie.id)
      if (delError) {
        console.error("Error clearing category links:", delError)
      }
      if (selectedCategoryIds.length > 0) {
        const linkRows = selectedCategoryIds.map((category_id) => ({ movie_id: movie.id, category_id }))
        const { error: linkError } = await supabase.from("movie_categories").insert(linkRows)
        if (linkError) {
          console.error("Error linking categories:", linkError)
        }
      }
    }

    // Upload new video files if provided
    let uploadSuccess = true

    if (videoFile) {
      const success = await uploadFile(videoFile, movie.id, "video")
      if (!success) uploadSuccess = false
    }

    if (trailerFile) {
      const success = await uploadFile(trailerFile, movie.id, "trailer")
      if (!success) uploadSuccess = false
    }

    if (uploadSuccess) {
      onSuccess()
      onOpenChange(false)
      // Reset upload states
      setVideoFile(null)
      setTrailerFile(null)
      setUploadStatus({})
      setUploadProgress({ video: 0, trailer: 0 })
    } else {
      alert("Movie updated but some file uploads failed. You can edit again to retry uploads.")
    }

    setLoading(false)
  }

  const removeFile = (type: "video" | "trailer") => {
    if (type === "video") {
      setVideoFile(null)
    } else {
      setTrailerFile(null)
    }
    setUploadStatus((prev) => ({ ...prev, [type]: undefined }))
    setUploadProgress((prev) => ({ ...prev, [type]: 0 }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "uploading":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Movie/TV Show</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background border-border"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "movie" | "tv") => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="tv">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-background border-border"
              rows={3}
            />
          </div>

          {/* Release Year and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="release_year">Release Year</Label>
              <Input
                id="release_year"
                type="number"
                value={formData.release_year}
                onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                className="bg-background border-border"
              />
            </div>

            <div>
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Genre and Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">Genre</Label>
              <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Action">Action</SelectItem>
                  <SelectItem value="Comedy">Comedy</SelectItem>
                  <SelectItem value="Drama">Drama</SelectItem>
                  <SelectItem value="Horror">Horror</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                  <SelectItem value="Thriller">Thriller</SelectItem>
                  <SelectItem value="Documentary">Documentary</SelectItem>
                  <SelectItem value="Animation">Animation</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rating">Rating (0-10)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label>Categories</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {allCategories.map((cat) => {
                const checked = selectedCategoryIds.includes(cat.id)
                return (
                  <label key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(val) => {
                        const isChecked = Boolean(val)
                        setSelectedCategoryIds((prev) => {
                          if (isChecked) return [...new Set([...prev, cat.id])]
                          return prev.filter((id) => id !== cat.id)
                        })
                      }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                )
              })}
              {allCategories.length === 0 && (
                <span className="text-sm text-muted-foreground">No categories found</span>
              )}
            </div>
          </div>

          {/* Poster URL */}
          <div>
            <Label htmlFor="poster_url">Poster URL</Label>
            <Input
              id="poster_url"
              type="url"
              value={formData.poster_url}
              onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              className="bg-background border-border"
            />
          </div>

          {/* Backdrop URL */}
          <div>
            <Label htmlFor="backdrop_url">Backdrop URL</Label>
            <Input
              id="backdrop_url"
              type="url"
              value={formData.backdrop_url}
              onChange={(e) => setFormData({ ...formData, backdrop_url: e.target.value })}
              className="bg-background border-border"
            />
          </div>

          {/* Video and Trailer File Upload Sections */}
          <div className="space-y-4">
            {/* Current Video Status */}
            {(movie.video_file_path || movie.video_url) && (
              <div className="space-y-2">
                <Label>Current Video</Label>
                <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{movie.video_file_path ? "Uploaded file" : "External URL"}</span>
                    {movie.video_url && (
                      <a
                        href={movie.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Video File Upload */}
            <div>
              <Label>Replace Video File</Label>
              <div className="mt-2">
                {!videoFile ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload new video file (MP4, WebM, OGG, AVI, MOV, WMV)
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">Max size: 5GB</p>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, "video")}
                      className="hidden"
                      id="video-upload"
                    />
                    <Label htmlFor="video-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="pointer-events-none bg-transparent">
                        Choose Video File
                      </Button>
                    </Label>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(uploadStatus.video)}
                        <span className="text-sm font-medium">{videoFile.name}</span>
                        <span className="text-xs text-muted-foreground">({formatFileSize(videoFile.size)})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("video")}
                        disabled={uploadStatus.video === "uploading"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {uploadStatus.video === "uploading" && <Progress value={uploadProgress.video} className="h-2" />}
                  </div>
                )}
              </div>
            </div>

            {/* Current Trailer Status */}
            {(movie.trailer_file_path || movie.trailer_url) && (
              <div className="space-y-2">
                <Label>Current Trailer</Label>
                <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{movie.trailer_file_path ? "Uploaded file" : "External URL"}</span>
                    {movie.trailer_url && (
                      <a
                        href={movie.trailer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Trailer File Upload */}
            <div>
              <Label>Replace Trailer File (Optional)</Label>
              <div className="mt-2">
                {!trailerFile ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload new trailer file (MP4, WebM, OGG, AVI, MOV, WMV)
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">Max size: 5GB</p>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, "trailer")}
                      className="hidden"
                      id="trailer-upload"
                    />
                    <Label htmlFor="trailer-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" className="pointer-events-none bg-transparent">
                        Choose Trailer File
                      </Button>
                    </Label>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(uploadStatus.trailer)}
                        <span className="text-sm font-medium">{trailerFile.name}</span>
                        <span className="text-xs text-muted-foreground">({formatFileSize(trailerFile.size)})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile("trailer")}
                        disabled={uploadStatus.trailer === "uploading"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {uploadStatus.trailer === "uploading" && (
                      <Progress value={uploadProgress.trailer} className="h-2" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legacy URL fields for backward compatibility */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="video_url">Video URL (Legacy)</Label>
              <Input
                id="video_url"
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="bg-background border-border"
                placeholder="External video URL (if not uploading file)"
              />
            </div>

            <div>
              <Label htmlFor="trailer_url">Trailer URL (Legacy)</Label>
              <Input
                id="trailer_url"
                type="url"
                value={formData.trailer_url}
                onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                className="bg-background border-border"
                placeholder="External trailer URL (if not uploading file)"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadStatus.video === "uploading" || uploadStatus.trailer === "uploading"}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Updating..." : "Update Movie"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
