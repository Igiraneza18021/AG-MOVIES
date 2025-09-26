export interface TMDBMovie {
  id: number
  title: string
  overview: string
  release_date: string
  vote_average: number
  poster_path: string | null
  backdrop_path: string | null
  media_type: "movie" | "tv"
  genre_ids: number[]
  runtime?: number
  genres?: { id: number; name: string }[]
  cast?: {
    id: number
    name: string
    character: string
    profile_path: string | null
  }[]
  crew?: {
    id: number
    name: string
    job: string
    profile_path: string | null
  }[]
  videos?: {
    id: string
    key: string
    name: string
    site: string
    type: string
  }[]
}

export interface TMDBSearchResponse {
  results: TMDBMovie[]
  total_results: number
  total_pages: number
}

export class TMDBClient {
  private baseUrl = "/api/tmdb"

  async searchMulti(query: string): Promise<TMDBSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    return response.json()
  }

  async getDetails(id: number, type: "movie" | "tv"): Promise<TMDBMovie> {
    const response = await fetch(`${this.baseUrl}/details?id=${id}&type=${type}`)

    if (!response.ok) {
      throw new Error(`Failed to get details: ${response.status}`)
    }

    return response.json()
  }

  async getTrending(
    timeWindow: "day" | "week" = "week",
    mediaType: "all" | "movie" | "tv" = "all",
  ): Promise<TMDBSearchResponse> {
    const response = await fetch(`${this.baseUrl}/trending?time_window=${timeWindow}&media_type=${mediaType}`)

    if (!response.ok) {
      throw new Error(`Failed to get trending: ${response.status}`)
    }

    return response.json()
  }

  getImageUrl(path: string | null, size: "w200" | "w500" | "w780" | "w1280" | "original" = "w500"): string | null {
    if (!path) return null
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  getYouTubeUrl(key: string): string {
    return `https://www.youtube.com/watch?v=${key}`
  }
}

export const tmdbClient = new TMDBClient()
