const REPOSITORY_OWNER = 'ClaireCooks'
const REPOSITORY_NAME = 'ClaireCooks'
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/webp', 'image/jpeg'])

export default {
  async fetch(request, env) {
    const corsHeaders = createCorsHeaders(env)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    if (request.method !== 'POST') {
      return json({ error: 'Use POST to upload photos.' }, 405, corsHeaders)
    }

    try {
      await verifyGitHubToken(request)

      const formData = await request.formData()
      const file = formData.get('file')
      const recipeSlug = sanitizePathPart(formData.get('recipeSlug'))
      const purpose = sanitizePathPart(formData.get('purpose'))
      const filename = sanitizeFilename(formData.get('filename'))

      if (!env.RECIPE_IMAGES) {
        return json({ error: 'R2 binding RECIPE_IMAGES is not configured.' }, 500, corsHeaders)
      }

      if (!env.PUBLIC_ASSET_BASE_URL) {
        return json({ error: 'PUBLIC_ASSET_BASE_URL is not configured.' }, 500, corsHeaders)
      }

      if (!(file instanceof File)) {
        return json({ error: 'Upload a compressed image file.' }, 400, corsHeaders)
      }

      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return json({ error: 'Only compressed WebP or JPEG uploads are accepted.' }, 400, corsHeaders)
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        return json({ error: 'Compressed image is larger than 2 MB.' }, 413, corsHeaders)
      }

      const key = `recipes/${recipeSlug || 'recipe'}/${purpose || 'photo'}/${filename}`
      await env.RECIPE_IMAGES.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000, immutable',
        },
        customMetadata: {
          recipeSlug: recipeSlug || 'recipe',
          purpose: purpose || 'photo',
        },
      })

      const publicBase = env.PUBLIC_ASSET_BASE_URL.replace(/\/$/, '')

      return json({ key, url: `${publicBase}/${key}` }, 200, corsHeaders)
    } catch (error) {
      return json({ error: error.message || 'Photo upload failed.' }, error.status || 500, corsHeaders)
    }
  },
}

async function verifyGitHubToken(request) {
  const authorization = request.headers.get('Authorization') || ''
  const token = authorization.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    throw httpError('Missing GitHub token.', 401)
  }

  const response = await fetch(`https://api.github.com/repos/${REPOSITORY_OWNER}/${REPOSITORY_NAME}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ClaireCooks image upload worker',
    },
  })

  if (response.status === 401 || response.status === 403) {
    throw httpError('GitHub token was rejected.', response.status)
  }

  if (response.status === 404) {
    throw httpError(`GitHub token cannot access ${REPOSITORY_OWNER}/${REPOSITORY_NAME}.`, 404)
  }

  if (!response.ok) {
    throw httpError('Unable to verify GitHub repository access.', 502)
  }
}

function createCorsHeaders(env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || '*'

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(payload, status, headers) {
  return Response.json(payload, { status, headers })
}

function httpError(message, status) {
  const error = new Error(message)
  error.status = status
  return error
}

function sanitizePathPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeFilename(value) {
  const filename = String(value || 'photo.webp')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (filename.endsWith('.webp') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
    return filename
  }

  return `${filename}.webp`
}
