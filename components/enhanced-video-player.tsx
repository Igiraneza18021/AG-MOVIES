"use client"

import { useEffect } from "react"
import { VideoPlayer } from "@/components/video-player"
import { useWatchProgress } from "@/hooks/use-watch-progress"
import type { MovieWithCategories } from "@/lib/types"

interface EnhancedVideoPlayerProps {
  movie: MovieWithCategories
  startTime?: number
}

export function EnhancedVideoPlayer({ movie, startTime = 0 }: EnhancedVideoPlayerProps) {
  const { saveProgress, getLastWatchedTime } = useWatchProgress(movie)

  useEffect(() => {
    // Set up periodic progress saving
    const interval = setInterval(() => {
      const video = document.querySelector("video")
      if (video && !video.paused) {
        saveProgress(video.currentTime, video.duration)
      }
    }, 10000) // Save every 10 seconds

    return () => clearInterval(interval)
  }, [saveProgress])

  useEffect(() => {
    // Resume from last watched position if no specific start time
    if (startTime === 0) {
      const lastTime = getLastWatchedTime()
      if (lastTime > 30) {
        const video = document.querySelector("video")
        if (video) {
          video.currentTime = lastTime
        }
      }
    }
  }, [startTime, getLastWatchedTime])

  return <VideoPlayer movie={movie} />
}
