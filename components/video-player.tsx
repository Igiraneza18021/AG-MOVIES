"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Subtitles,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MovieWithCategories } from "@/lib/types"
import { storageService } from "@/lib/supabase-storage"

interface VideoPlayerProps {
  movie: MovieWithCategories
}

interface VideoQuality {
  label: string
  value: string
  url?: string
}

const QUALITY_OPTIONS: VideoQuality[] = [
  { label: "Auto", value: "auto" },
  { label: "1080p", value: "1080p" },
  { label: "720p", value: "720p" },
  { label: "480p", value: "480p" },
  { label: "360p", value: "360p" },
]

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export function VideoPlayer({ movie }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([100])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [quality, setQuality] = useState("auto")
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isTeraBox, setIsTeraBox] = useState(false)
  const [isStreamable, setIsStreamable] = useState(false)
  const [isJumpshare, setIsJumpshare] = useState(false)
  const [isHls, setIsHls] = useState(false)

  useEffect(() => {
    const loadVideoUrl = async () => {
      if (movie.video_file_path) {
        try {
          const publicUrl = await storageService.getVideoUrl(movie.video_file_path)
          const signed = await storageService.getSignedUrl(movie.video_file_path, 60)
          setVideoUrl(publicUrl)
          setDownloadUrl(signed || publicUrl)
        } catch (error) {
          console.error("Error loading video URL:", error)
          setError("Failed to load video")
        }
      } else if (movie.video_url) {
        // Fallback to direct URL if no file path
        const isTbx = /terabox\.com|1024terabox\.com|terabox\.app/.test(movie.video_url)
        setIsTeraBox(isTbx)
        if (isTbx) {
          // Use proxy to enable inline playback
          const proxied = `/api/proxy-video?url=${encodeURIComponent(movie.video_url)}`
          setVideoUrl(proxied)
          setDownloadUrl(undefined as unknown as string)
        } else {
          setVideoUrl(movie.video_url)
          setDownloadUrl(movie.video_url)
        }
        setIsStreamable(/(^|\.)streamable\.com\//.test(movie.video_url))
        setIsJumpshare(/(^|\.)jumpshare\.com\//.test(movie.video_url))
      } else {
        // Demo video URL
        setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
        setDownloadUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
        setIsTeraBox(false)
        setIsStreamable(false)
        setIsJumpshare(false)
      }
    }

    loadVideoUrl()
  }, [movie.video_file_path, movie.video_url])

  // Initialize HLS if needed
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    const isM3U8 = /\.m3u8(\?|$)/i.test(videoUrl)
    setIsHls(isM3U8)

    if (isM3U8) {
      // If the browser supports native HLS (Safari), use it
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl
        return
      }
      let hls: any
      ;(async () => {
        try {
          const mod = await import('hls.js')
          const Hls = mod.default
          if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true })
            hls.attachMedia(video)
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              hls.loadSource(videoUrl)
            })
            hls.on(Hls.Events.ERROR, () => {
              setError('Failed to load stream')
            })
          } else {
            // Fallback to direct src
            video.src = videoUrl
          }
        } catch (e) {
          // hls.js not available
          video.src = videoUrl
        }
      })()

      return () => {
        if (hls) {
          try { hls.destroy() } catch {}
        }
      }
    } else {
      // Non-HLS: ensure <source> path used
      // No action needed here
    }
  }, [videoUrl])

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (showControls && isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [showControls, isPlaying])

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
    }
    const handleLoadStart = () => {
      setIsLoading(true)
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
      loadTimeoutRef.current = setTimeout(() => {
        setIsLoading(false)
        setError("Video is taking too long to load. Please try again.")
      }, 15000)
    }
    const handleCanPlay = () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
      setIsLoading(false)
    }
    const handleLoadedData = () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
      setIsLoading(false)
    }
    const handleWaiting = () => setIsLoading(true)
    const handleStalled = () => setIsLoading(true)
    const handleSuspend = () => setIsLoading(false)
    const handleError = () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
      setError("Failed to load video")
      setIsLoading(false)
    }

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("progress", updateBuffered)
    video.addEventListener("loadstart", handleLoadStart)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("stalled", handleStalled)
    video.addEventListener("suspend", handleSuspend)
    video.addEventListener("error", handleError)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("progress", updateBuffered)
      video.removeEventListener("loadstart", handleLoadStart)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("stalled", handleStalled)
      video.removeEventListener("suspend", handleSuspend)
      video.removeEventListener("error", handleError)
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }
    }
  }, [])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return

      switch (e.code) {
        case "Space":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowLeft":
          e.preventDefault()
          skipTime(-10)
          break
        case "ArrowRight":
          e.preventDefault()
          skipTime(10)
          break
        case "ArrowUp":
          e.preventDefault()
          adjustVolume(10)
          break
        case "ArrowDown":
          e.preventDefault()
          adjustVolume(-10)
          break
        case "KeyM":
          e.preventDefault()
          toggleMute()
          break
        case "KeyF":
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleVolumeChange = useCallback((value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume / 100
    setVolume([newVolume])
    setIsMuted(newVolume === 0)
  }, [])

  const adjustVolume = useCallback(
    (delta: number) => {
      const newVolume = Math.max(0, Math.min(100, volume[0] + delta))
      handleVolumeChange([newVolume])
    },
    [volume, handleVolumeChange],
  )

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }, [])

  const skipTime = useCallback(
    (seconds: number) => {
      const video = videoRef.current
      if (!video) return

      video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration))
    },
    [duration],
  )

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [isFullscreen])

  const handleQualityChange = useCallback((newQuality: string) => {
    setQuality(newQuality)
    // In a real implementation, you would switch video sources here
    console.log("Quality changed to:", newQuality)
  }, [])

  const handleSpeedChange = useCallback((speed: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = speed
    setPlaybackSpeed(speed)
  }, [])

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const bufferedPercentage = duration > 0 ? (buffered / duration) * 100 : 0
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={`relative bg-black group cursor-pointer ${isFullscreen ? "fixed inset-0 z-50" : "aspect-video"}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      tabIndex={0}
    >
      {/* Video Element, Streamable/Jumpshare embed, or TeraBox handoff */}
      {(isStreamable || isJumpshare) && videoUrl ? (
        <div className="relative w-full h-0" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={videoUrl}
            allow="fullscreen"
            allowFullScreen
            className="absolute left-0 top-0 w-full h-full"
            style={{ border: "none", overflow: "hidden" }}
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={movie.backdrop_url || "/placeholder.svg?height=720&width=1280"}
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          {videoUrl && !isHls && <source src={videoUrl} type="video/mp4" />}
          Your browser does not support the video tag.
        </video>
      )}

      {/* Loading Spinner */}
      {!isStreamable && !isJumpshare && !isTeraBox && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <p className="text-lg mb-4">{error}</p>
            <Button onClick={() => setError(null)} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!isTeraBox && !isStreamable && !isJumpshare && !isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            size="lg"
            className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 rounded-full p-6"
            onClick={togglePlay}
          >
            <Play className="h-12 w-12 fill-current" />
          </Button>
        </div>
      )}

      {/* Controls (hidden for iframe hosts) */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
          isStreamable || isJumpshare ? "opacity-0 pointer-events-none" : showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4" ref={progressRef}>
          <div className="relative">
            {/* Buffered Progress */}
            <div className="absolute inset-0 bg-gray-600 rounded-full h-1">
              <div
                className="bg-gray-400 h-full rounded-full transition-all duration-200"
                style={{ width: `${bufferedPercentage}%` }}
              />
            </div>
            {/* Playback Progress */}
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full relative z-10"
            />
          </div>
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
            </Button>

            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => skipTime(-10)}>
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => skipTime(10)}>
              <SkipForward className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <div className="w-20">
                <Slider value={volume} max={100} step={1} onValueChange={handleVolumeChange} />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Settings Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-5 w-5" />
              </Button>

              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-4 min-w-48">
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Quality</label>
                      <Select value={quality} onValueChange={handleQualityChange}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUALITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Speed</label>
                      <Select
                        value={playbackSpeed.toString()}
                        onValueChange={(value) => handleSpeedChange(Number.parseFloat(value))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <SelectItem key={speed} value={speed.toString()}>
                              {speed}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Subtitles className="h-5 w-5" />
            </Button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="text-white text-sm px-3 py-1 rounded hover:bg-white/20 border border-white/20"
              >
                Download
              </a>
            )}

            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {showControls && (
        <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-2 text-xs text-white opacity-50">
          <div>Space: Play/Pause</div>
          <div>←/→: Skip 10s</div>
          <div>↑/↓: Volume</div>
          <div>F: Fullscreen</div>
          <div>M: Mute</div>
        </div>
      )}
    </div>
  )
}
