"use client"

import { useState } from "react"
import { Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWatchlist } from "@/hooks/use-watchlist"
import type { MovieWithCategories } from "@/lib/types"

interface WatchlistButtonProps {
  movie: MovieWithCategories
  variant?: "default" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function WatchlistButton({ movie, variant = "ghost", size = "lg" }: WatchlistButtonProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [isLoading, setIsLoading] = useState(false)

  const inWatchlist = isInWatchlist(movie.id)

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      if (inWatchlist) {
        removeFromWatchlist(movie.id)
      } else {
        addToWatchlist(movie)
      }
    } catch (error) {
      console.error("Error updating watchlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={`${variant === "ghost" ? "text-white hover:bg-white/20" : ""} ${
        inWatchlist ? "bg-green-600 hover:bg-green-700" : ""
      }`}
    >
      {inWatchlist ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      {size === "lg" && <span className="ml-2">{inWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>}
    </Button>
  )
}
