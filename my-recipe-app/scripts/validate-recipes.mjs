import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRecipeIndex } from '../src/shared/content/recipes/schema.js'

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const recipesDir = join(appRoot, 'src', 'content', 'recipes')
const recipeFiles = (await readdir(recipesDir)).filter((file) => file.endsWith('.json'))

const recipes = await Promise.all(
  recipeFiles.map(async (file) => {
    const raw = await readFile(join(recipesDir, file), 'utf8')

    try {
      return JSON.parse(raw)
    } catch (error) {
      return {
        id: file,
        __parseError: error.message,
      }
    }
  }),
)

const parseFailures = recipes
  .filter((recipe) => recipe.__parseError)
  .map((recipe) => ({
    id: recipe.id,
    errors: [`Invalid JSON: ${recipe.__parseError}`],
  }))

const parsedRecipes = recipes.filter((recipe) => !recipe.__parseError)
const { invalidRecipes } = createRecipeIndex(parsedRecipes)
const failures = parseFailures.concat(invalidRecipes)

if (failures.length > 0) {
  console.error('Recipe validation failed:')

  failures.forEach((failure) => {
    console.error(`- ${failure.id}`)
    failure.errors.forEach((error) => {
      console.error(`  - ${error}`)
    })
  })

  process.exitCode = 1
} else {
  console.log(`Validated ${parsedRecipes.length} recipe JSON file(s).`)
}
