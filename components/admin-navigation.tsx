import Link from "next/link"
import { ArrowLeft, Settings, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminNavigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Back */}
          <div className="flex items-center space-x-4">
            <Link href="/home">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <span className="text-xl font-bold text-primary">StreamFlix Admin</span>
          </div>

          {/* Admin Navigation */}
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="text-foreground hover:text-primary transition-colors">
              Content
            </Link>
            <Link href="/admin/analytics" className="text-muted-foreground hover:text-primary transition-colors">
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Analytics
            </Link>
            <Link href="/admin/settings" className="text-muted-foreground hover:text-primary transition-colors">
              <Settings className="h-4 w-4 inline mr-1" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
