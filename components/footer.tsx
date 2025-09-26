"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-muted-foreground">
          <div className="space-y-3">
            <div className="text-foreground font-semibold">AG Movies</div>
            <p className="text-xs leading-6">Unlimited movies, TV shows and more.</p>
          </div>
          <div className="space-y-3">
            <div className="text-foreground font-semibold">Browse</div>
            <ul className="space-y-2">
              <li><Link className="hover:text-foreground" href="/home">Home</Link></li>
              <li><Link className="hover:text-foreground" href="/search">Search</Link></li>
              <li><Link className="hover:text-foreground" href="/watchlist">Watchlist</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="text-foreground font-semibold">Company</div>
            <ul className="space-y-2">
              <li><a className="hover:text-foreground" href="#">About</a></li>
              <li><a className="hover:text-foreground" href="#">Careers</a></li>
              <li><a className="hover:text-foreground" href="#">Contact</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="text-foreground font-semibold">Legal</div>
            <ul className="space-y-2">
              <li><a className="hover:text-foreground" href="#">Privacy</a></li>
              <li><a className="hover:text-foreground" href="#">Terms</a></li>
              <li><a className="hover:text-foreground" href="#">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AG Movies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-foreground" href="#">Twitter</a>
            <a className="hover:text-foreground" href="#">Instagram</a>
            <a className="hover:text-foreground" href="#">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


