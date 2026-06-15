const STORAGE_KEY = 'recipe_cms_local_content'

export function getLocalRecipes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Failed to load local recipes', e)
    return []
  }
}

export function saveLocalRecipe(recipe) {
  const recipes = getLocalRecipes()
  const index = recipes.findIndex((r) => r.slug === recipe.slug || r.id === recipe.id)

  if (index >= 0) {
    recipes[index] = recipe
  } else {
    recipes.push(recipe)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
}

export function deleteLocalRecipe(slug) {
  const recipes = getLocalRecipes()
  const filtered = recipes.filter((r) => r.slug !== slug)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function exportRecipeAsJSON(recipe) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recipe, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", `${recipe.slug}.json`)
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}

export function importRecipesFromJSON(jsonString) {
  try {
    const imported = JSON.parse(jsonString)
    const recipes = Array.isArray(imported) ? imported : [imported]
    
    const local = getLocalRecipes()
    const merged = [...local]
    
    recipes.forEach(newRecipe => {
      const idx = merged.findIndex(r => r.slug === newRecipe.slug)
      if (idx >= 0) {
        merged[idx] = newRecipe
      } else {
        merged.push(newRecipe)
      }
    })
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    return true
  } catch (e) {
    console.error('Failed to import recipes', e)
    return false
  }
}

export function exportAllRecipes() {
  const local = getLocalRecipes()
  if (local.length === 0) {
    alert('No local recipes to export.')
    return
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(local, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute("href", dataStr)
  downloadAnchorNode.setAttribute("download", "all-recipes-.json")
  document.body.appendChild(downloadAnchorNode)
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}
