import { createRecipeIndex } from './schema'
import { getLocalRecipes } from '../../utils/storage'

const recipeModules = import.meta.glob('./*.json', {
  eager: true,
  import: 'default',
})

const staticRecipes = Object.values(recipeModules)
const localRecipes = typeof window !== 'undefined' ? getLocalRecipes() : []

// Merge static and local: Local overrides static if slug matches
const allLoadedRecipes = [...staticRecipes]
localRecipes.forEach(local => {
  const idx = allLoadedRecipes.findIndex(r => r.slug === local.slug)
  if (idx >= 0) {
    allLoadedRecipes[idx] = local
  } else {
    allLoadedRecipes.push(local)
  }
})

const recipeIndex = createRecipeIndex(allLoadedRecipes)

export const recipes = recipeIndex.recipes
export const invalidRecipes = recipeIndex.invalidRecipes
export const publishedRecipes = recipes.filter((recipe) => recipe.status === 'published')

export function getRecipeBySlug(slug) {
  return recipes.find((recipe) => recipe.slug === slug)
}

export function getPublishedRecipeBySlug(slug) {
  return publishedRecipes.find((recipe) => recipe.slug === slug)
}
