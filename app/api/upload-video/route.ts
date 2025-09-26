import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the uploaded file from form data
    const formData = await request.formData()
    const file = formData.get("video") as File
    const movieId = formData.get("movieId") as string
    const type = formData.get("type") as "video" | "trailer" // video or trailer

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov", "video/wmv"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (5GB limit)
    const maxSize = 5 * 1024 * 1024 * 1024 // 5GB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 5GB)" }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop()
    const fileName = `${movieId}_${type}_${Date.now()}.${fileExtension}`
    const filePath = `${type}s/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("movie-videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("movie-videos").getPublicUrl(filePath)

    // Update movie record with file path
    const updateField = type === "video" ? "video_file_path" : "trailer_file_path"
    const { error: updateError } = await supabase
      .from("movies")
      .update({ [updateField]: filePath })
      .eq("id", movieId)

    if (updateError) {
      console.error("Database update error:", updateError)
      // Clean up uploaded file if database update fails
      await supabase.storage.from("movie-videos").remove([filePath])
      return NextResponse.json({ error: "Failed to update movie record" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      filePath,
      publicUrl,
      message: `${type} uploaded successfully`,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
