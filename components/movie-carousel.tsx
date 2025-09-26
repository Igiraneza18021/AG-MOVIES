"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WatchlistButton } from "@/components/watchlist-button"
import type { MovieWithCategories } from "@/lib/types"

interface MovieCarouselProps {
  title: string
  movies: MovieWithCategories[]
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null)

  const itemsPerView = 6
  const maxIndex = Math.max(0, movies.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + itemsPerView, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerView, 0))
  }

  if (movies.length === 0) return null

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>

      <div className="relative group">
        {/* Previous Button */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {/* Next Button */}
        {currentIndex < maxIndex && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        {/* Movies Grid */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-2"
            style={{ transform: `translateX(-${(currentIndex / itemsPerView) * 100}%)` }}
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex-shrink-0 w-1/6 min-w-[200px] relative group/item cursor-pointer"
                onMouseEnter={() => setHoveredMovie(movie.id)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800">
                  <img
                    src={movie.poster_url || "/placeholder.svg?height=450&width=300&query=movie poster dark"}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                  />

                  {/* Hover Overlay */}
                  {hoveredMovie === movie.id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                      <div className="flex space-x-2">
                        <Link href={`/watch/${movie.id}`}>
                          <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                            <Play className="h-4 w-4 fill-current" />
                          </Button>
                        </Link>
                        <WatchlistButton movie={movie} variant="ghost" size="sm" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Movie Info */}
                <div className="mt-2 space-y-1">
                  <Link href={`/movie/${movie.id}`}>
                    <h3 className="text-sm font-medium text-white hover:text-primary transition-colors line-clamp-1">
                      {movie.title}
                    </h3>
                  </Link>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    {movie.rating && <span className="text-yellow-500">★ {movie.rating}</span>}
                    {movie.release_year && <span>{movie.release_year}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
