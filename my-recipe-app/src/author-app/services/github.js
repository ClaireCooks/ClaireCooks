import { Octokit } from '@octokit/rest'

let octokit = null
const OWNER = 'ClaireCooks'
const REPO = 'ClaireCooks'
const BRANCH = 'main'
const CONTENT_PATH = 'my-recipe-app/src/shared/content/recipes'
const SITE_BASE_PATH = import.meta.env.BASE_URL || '/'

export function setToken(token) {
  const normalizedToken = token?.trim()
  octokit = normalizedToken ? new Octokit({ auth: normalizedToken }) : null
}

export const repository = {
  owner: OWNER,
  repo: REPO,
  branch: BRANCH,
  fullName: `${OWNER}/${REPO}`,
  contentPath: CONTENT_PATH,
  pagesBaseUrl: SITE_BASE_PATH,
}

export function getLiveRecipeUrl(slug) {
  return `${repository.pagesBaseUrl}recipes/${slug}`
}

export async function verifyRepositoryAccess() {
  if (!octokit) throw new Error('Not authenticated')

  try {
    await octokit.repos.get({
      owner: OWNER,
      repo: REPO,
    })

    await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: CONTENT_PATH,
      ref: BRANCH,
    })

    return true
  } catch (e) {
    throw new Error(formatGitHubError(e, `Unable to access ${repository.fullName}.`), { cause: e })
  }
}

export async function fetchRecipes() {
  if (!octokit) throw new Error('Not authenticated')

  try {
    const { data: files } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: CONTENT_PATH,
      ref: BRANCH,
    })

    const jsonFiles = files.filter(file => file.name.endsWith('.json'))
    
    const recipes = await Promise.all(jsonFiles.map(async (file) => {
      const { data: content } = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: file.path,
        ref: BRANCH,
      })
      
      // GitHub returns base64 encoded content
      const decoded = atob(content.content)
      return JSON.parse(decoded)
    }))

    return recipes
  } catch (e) {
    console.error('Failed to fetch recipes from GitHub', e)
    throw new Error(formatGitHubError(e, `Unable to fetch recipes from ${repository.fullName}.`), { cause: e })
  }
}

export async function commitRecipe(recipe) {
  if (!octokit) throw new Error('Not authenticated')

  const path = `${CONTENT_PATH}/${recipe.slug}.json`
  const content = JSON.stringify(recipe, null, 2)
  const encoded = btoa(unescape(encodeURIComponent(content)))

  try {
    // Get the current file's SHA if it exists
    let sha
    try {
      const { data: currentFile } = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path,
        ref: BRANCH,
      })
      sha = currentFile.sha
    } catch {
      // File doesn't exist yet, that's fine
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path,
      message: `cms: update recipe ${recipe.title}`,
      content: encoded,
      sha,
      branch: BRANCH,
    })

    return true
  } catch (e) {
    console.error('Failed to commit recipe to GitHub', e)
    throw new Error(formatGitHubError(e, `Unable to commit recipe to ${repository.fullName}.`), { cause: e })
  }
}

function formatGitHubError(error, fallback) {
  if (error?.status === 401) {
    return `${fallback} The GitHub token was rejected.`
  }

  if (error?.status === 403) {
    return `${fallback} The token does not have permission for this repository.`
  }

  if (error?.status === 404) {
    return `${fallback} Confirm the token can access ${repository.fullName}.`
  }

  return error?.message ? `${fallback} ${error.message}` : fallback
}
