'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadFromStorage, triggerBrowserDownload } from '@/lib/supabase/storage'

interface DownloadButtonProps {
  /**
   * Use `storagePath` + `bucket` for files stored in Supabase Storage (recommended).
   * A short-lived signed URL will be generated automatically.
   */
  bucket?: string
  storagePath?: string
  /**
   * Use `directUrl` for files hosted outside Supabase Storage (e.g. raw external links).
   * The file will be fetched and downloaded via the browser.
   */
  directUrl?: string
  /** Filename suggested to the browser when saving the file */
  filename?: string
  /** Button label */
  label?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * A reusable "Download" button that supports Supabase Storage signed URLs
 * and direct external URLs.
 *
 * **Source priority**: if both `bucket`+`storagePath` and `directUrl` are provided,
 * the Supabase Storage path takes precedence and `directUrl` is ignored.
 * Provide only one source to avoid ambiguity.
 *
 * Usage (Supabase Storage):
 * ```tsx
 * <DownloadButton bucket="products" storagePath="project-123/source.zip" filename="source.zip" />
 * ```
 *
 * Usage (direct URL):
 * ```tsx
 * <DownloadButton directUrl="https://example.com/file.zip" filename="file.zip" />
 * ```
 */
export default function DownloadButton({
  bucket,
  storagePath,
  directUrl,
  filename = 'download',
  label = 'Tải xuống',
  className,
  variant = 'default',
  size = 'default',
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setError(null)
    setLoading(true)
    try {
      if (storagePath && bucket) {
        await downloadFromStorage(bucket, storagePath, filename)
      } else if (directUrl) {
        await triggerBrowserDownload(directUrl, filename)
      } else {
        throw new Error('No download source configured.')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Download failed.'
      console.error('[DownloadButton]', err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleDownload}
        disabled={loading}
        aria-label={label}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="ml-2">{loading ? 'Đang tải...' : label}</span>
      </Button>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
