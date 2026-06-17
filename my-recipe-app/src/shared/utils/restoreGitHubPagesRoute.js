export function restoreGitHubPagesRoute() {
  const params = new URLSearchParams(window.location.search)
  const redirectedPath = params.get('redirect')

  if (!redirectedPath) {
    return
  }

  const base = import.meta.env.BASE_URL || '/'
  const route = redirectedPath.startsWith('/') ? redirectedPath : `/${redirectedPath}`
  const nextUrl = new URL(route.slice(1), `${window.location.origin}${base}`)

  window.history.replaceState(null, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
}
