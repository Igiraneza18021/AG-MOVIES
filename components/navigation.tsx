"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">AG Movies</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/home" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/watchlist" className="text-muted-foreground hover:text-primary transition-colors">
              My List
            </Link>
          </div>

          {/* Search and Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Search movies, shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-background/90 border-border"
                    autoFocus
                  />
                  <Button type="submit" variant="ghost" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-border">
            <Link
              href="/home"
              className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/search"
              className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              href="/watchlist"
              className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              My List
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
