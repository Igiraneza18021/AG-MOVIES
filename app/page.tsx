"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WelcomePage() {
  const router = useRouter()

  useEffect(() => {
    const hasVisited = typeof window !== "undefined" && localStorage.getItem("welcome_seen") === "1"
    if (hasVisited) {
      router.replace("/home")
    }
  }, [router])

  const handleEnter = () => {
    try {
      localStorage.setItem("welcome_seen", "1")
    } catch {}
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background video/image placeholder */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/placeholder.svg?height=1080&width=1920')`,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">AG Movies</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Unlimited movies, TV shows and more
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-lg text-gray-400">Ready to watch? Enter to get started.</p>
          <Link href="/home" onClick={handleEnter}>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-xl font-semibold rounded-md transition-all duration-200 hover:scale-105"
            >
              Enter AG Movies
            </Button>
          </Link>
        </div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 z-5 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>
    </div>
  )
}
