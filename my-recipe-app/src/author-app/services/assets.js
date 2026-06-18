import { compressImageFile } from './imageCompression'

const UPLOAD_URL = import.meta.env.VITE_ASSET_UPLOAD_URL
const PUBLIC_BASE_URL = import.meta.env.VITE_ASSET_PUBLIC_BASE_URL

export async function uploadRecipeImage({ file, recipeSlug, purpose, token }) {
  if (!UPLOAD_URL) {
    throw new Error('Photo uploads are not configured. Set VITE_ASSET_UPLOAD_URL to your image upload Worker URL.')
  }

  if (!token) {
    throw new Error('Unlock the author workspace before uploading photos.')
  }

  const compressed = await compressImageFile(file, {
    maxWidth: 1600,
    quality: 0.8,
  })

  const filename = createAssetFilename({ recipeSlug, purpose, type: compressed.type })
  const formData = new FormData()
  formData.append('file', compressed.blob, filename)
  formData.append('recipeSlug', recipeSlug)
  formData.append('purpose', purpose)
  formData.append('filename', filename)
  formData.append('contentType', compressed.type)

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // Some upload services may return an empty body on errors.
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Photo upload failed with status ${response.status}.`)
  }

  const url = payload?.url || buildPublicUrl(payload?.key || filename)

  if (!url) {
    throw new Error('The upload completed, but no public image URL was returned.')
  }

  return {
    ...compressed,
    filename,
    key: payload?.key,
    url,
  }
}

function createAssetFilename({ recipeSlug, purpose, type }) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const safeSlug = sanitizePathPart(recipeSlug || 'recipe')
  const safePurpose = sanitizePathPart(purpose || 'photo')
  const extension = getExtensionForType(type)

  return `${safeSlug}-${safePurpose}-${timestamp}.${extension}`
}

function buildPublicUrl(key) {
  if (!PUBLIC_BASE_URL || !key) return ''

  return `${PUBLIC_BASE_URL.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}

function sanitizePathPart(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getExtensionForType(type) {
  if (type === 'image/jpeg') return 'jpg'
  return 'webp'
}
