export function restoreGitHubPagesRoute() {
  const params = new URLSearchParams(window.location.search)
  const redirectedPath = params.get('redirect')

  if (!redirectedPath) {
    return
  }

  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const nextPath = redirectedPath.startsWith('/') ? redirectedPath.slice(1) : redirectedPath

  window.history.replaceState(null, '', `${normalizedBase}${nextPath}`)
}
