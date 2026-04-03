import { createClient } from '@/lib/supabase/client'

/**
 * Generate a short-lived signed URL for a file stored in Supabase Storage.
 *
 * @param bucket  - Storage bucket name (e.g. "products")
 * @param path    - Path inside the bucket (e.g. "project-123/source.zip")
 * @param expiresIn - Seconds until the URL expires (default: 300 = 5 minutes)
 * @returns Signed URL string, or null if generation failed
 */
export async function getSignedDownloadUrl(
  bucket: string,
  path: string,
  expiresIn = 300,
): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) {
    console.error('[Storage] createSignedUrl error:', error)
    return null
  }
  return data.signedUrl
}

/**
 * Get the public URL for a file in a public Supabase Storage bucket.
 *
 * @param bucket - Storage bucket name
 * @param path   - Path inside the bucket
 * @returns Public URL string
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Trigger a browser download for a given URL.
 * Fetches the resource as a blob and creates a temporary <a> link.
 *
 * @param url      - The URL to download (public or signed)
 * @param filename - Suggested filename for the downloaded file
 */
export async function triggerBrowserDownload(url: string, filename: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Không thể tải file. Vui lòng kiểm tra kết nối mạng và thử lại, hoặc liên hệ hỗ trợ nếu lỗi tiếp tục xảy ra. (${res.status})`)
  }
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  try {
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * Convenience helper: generate a signed URL for a Supabase Storage path
 * and immediately trigger a browser download.
 *
 * @param bucket   - Storage bucket name
 * @param path     - Path inside the bucket
 * @param filename - Suggested filename for the download
 * @param expiresIn - Seconds until signed URL expires (default: 300)
 */
export async function downloadFromStorage(
  bucket: string,
  path: string,
  filename: string,
  expiresIn = 300,
): Promise<void> {
  const url = await getSignedDownloadUrl(bucket, path, expiresIn)
  if (!url) {
    throw new Error('Could not generate download link. Please try again.')
  }
  await triggerBrowserDownload(url, filename)
}
