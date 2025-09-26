"use client"

import { useState, useEffect } from "react"
import type { MovieWithCategories } from "@/lib/types"

const WATCHLIST_KEY = "AG Movies-watchlist"

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<MovieWithCategories[]>([])

  useEffect(() => {
    // Load watchlist from localStorage on mount
    const saved = localStorage.getItem(WATCHLIST_KEY)
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading watchlist:", error)
      }
    }
  }, [])

  const saveWatchlist = (newWatchlist: MovieWithCategories[]) => {
    setWatchlist(newWatchlist)
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist))
  }

  const addToWatchlist = (movie: MovieWithCategories) => {
    const exists = watchlist.some((item) => item.id === movie.id)
    if (!exists) {
      const newWatchlist = [...watchlist, movie]
      saveWatchlist(newWatchlist)
    }
  }

  const removeFromWatchlist = (movieId: string) => {
    const newWatchlist = watchlist.filter((item) => item.id !== movieId)
    saveWatchlist(newWatchlist)
  }

  const isInWatchlist = (movieId: string) => {
    return watchlist.some((item) => item.id === movieId)
  }

  const clearWatchlist = () => {
    saveWatchlist([])
  }

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist,
  }
}
