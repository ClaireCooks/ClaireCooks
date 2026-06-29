import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchRecipes, commitRecipe } from './services/github'
import { listRecipeImages, uploadRecipeImage } from './services/assets'
import { validateRecipe } from '../shared/content/recipes/schema'
import { createSlug } from '../shared/utils/slugs'
import { resolvePublicAsset } from '../shared/utils/assets'
import RecipeRenderer from '../shared/renderer/RecipeRenderer'
import { formatBytes } from './services/imageCompression'
import { useAuth } from './useAuth'

const CATEGORY_OPTIONS = [
  'Breakfast',
  'Brunch',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Appetizer',
  'Side Dish',
  'Drink',
  'Uncategorized',
]

const PHOTO_PURPOSE_OPTIONS = [
  { value: 'card', label: 'Recipe card thumbnail' },
  { value: 'hero', label: 'Hero side photo' },
  { value: 'ingredients', label: 'Ingredients side photo' },
  { value: 'media', label: 'Media block image' },
  { value: 'gallery', label: 'Gallery photo' },
]

const BLOCK_OPTIONS = [
  { type: 'hero', label: 'Hero', description: 'Intro copy and feature image' },
  { type: 'ingredients', label: 'Ingredients', description: 'Ingredient list with optional side photo' },
  { type: 'instructions', label: 'Instructions', description: 'Step-by-step cooking flow' },
  { type: 'media', label: 'Media', description: 'Single image or video feature' },
  { type: 'gallery', label: 'Gallery', description: 'Multiple photos with caption' },
  { type: 'notes', label: 'Notes', description: 'Tips, swaps, and serving ideas' },
  { type: 'nutrition', label: 'Nutrition', description: 'Nutrition or dietary details' },
]

const DEFAULT_RECIPE_TITLE = 'New Recipe'
const DEFAULT_TAG_SUGGESTIONS = [
  '30-minute',
  'appetizer',
  'baking',
  'batch-cooking',
  'breakfast',
  'budget-friendly',
  'comfort-food',
  'date-night',
  'dessert',
  'dinner',
  'family-favorite',
  'freezer-friendly',
  'gluten-free',
  'grilling',
  'healthy',
  'high-protein',
  'holiday',
  'kid-friendly',
  'lunch',
  'make-ahead',
  'meal-prep',
  'no-bake',
  'one-pan',
  'party',
  'quick',
  'salad',
  'sauce',
  'side-dish',
  'slow-cooker',
  'snack',
  'soup',
  'spicy',
  'vegetarian',
  'comfort',
  'weeknight',
]
const TAG_SUGGESTION_COLLAPSED_COUNT = 10

function createEmptyRecipe() {
  return {
    id: `recipe-${Date.now()}`,
    title: DEFAULT_RECIPE_TITLE,
    slug: '',
    description: 'Enter a description',
    image: '/recipe-art/crepes.svg',
    category: 'Uncategorized',
    status: 'draft',
    difficulty: 'Easy',
    prepTime: '10 min',
    cookTime: '20 min',
    servings: 4,
    tags: [],
    blocks: [
      {
        type: 'hero',
        data: {
          kicker: '',
          summary: '',
          backgroundImage: '',
        },
      },
      {
        type: 'ingredients',
        data: {
          items: ['First ingredient'],
        },
      },
      {
        type: 'instructions',
        data: {
          steps: ['First step'],
        },
      },
    ],
  }
}

function collectKnownTags(recipes) {
  const tags = new Set(DEFAULT_TAG_SUGGESTIONS)

  recipes.forEach((recipe) => {
    const recipeTags = recipe.tags || []

    recipeTags.forEach((tag) => {
      const normalizedTag = tag.trim()
      if (normalizedTag) {
        tags.add(normalizedTag)
      }
    })
  })

  return [...tags].sort((a, b) => a.localeCompare(b))
}

function parseTagInput(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function getRecipeAssetSlug(recipe, routeSlug) {
  if (routeSlug) return routeSlug
  if (recipe.slug) return recipe.slug

  const titleSlug = createSlug(recipe.title)
  if (titleSlug && titleSlug !== createSlug(DEFAULT_RECIPE_TITLE)) {
    return titleSlug
  }

  return recipe.id
}

function AuthorEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [recipe, setRecipe] = useState(() => (slug ? null : createEmptyRecipe()))
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(() => Boolean(slug))
  const [photoPurpose, setPhotoPurpose] = useState('card')
  const [photoUpload, setPhotoUpload] = useState({
    isUploading: false,
    message: '',
    error: '',
  })
  const [knownTags, setKnownTags] = useState(DEFAULT_TAG_SUGGESTIONS)
  const [showAllTagSuggestions, setShowAllTagSuggestions] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isComponentPickerOpen, setIsComponentPickerOpen] = useState(false)
  const [assetLibrary, setAssetLibrary] = useState({
    assets: [],
    isLoading: false,
    error: '',
  })
  const assetLibrarySlug = recipe ? getRecipeAssetSlug(recipe, slug) : ''

  useEffect(() => {
    fetchRecipes()
      .then(all => {
        setKnownTags(collectKnownTags(all))
        if (slug) {
          const existing = all.find(r => r.slug === slug)
          if (existing) {
            setRecipe(existing)
          }
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (slug) {
          setIsLoading(false)
        }
      })
  }, [slug])

  useEffect(() => {
    if (!assetLibrarySlug || !token) {
      return
    }

    let isActive = true
    setAssetLibrary((prev) => ({ ...prev, isLoading: true, error: '' }))
    listRecipeImages({ recipeSlug: assetLibrarySlug, token })
      .then((assets) => {
        if (isActive) {
          setAssetLibrary({ assets, isLoading: false, error: '' })
        }
      })
      .catch((error) => {
        if (isActive) {
          setAssetLibrary((prev) => ({ ...prev, isLoading: false, error: error.message }))
        }
      })

    return () => {
      isActive = false
    }
  }, [assetLibrarySlug, token])

  if (isLoading) return <div style={{ padding: '80px', textAlign: 'center' }}><h2>Loading recipe data...</h2></div>
  if (!recipe) return <div style={{ padding: '80px', textAlign: 'center' }}><h2>Recipe not found.</h2><Link to="/">Back to Dashboard</Link></div>

  const updateMetadata = (key, value) => {
    setRecipe((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const addBlock = (type, options = {}) => {
    const defaultData = {
      hero: { kicker: '', summary: '', backgroundImage: '' },
      ingredients: { items: ['New ingredient'], image: '' },
      instructions: { steps: ['New step'] },
      notes: { items: ['New note'] },
      nutrition: { items: ['New info'] },
      media: { type: 'image', url: '', caption: '' },
      gallery: { images: [''], caption: '' },
    }

    setRecipe((prev) => ({
      ...prev,
      blocks: [...prev.blocks, { type, data: defaultData[type] || {} }],
    }))
    setHasChanges(true)
    if (options.closePicker) {
      setIsComponentPickerOpen(false)
    }
  }

  const removeBlock = (index) => {
    setRecipe((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index),
    }))
    setHasChanges(true)
  }

  const moveBlock = (index, direction) => {
    setRecipe((prev) => {
      const newBlocks = [...prev.blocks]
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= newBlocks.length) return prev
      ;[newBlocks[index], newBlocks[targetIndex]] = [
        newBlocks[targetIndex],
        newBlocks[index],
      ]
      return { ...prev, blocks: newBlocks }
    })
    setHasChanges(true)
  }

  const updateBlockData = (index, newData) => {
    setRecipe((prev) => {
      const newBlocks = [...prev.blocks]
      newBlocks[index] = { ...newBlocks[index], data: newData }
      return { ...prev, blocks: newBlocks }
    })
    setHasChanges(true)
  }

  const getRecipeSlugForSave = () => {
    if (slug) return slug
    if (recipe.slug) return recipe.slug

    const titleSlug = createSlug(recipe.title)
    if (titleSlug && titleSlug !== createSlug(DEFAULT_RECIPE_TITLE)) {
      return titleSlug
    }

    return recipe.id
  }

  const prepareRecipeForSave = (nextStatus) => ({
    ...recipe,
    slug: getRecipeSlugForSave(),
    status: nextStatus,
    category: recipe.category.trim(),
    image: recipe.image.trim(),
    tags: (recipe.tags || []).map((tag) => tag.trim()).filter(Boolean),
    blocks: recipe.blocks.map((block) => {
      if (block.type === 'hero') {
        return {
          ...block,
          data: {
            ...block.data,
            kicker: block.data.kicker?.trim() || recipe.category.trim(),
            summary: block.data.summary?.trim() || recipe.description.trim(),
            backgroundImage: block.data.backgroundImage?.trim() || '',
          },
        }
      }

      if (['ingredients', 'notes', 'nutrition'].includes(block.type)) {
        return {
          ...block,
          data: {
            ...block.data,
            items: (block.data.items || []).map((item) => item.trim()).filter(Boolean),
            image: block.data.image?.trim() || '',
          },
        }
      }

      if (block.type === 'instructions') {
        return {
          ...block,
          data: {
            ...block.data,
            steps: (block.data.steps || []).map((step) => step.trim()).filter(Boolean),
          },
        }
      }

      if (block.type === 'gallery') {
        return {
          ...block,
          data: {
            ...block.data,
            images: (block.data.images || []).map((image) => image.trim()).filter(Boolean),
            caption: block.data.caption?.trim() || '',
          },
        }
      }

      return block
    }),
  })

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openComponentSelector = () => {
    setIsComponentPickerOpen(true)
    document.getElementById('component-selector')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const refreshAssetLibrary = async () => {
    if (!assetLibrarySlug || !token) {
      return
    }

    setAssetLibrary((prev) => ({ ...prev, isLoading: true, error: '' }))

    try {
      const assets = await listRecipeImages({ recipeSlug: assetLibrarySlug, token })
      setAssetLibrary({ assets, isLoading: false, error: '' })
    } catch (error) {
      setAssetLibrary((prev) => ({ ...prev, isLoading: false, error: error.message }))
    }
  }

  const addTag = (tag) => {
    const normalizedTag = tag.trim()
    if (!normalizedTag) return

    setRecipe((prev) => {
      const currentTags = prev.tags || []
      const alreadySelected = currentTags.some(
        (existingTag) => existingTag.toLowerCase() === normalizedTag.toLowerCase(),
      )

      return alreadySelected ? prev : { ...prev, tags: [...currentTags, normalizedTag] }
    })
    setHasChanges(true)
  }

  const removeTag = (tag) => {
    setRecipe((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((existingTag) => existingTag !== tag),
    }))
    setHasChanges(true)
  }

  const getAssetRecipeSlug = () => {
    return getRecipeAssetSlug(recipe, slug)
  }

  const assignUploadedPhoto = (url, purpose) => {
    setRecipe((prev) => {
      if (purpose === 'card') {
        return { ...prev, image: url }
      }

      const blocks = [...prev.blocks]
      const matchingIndex = blocks.findIndex((block) => block.type === purpose || (purpose === 'media' && block.type === 'media'))

      if (purpose === 'hero') {
        const heroIndex = blocks.findIndex((block) => block.type === 'hero')
        if (heroIndex >= 0) {
          blocks[heroIndex] = {
            ...blocks[heroIndex],
            data: { ...blocks[heroIndex].data, backgroundImage: url },
          }
        } else {
          blocks.unshift({ type: 'hero', data: { backgroundImage: url } })
        }
      }

      if (purpose === 'ingredients') {
        const ingredientsIndex = blocks.findIndex((block) => block.type === 'ingredients')
        if (ingredientsIndex >= 0) {
          blocks[ingredientsIndex] = {
            ...blocks[ingredientsIndex],
            data: { ...blocks[ingredientsIndex].data, image: url },
          }
        } else {
          blocks.push({ type: 'ingredients', data: { items: ['New ingredient'], image: url } })
        }
      }

      if (purpose === 'media') {
        if (matchingIndex >= 0) {
          blocks[matchingIndex] = {
            ...blocks[matchingIndex],
            data: { ...blocks[matchingIndex].data, type: 'image', url },
          }
        } else {
          blocks.push({ type: 'media', data: { type: 'image', url, caption: '' } })
        }
      }

      if (purpose === 'gallery') {
        const galleryIndex = blocks.findIndex((block) => block.type === 'gallery')
        if (galleryIndex >= 0) {
          blocks[galleryIndex] = {
            ...blocks[galleryIndex],
            data: {
              ...blocks[galleryIndex].data,
              images: [...(blocks[galleryIndex].data.images || []).filter(Boolean), url],
            },
          }
        } else {
          blocks.push({ type: 'gallery', data: { images: [url], caption: '' } })
        }
      }

      return { ...prev, blocks }
    })
    setHasChanges(true)
  }

  const assignLibraryPhoto = (asset, purpose) => {
    const purposeLabel = PHOTO_PURPOSE_OPTIONS.find((option) => option.value === purpose)?.label.toLowerCase()

    assignUploadedPhoto(asset.url, purpose)
    setPhotoUpload({
      isUploading: false,
      error: '',
      message: `Added ${asset.filename} as ${purposeLabel}.`,
    })
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setPhotoUpload({ isUploading: false, message: '', error: 'Choose an image file to upload.' })
      return
    }

    setPhotoUpload({ isUploading: true, message: 'Compressing photo...', error: '' })

    try {
      const recipeSlug = getAssetRecipeSlug()
      const result = await uploadRecipeImage({
        file,
        recipeSlug,
        purpose: photoPurpose,
        token,
      })

      assignUploadedPhoto(result.url, photoPurpose)
      setAssetLibrary((prev) => ({
        assets: [
          {
            key: result.key || result.filename,
            purpose: photoPurpose,
            filename: result.filename,
            url: result.url,
            size: result.compressedSize,
            uploaded: new Date().toISOString(),
          },
          ...prev.assets.filter((asset) => asset.url !== result.url),
        ],
        isLoading: false,
        error: '',
      }))
      setPhotoUpload({
        isUploading: false,
        error: '',
        message: `${formatBytes(result.originalSize)} to ${formatBytes(result.compressedSize)}. Added ${PHOTO_PURPOSE_OPTIONS.find((option) => option.value === photoPurpose)?.label.toLowerCase()}.`,
      })
    } catch (error) {
      setPhotoUpload({ isUploading: false, message: '', error: error.message })
    }
  }

  const handleSave = async (nextStatus = recipe.status) => {
    setIsSaving(true)
    try {
      const recipeToSave = prepareRecipeForSave(nextStatus)
      const validation = validateRecipe(recipeToSave)

      if (!validation.valid) {
        alert(`Recipe is not ready to save:\n\n${validation.errors.join('\n')}`)
        return
      }

      await commitRecipe(recipeToSave)
      setRecipe(recipeToSave)
      setHasChanges(false)
      alert(recipeToSave.status === 'published' ? 'Recipe published to GitHub!' : 'Draft saved to GitHub!')
      if (!slug) {
        navigate(`/edit/${recipeToSave.slug}`)
      }
    } catch (e) {
      alert(`Failed to publish: ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedTags = (recipe.tags || []).filter(Boolean)
  const availableTagSuggestions = knownTags.filter(
    (tag) => !selectedTags.some((selectedTag) => selectedTag.toLowerCase() === tag.toLowerCase()),
  )
  const visibleTagSuggestions = showAllTagSuggestions
    ? availableTagSuggestions
    : availableTagSuggestions.slice(0, TAG_SUGGESTION_COLLAPSED_COUNT)
  const hasHiddenTagSuggestions = availableTagSuggestions.length > TAG_SUGGESTION_COLLAPSED_COUNT
  const previewRecipe = prepareRecipeForSave(recipe.status || 'draft')

  return (
    <div className="author-editor-layout">
      <aside className="editor-rail">
        <Link to="/" className="rail-back">Back</Link>
        <div className="rail-brand">
          <span>Claire Cooks</span>
          <strong>Recipe Studio</strong>
        </div>

        <nav className="rail-section" aria-label="Recipe sections">
          <p>Sections</p>
          <button type="button" onClick={() => scrollToSection('recipe-basics')}>Basics</button>
          <button type="button" onClick={() => scrollToSection('recipe-blocks')}>Content</button>
          <button type="button" onClick={() => scrollToSection('recipe-publish')}>Publish</button>
        </nav>

        <div className="rail-section">
          <p>Add Component</p>
          {BLOCK_OPTIONS.map((option) => (
            <button key={option.type} type="button" onClick={() => addBlock(option.type)}>
              {option.label}
            </button>
          ))}
        </div>
      </aside>

      <main className="recipe-workspace">
        <header className="recipe-studio-topbar">
          <div>
            <p className="eyebrow">Authoring</p>
            <h1>{recipe.title || 'Untitled Recipe'}</h1>
          </div>
          <div className="recipe-studio-actions">
            <button className="btn" type="button" onClick={() => setIsPreviewOpen(true)}>
              Preview Recipe
            </button>
            {hasChanges ? <span className="editor-status">Unsaved</span> : <span className="editor-status is-saved">Saved</span>}
          </div>
        </header>

        <section className={`component-selector${isComponentPickerOpen ? ' is-open' : ''}`} id="component-selector">
          <button
            className="component-selector-toggle"
            type="button"
            aria-expanded={isComponentPickerOpen}
            onClick={() => setIsComponentPickerOpen((isOpen) => !isOpen)}
          >
            <span>Component Selector</span>
            <strong>{isComponentPickerOpen ? 'Hide' : 'Show'}</strong>
          </button>

          {isComponentPickerOpen ? (
            <div className="component-selector-body">
              <select
                className="component-picker-select"
                value=""
                aria-label="Choose component"
                onChange={(event) => {
                  if (event.target.value) {
                    addBlock(event.target.value, { closePicker: true })
                  }
                }}
              >
                <option value="">Choose component...</option>
                {BLOCK_OPTIONS.map((option) => (
                  <option value={option.type} key={option.type}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="component-picker-grid">
                {BLOCK_OPTIONS.map((option) => (
                  <button type="button" key={option.type} onClick={() => addBlock(option.type, { closePicker: true })}>
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <article className="recipe-paper">
          <section className="recipe-paper-hero" id="recipe-basics">
            <div className="recipe-paper-copy">
              <div className="field-group field-group-title">
                <label>Recipe Title</label>
                <input
                  type="text"
                  value={recipe.title}
                  onChange={(e) => updateMetadata('title', e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Recipe Card Description</label>
                <textarea
                  value={recipe.description}
                  onChange={(e) => updateMetadata('description', e.target.value)}
                />
                <p className="field-hint">Short catalog blurb shown on recipe cards and search results.</p>
              </div>

              <div className="field-group">
                <label>Category</label>
                <input
                  type="text"
                  list="recipe-category-options"
                  placeholder="Dinner, Lunch, Dessert..."
                  value={recipe.category}
                  onChange={(e) => updateMetadata('category', e.target.value)}
                />
                <datalist id="recipe-category-options">
                  {CATEGORY_OPTIONS.map((category) => (
                    <option value={category} key={category} />
                  ))}
                </datalist>
                <p className="field-hint">Primary catalog grouping. Tags can handle the extra details.</p>
              </div>

              <div className="field-group">
                <label>Tags</label>
                <input
                  type="text"
                  value={(recipe.tags || []).join(', ')}
                  onChange={(e) => updateMetadata('tags', parseTagInput(e.target.value))}
                />
                <p className="field-hint">Use tags for search and filtering details beyond category.</p>
                {selectedTags.length > 0 ? (
                  <div className="tag-chip-list" aria-label="Selected tags">
                    {selectedTags.map((tag) => (
                      <button type="button" key={tag} onClick={() => removeTag(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="tag-suggestions" aria-label="Suggested tags">
                  {visibleTagSuggestions.map((tag) => (
                    <button type="button" key={tag} onClick={() => addTag(tag)}>
                      {tag}
                    </button>
                  ))}
                </div>
                {hasHiddenTagSuggestions ? (
                  <button
                    className="tag-suggestions-toggle"
                    type="button"
                    onClick={() => setShowAllTagSuggestions((isShowing) => !isShowing)}
                  >
                    {showAllTagSuggestions ? 'Show fewer tags' : `Show ${availableTagSuggestions.length - TAG_SUGGESTION_COLLAPSED_COUNT} more tags`}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="recipe-paper-media">
              <div className="recipe-paper-image">
                {recipe.image ? <img src={resolvePublicAsset(recipe.image)} alt="" /> : null}
                <span>{recipe.category}</span>
              </div>
              <div className="field-group">
                <label>Thumbnail URL</label>
                <input
                  type="text"
                  placeholder="/recipe-art/crepes.svg or https://..."
                  value={recipe.image}
                  onChange={(e) => updateMetadata('image', e.target.value)}
                />
                <p className="field-hint">Image shown on recipe cards and used as the hero fallback.</p>
              </div>
            </div>
          </section>

          <section className="recipe-quick-fields">
            <div className="field-group">
              <label>Prep</label>
              <input type="text" value={recipe.prepTime} onChange={(e) => updateMetadata('prepTime', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Cook</label>
              <input type="text" value={recipe.cookTime} onChange={(e) => updateMetadata('cookTime', e.target.value)} />
            </div>
            <div className="field-group">
              <label>Serves</label>
              <input type="number" value={recipe.servings} onChange={(e) => updateMetadata('servings', parseInt(e.target.value) || 0)} />
            </div>
            <div className="field-group">
              <label>Difficulty</label>
              <select value={recipe.difficulty} onChange={(e) => updateMetadata('difficulty', e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </section>

          <section className="recipe-blocks-panel" id="recipe-blocks">
            <div className="recipe-section-heading">
              <p className="eyebrow">Recipe Content</p>
              <h2>Build the cooking flow</h2>
            </div>

            {recipe.blocks.map((block, index) => (
              <div key={index} className="block-editor-item">
                <div className="block-editor-header">
                  <div>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h3>{block.type}</h3>
                  </div>
                  <div className="block-editor-actions">
                    <button className="tool-btn" type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0}>Up</button>
                    <button className="tool-btn" type="button" onClick={() => moveBlock(index, 1)} disabled={index === recipe.blocks.length - 1}>Down</button>
                    <button className="tool-btn danger" type="button" onClick={() => removeBlock(index)}>Remove</button>
                  </div>
                </div>

                {block.type === 'hero' && (
                  <div className="block-field-grid">
                    <div className="field-group">
                      <label>Hero Eyebrow</label>
                      <input
                        type="text"
                        placeholder={recipe.category || 'Dinner'}
                        value={block.data.kicker || ''}
                        onChange={(e) => updateBlockData(index, { ...block.data, kicker: e.target.value })}
                      />
                      <p className="field-hint">Small label above the title. Leave blank to use the category.</p>
                    </div>
                    <div className="field-group">
                      <label>Hero Summary</label>
                      <textarea
                        placeholder={recipe.description}
                        value={block.data.summary || ''}
                        onChange={(e) => updateBlockData(index, { ...block.data, summary: e.target.value })}
                      />
                      <p className="field-hint">Longer intro for the recipe page. Leave blank to reuse the card description.</p>
                    </div>
                    <div className="field-group block-field-wide">
                      <label>Hero Side Photo URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={block.data.backgroundImage || ''}
                        onChange={(e) => updateBlockData(index, { ...block.data, backgroundImage: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {block.type === 'media' && (
                  <div className="block-field-grid">
                    <div className="field-group">
                      <label>Type</label>
                      <select value={block.data.type} onChange={(e) => updateBlockData(index, { ...block.data, type: e.target.value })}>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Caption</label>
                      <input type="text" value={block.data.caption} onChange={(e) => updateBlockData(index, { ...block.data, caption: e.target.value })} />
                    </div>
                    <div className="field-group block-field-wide">
                      <label>URL</label>
                      <input type="text" placeholder="https://..." value={block.data.url} onChange={(e) => updateBlockData(index, { ...block.data, url: e.target.value })} />
                    </div>
                  </div>
                )}

                {block.type === 'gallery' && (
                  <div className="block-field-grid">
                    <div className="field-group block-field-wide">
                      <label>Photo URLs (one per line)</label>
                      <textarea
                        value={(block.data.images || []).join('\n')}
                        onChange={(e) => updateBlockData(index, { ...block.data, images: e.target.value.split('\n') })}
                      />
                    </div>
                    <div className="field-group block-field-wide">
                      <label>Caption</label>
                      <input
                        type="text"
                        value={block.data.caption || ''}
                        onChange={(e) => updateBlockData(index, { ...block.data, caption: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {block.type === 'ingredients' && (
                  <div className="block-field-grid">
                    <div className="field-group block-field-wide">
                      <label>Items (one per line)</label>
                      <textarea
                        value={(block.data.items || []).join('\n')}
                        onChange={(e) => updateBlockData(index, { ...block.data, items: e.target.value.split('\n') })}
                      />
                    </div>
                    <div className="field-group block-field-wide">
                      <label>Side Photo URL</label>
                      <input
                        type="text"
                        placeholder="/recipe-art/crepes.svg or https://..."
                        value={block.data.image || ''}
                        onChange={(e) => updateBlockData(index, { ...block.data, image: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {(block.type === 'instructions' || block.type === 'notes' || block.type === 'nutrition') && (
                  <div className="field-group">
                    <label>{block.type === 'instructions' ? 'Steps' : 'Items'} (one per line)</label>
                    <textarea
                      value={(block.data.items || block.data.steps || []).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n')
                        const key = block.type === 'instructions' ? 'steps' : 'items'
                        updateBlockData(index, { ...block.data, [key]: lines })
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="component-picker" aria-label="Add component">
            <button
              className="component-dropzone"
              type="button"
              onClick={openComponentSelector}
            >
              <strong>Add Component</strong>
              <span>Open the selector to add ingredients, steps, photos, notes, or nutrition.</span>
            </button>
          </section>
        </article>
      </main>

      <aside className="recipe-inspector" id="recipe-publish">
        <section className="inspector-card">
          <h2>Publishing</h2>
          <div className="field-group">
            <label>Status</label>
            <select value={recipe.status} onChange={(e) => updateMetadata('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <button className="btn" type="button" onClick={() => handleSave('draft')} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button className="btn btn-primary" type="button" onClick={() => handleSave('published')} disabled={isSaving}>
            {isSaving ? 'Publishing...' : 'Publish'}
          </button>
        </section>

        <section className="inspector-card">
          <h2>Photo Upload</h2>
          <div className="asset-upload">
            <div className="field-group">
              <label>Use Photo As</label>
              <select value={photoPurpose} onChange={(e) => setPhotoPurpose(e.target.value)}>
                {PHOTO_PURPOSE_OPTIONS.map((option) => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <label className={`asset-dropzone${photoUpload.isUploading ? ' is-busy' : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={photoUpload.isUploading}
              />
              <strong>{photoUpload.isUploading ? 'Working on photo...' : 'Choose Photo'}</strong>
              <span>Optimizes to WebP when supported, max 1600px wide, quality 80%.</span>
            </label>
            {photoUpload.message ? <p className="asset-upload-status">{photoUpload.message}</p> : null}
            {photoUpload.error ? <p className="asset-upload-status is-error">{photoUpload.error}</p> : null}
          </div>
        </section>

        <section className="inspector-card">
          <div className="asset-library-header">
            <div>
              <h2>Asset Library</h2>
              <p>{assetLibrarySlug}</p>
            </div>
            <button className="tool-btn" type="button" onClick={refreshAssetLibrary} disabled={assetLibrary.isLoading}>
              Refresh
            </button>
          </div>

          {assetLibrary.error ? <p className="asset-upload-status is-error">{assetLibrary.error}</p> : null}
          {assetLibrary.isLoading ? <p className="asset-library-note">Loading photos...</p> : null}
          {!assetLibrary.isLoading && assetLibrary.assets.length === 0 ? (
            <p className="asset-library-note">Uploaded photos for this recipe will appear here.</p>
          ) : null}

          {assetLibrary.assets.length > 0 ? (
            <div className="asset-library-grid">
              {assetLibrary.assets.map((asset) => (
                <article className="asset-library-item" key={asset.key}>
                  <img src={asset.url} alt="" />
                  <div>
                    <strong>{asset.purpose}</strong>
                    <span>{formatBytes(asset.size)}</span>
                  </div>
                  <div className="asset-library-actions" aria-label={`Use ${asset.filename} as`}>
                    {PHOTO_PURPOSE_OPTIONS.map((option) => (
                      <button type="button" key={option.value} onClick={() => assignLibraryPhoto(asset, option.value)}>
                        {option.value}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </aside>

      {isPreviewOpen ? (
        <div className="recipe-preview-overlay" role="dialog" aria-modal="true" aria-label="Recipe preview">
          <div className="recipe-preview-shell">
            <header className="recipe-preview-toolbar">
              <div>
                <p className="eyebrow">Draft Preview</p>
                <h2>{previewRecipe.title}</h2>
              </div>
              <button className="btn" type="button" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </button>
            </header>
            <div className="recipe-preview-content">
              <RecipeRenderer recipe={previewRecipe} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AuthorEditor
