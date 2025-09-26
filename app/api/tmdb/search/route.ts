import { type NextRequest, NextResponse } from "next/server"

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`,
    )

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`)
    }

    const data = await response.json()

    // Filter and format results
    const formattedResults = data.results
      .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
      .map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview,
        release_date: item.release_date || item.first_air_date,
        vote_average: item.vote_average,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        media_type: item.media_type,
        genre_ids: item.genre_ids,
      }))

    return NextResponse.json({
      results: formattedResults,
      total_results: data.total_results,
      total_pages: data.total_pages,
    })
  } catch (error) {
    console.error("TMDB search error:", error)
    return NextResponse.json({ error: "Failed to search TMDB" }, { status: 500 })
  }
}
