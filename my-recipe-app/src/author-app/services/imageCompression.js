import encodeWebp from '@jsquash/webp/encode'

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

  const imageData = context.getImageData(0, 0, width, height)
  const blob = await encodeCanvasToWebp(imageData, settings)

  return {
    blob,
    width,
    height,
    originalSize: file.size,
    compressedSize: blob.size,
    type: blob.type,
  }
}

async function encodeCanvasToWebp(imageData, settings) {
  try {
    const webpBuffer = await encodeWebp(imageData, {
      quality: normalizeEncoderQuality(settings.quality),
    })

    return new Blob([webpBuffer], { type: 'image/webp' })
  } catch {
    const preferredBlob = await canvasToBlobFromImageData(imageData, settings.type, settings.quality)

    if (preferredBlob.type === settings.type) {
      return preferredBlob
    }

    return canvasToBlobFromImageData(imageData, settings.fallbackType, settings.quality)
  }
}

function canvasToBlobFromImageData(imageData, type, quality) {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const context = canvas.getContext('2d')
  context.putImageData(imageData, 0, 0)

  return canvasToBlob(canvas, type, quality)
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

function normalizeEncoderQuality(quality) {
  return quality <= 1 ? Math.round(quality * 100) : quality
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
