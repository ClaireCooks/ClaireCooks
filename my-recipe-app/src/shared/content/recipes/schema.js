const blockValidators = {
  hero(block) {
    if (block.data?.backgroundImage && !isNonEmptyString(block.data.backgroundImage)) {
      return ['hero.data.backgroundImage must be a non-empty string when provided.']
    }

    return []
  },
  media(block) {
    const errors = requireObjectFields(block.data, ['type', 'url'], 'media.data')
    if (block.data.type && !['image', 'video'].includes(block.data.type)) {
      errors.push('media.data.type must be "image" or "video".')
    }
    return errors
  },
  ingredients(block) {
    return requireStringArray(block.data?.items, 'ingredients.data.items')
  },
  instructions(block) {
    return requireStringArray(block.data?.steps, 'instructions.data.steps')
  },
  notes(block) {
    return requireStringArray(block.data?.items, 'notes.data.items')
  },
  nutrition(block) {
    return requireStringArray(block.data?.items, 'nutrition.data.items')
  },
  gallery(block) {
    return requireStringArray(block.data?.images, 'gallery.data.images')
  },
}

const requiredRecipeFields = [
  'id',
  'title',
  'slug',
  'description',
  'category',
  'status',
  'prepTime',
  'cookTime',
  'servings',
  'difficulty',
  'blocks',
]

export function validateRecipe(recipe) {
  const errors = []

  if (!isPlainObject(recipe)) {
    return {
      valid: false,
      errors: ['Recipe must be an object.'],
    }
  }

  errors.push(...requireObjectFields(recipe, requiredRecipeFields, 'recipe'))

  if (recipe.status && !['draft', 'published'].includes(recipe.status)) {
    errors.push('recipe.status must be "draft" or "published".')
  }

  if (recipe.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.slug)) {
    errors.push('recipe.slug must use lowercase letters, numbers, and hyphens.')
  }

  if (recipe.servings !== undefined && (!Number.isInteger(recipe.servings) || recipe.servings < 1)) {
    errors.push('recipe.servings must be a positive integer.')
  }

  if (recipe.tags !== undefined) {
    errors.push(...requireStringArray(recipe.tags, 'recipe.tags'))
  }

  if (recipe.image !== undefined && !isNonEmptyString(recipe.image)) {
    errors.push('recipe.image must be a non-empty string when provided.')
  }

  if (recipe.blocks !== undefined) {
    if (!Array.isArray(recipe.blocks) || recipe.blocks.length === 0) {
      errors.push('recipe.blocks must be a non-empty array.')
    } else {
      recipe.blocks.forEach((block, index) => {
        errors.push(...validateBlock(block, index))
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function createRecipeIndex(recipes) {
  const validationResults = recipes.map((recipe) => ({
    recipe,
    result: validateRecipe(recipe),
  }))

  const validRecipes = validationResults
    .filter(({ result }) => result.valid)
    .map(({ recipe }) => recipe)
    .sort((a, b) => a.title.localeCompare(b.title))

  const invalidRecipes = validationResults
    .filter(({ result }) => !result.valid)
    .map(({ recipe, result }) => ({
      id: recipe?.id ?? recipe?.slug ?? 'unknown',
      errors: result.errors,
    }))

  const duplicateSlugs = findDuplicates(validRecipes.map((recipe) => recipe.slug))

  if (duplicateSlugs.length > 0) {
    duplicateSlugs.forEach((slug) => {
      invalidRecipes.push({
        id: slug,
        errors: [`Duplicate recipe slug "${slug}".`],
      })
    })
  }

  return {
    recipes: validRecipes.filter((recipe) => !duplicateSlugs.includes(recipe.slug)),
    invalidRecipes,
  }
}

function validateBlock(block, index) {
  const errors = []
  const label = `recipe.blocks[${index}]`

  if (!isPlainObject(block)) {
    return [`${label} must be an object.`]
  }

  if (!isNonEmptyString(block.type)) {
    errors.push(`${label}.type is required.`)
    return errors
  }

  if (!isPlainObject(block.data)) {
    errors.push(`${label}.data must be an object.`)
    return errors
  }

  const validator = blockValidators[block.type]

  if (!validator) {
    errors.push(`${label}.type "${block.type}" is not registered in the recipe schema.`)
    return errors
  }

  return errors.concat(validator(block))
}

function requireObjectFields(object, fields, label) {
  return fields
    .filter((field) => {
      const value = object?.[field]

      if (field === 'servings') {
        return value === undefined
      }

      if (field === 'blocks') {
        return !Array.isArray(value)
      }

      return !isNonEmptyString(value)
    })
    .map((field) => `${label}.${field} is required.`)
}

function requireStringArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    return [`${label} must be a non-empty array.`]
  }

  return value
    .map((item, index) => (isNonEmptyString(item) ? null : `${label}[${index}] must be a non-empty string.`))
    .filter(Boolean)
}

function findDuplicates(values) {
  const seen = new Set()
  const duplicates = new Set()

  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value)
    }

    seen.add(value)
  })

  return [...duplicates]
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}
