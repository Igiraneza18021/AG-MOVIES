import { type NextRequest, NextResponse } from "next/server"

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const type = searchParams.get("type") // 'movie' or 'tv'

  if (!id || !type) {
    return NextResponse.json({ error: "ID and type parameters are required" }, { status: 400 })
  }

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 })
  }

  try {
    // Get basic details
    const detailsResponse = await fetch(
      `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`,
    )

    if (!detailsResponse.ok) {
      throw new Error(`TMDB API error: ${detailsResponse.status}`)
    }

    const details = await detailsResponse.json()

    // Format the response
    const formattedDetails = {
      id: details.id,
      title: details.title || details.name,
      overview: details.overview,
      release_date: details.release_date || details.first_air_date,
      vote_average: details.vote_average,
      poster_path: details.poster_path,
      backdrop_path: details.backdrop_path,
      runtime: details.runtime || (details.episode_run_time && details.episode_run_time[0]),
      genres: details.genres,
      media_type: type,
      cast: details.credits?.cast?.slice(0, 10).map((person: any) => ({
        id: person.id,
        name: person.name,
        character: person.character,
        profile_path: person.profile_path,
      })),
      crew: details.credits?.crew?.filter((person: any) => person.job === "Director").slice(0, 3),
      videos: details.videos?.results?.filter((video: any) => video.type === "Trailer" && video.site === "YouTube"),
    }

    return NextResponse.json(formattedDetails)
  } catch (error) {
    console.error("TMDB details error:", error)
    return NextResponse.json({ error: "Failed to fetch TMDB details" }, { status: 500 })
  }
}
