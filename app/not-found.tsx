import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Content Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          Sorry, we couldn't find the movie or show you're looking for. It might have been removed or doesn't exist.
        </p>
        <Link href="/home">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
