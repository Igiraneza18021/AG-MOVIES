"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MovieWithCategories } from "@/lib/types"

interface WatchProgress {
  movieId: string
  currentTime: number
  duration: number
  lastWatched: string
  movie?: MovieWithCategories
}

const CONTINUE_WATCHING_KEY = "AG Movies-continue-watching"

export function ContinueWatching() {
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([])

  useEffect(() => {
    // Load continue watching from localStorage
    const saved = localStorage.getItem(CONTINUE_WATCHING_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setContinueWatching(data.slice(0, 6)) // Show max 6 items
      } catch (error) {
        console.error("Error loading continue watching:", error)
      }
    }
  }, [])

  const removeFromContinueWatching = (movieId: string) => {
    const updated = continueWatching.filter((item) => item.movieId !== movieId)
    setContinueWatching(updated)
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated))
  }

  if (continueWatching.length === 0) return null

  return (
    <div className="px-4 sm:px-6 lg:px-8 mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">Continue Watching</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {continueWatching.map((item) => {
          const progressPercentage = (item.currentTime / item.duration) * 100

          return (
            <div key={item.movieId} className="group relative">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                <img
                  src={item.movie?.backdrop_url || "/placeholder.svg?height=180&width=320&query=movie backdrop"}
                  alt={item.movie?.title || "Movie"}
                  className="w-full h-full object-cover"
                />

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Link href={`/watch/${item.movieId}?t=${Math.floor(item.currentTime)}`}>
                    <Button
                      size="lg"
                      className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 rounded-full p-4"
                    >
                      <Play className="h-6 w-6 fill-current" />
                    </Button>
                  </Link>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  onClick={() => removeFromContinueWatching(item.movieId)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-2">
                <h3 className="text-white font-medium text-sm line-clamp-1">{item.movie?.title || "Unknown"}</h3>
                <p className="text-gray-400 text-xs">{Math.floor((item.currentTime / item.duration) * 100)}% watched</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
