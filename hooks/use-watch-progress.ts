"use client"

import { useCallback } from "react"
import type { MovieWithCategories } from "@/lib/types"

const CONTINUE_WATCHING_KEY = "AG Movies-continue-watching"

interface WatchProgress {
  movieId: string
  currentTime: number
  duration: number
  lastWatched: string
  movie?: MovieWithCategories
}

export function useWatchProgress(movie: MovieWithCategories) {
  const saveProgress = useCallback(
    (currentTime: number, duration: number) => {
      // Only save if watched for more than 30 seconds and less than 95%
      if (currentTime < 30 || currentTime / duration > 0.95) return

      const saved = localStorage.getItem(CONTINUE_WATCHING_KEY)
      let continueWatching: WatchProgress[] = []

      if (saved) {
        try {
          continueWatching = JSON.parse(saved)
        } catch (error) {
          console.error("Error parsing continue watching data:", error)
        }
      }

      // Remove existing entry for this movie
      continueWatching = continueWatching.filter((item) => item.movieId !== movie.id)

      // Add new entry at the beginning
      continueWatching.unshift({
        movieId: movie.id,
        currentTime,
        duration,
        lastWatched: new Date().toISOString(),
        movie,
      })

      // Keep only the most recent 10 items
      continueWatching = continueWatching.slice(0, 10)

      localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(continueWatching))
    },
    [movie],
  )

  const getLastWatchedTime = useCallback(() => {
    const saved = localStorage.getItem(CONTINUE_WATCHING_KEY)
    if (!saved) return 0

    try {
      const continueWatching: WatchProgress[] = JSON.parse(saved)
      const item = continueWatching.find((item) => item.movieId === movie.id)
      return item?.currentTime || 0
    } catch (error) {
      console.error("Error getting last watched time:", error)
      return 0
    }
  }, [movie.id])

  const removeFromContinueWatching = useCallback(() => {
    const saved = localStorage.getItem(CONTINUE_WATCHING_KEY)
    if (!saved) return

    try {
      const continueWatching: WatchProgress[] = JSON.parse(saved)
      const updated = continueWatching.filter((item) => item.movieId !== movie.id)
      localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Error removing from continue watching:", error)
    }
  }, [movie.id])

  return {
    saveProgress,
    getLastWatchedTime,
    removeFromContinueWatching,
  }
}
