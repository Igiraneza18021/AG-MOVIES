import { createClient } from "@/lib/supabase/client"

export class SupabaseStorageService {
  private supabase = createClient()
  private bucketName = "movie-videos"

  async getVideoUrl(filePath: string): Promise<string> {
    const { data } = this.supabase.storage.from(this.bucketName).getPublicUrl(filePath)

    return data.publicUrl
  }

  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
    const { data, error } = await this.supabase.storage.from(this.bucketName).createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error("Error creating signed URL:", error)
      return null
    }

    return data.signedUrl
  }

  async deleteFile(filePath: string): Promise<boolean> {
    const { error } = await this.supabase.storage.from(this.bucketName).remove([filePath])

    if (error) {
      console.error("Error deleting file:", error)
      return false
    }

    return true
  }

  async uploadFile(file: File, filePath: string): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase.storage.from(this.bucketName).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const publicUrl = await this.getVideoUrl(filePath)
      return { success: true, publicUrl }
    } catch (error) {
      return { success: false, error: "Upload failed" }
    }
  }
}

export const storageService = new SupabaseStorageService()
