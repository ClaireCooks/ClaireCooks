export function resolvePublicAsset(path) {
  if (!path || isExternalUrl(path)) {
    return path
  }

  if (!path.startsWith('/')) {
    return path
  }

  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base

  return `${normalizedBase}${path}`
}

function isExternalUrl(path) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)
}
