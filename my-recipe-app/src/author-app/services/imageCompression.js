const DEFAULT_OPTIONS = {
  maxWidth: 1600,
  quality: 0.8,
  type: 'image/webp',
  fallbackType: 'image/jpeg',
}

export async function compressImageFile(file, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options }
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, settings.maxWidth / bitmap.width)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const preferredBlob = await canvasToBlob(canvas, settings.type, settings.quality)
  const blob = preferredBlob.type === settings.type
    ? preferredBlob
    : await canvasToBlob(canvas, settings.fallbackType, settings.quality)

  return {
    blob,
    width,
    height,
    originalSize: file.size,
    compressedSize: blob.size,
    type: blob.type,
  }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Unable to compress this image. Try a different photo.'))
        }
      },
      type,
      quality,
    )
  })
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let size = bytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`
}
