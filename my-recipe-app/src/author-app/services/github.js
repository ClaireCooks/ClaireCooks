import { Octokit } from '@octokit/rest'

let octokit = null
const OWNER = 'TristenAnderson'
const REPO = 'ClaireCooks'
const BRANCH = 'main'
const CONTENT_PATH = 'my-recipe-app/src/shared/content/recipes'

export function setToken(token) {
  octokit = new Octokit({ auth: token })
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
    throw e
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
    throw e
  }
}
