import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchRecipes, commitRecipe } from './services/github'
import { validateRecipe } from '../shared/content/recipes/schema'
import { createSlug } from '../shared/utils/slugs'
import { resolvePublicAsset } from '../shared/utils/assets'

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

function createEmptyRecipe() {
  return {
    id: `recipe-${Date.now()}`,
    title: 'New Recipe',
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
          kicker: 'New Recipe',
          summary: 'Enter a summary for the hero block',
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

function AuthorEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(() => (slug ? null : createEmptyRecipe()))
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(() => Boolean(slug))

  useEffect(() => {
    if (!slug) {
      return
    }

    fetchRecipes()
      .then(all => {
        const existing = all.find(r => r.slug === slug)
        if (existing) {
          setRecipe(existing)
        }
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [slug])

  if (isLoading) return <div style={{ padding: '80px', textAlign: 'center' }}><h2>Loading recipe data...</h2></div>
  if (!recipe) return <div style={{ padding: '80px', textAlign: 'center' }}><h2>Recipe not found.</h2><Link to="/">Back to Dashboard</Link></div>

  const updateMetadata = (key, value) => {
    setRecipe((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const addBlock = (type) => {
    const defaultData = {
      hero: { kicker: 'New Section', summary: 'Summary text', backgroundImage: '' },
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

  const prepareRecipeForSave = (nextStatus) => ({
    ...recipe,
    slug: slug || createSlug(recipe.title),
    status: nextStatus,
    category: recipe.category.trim(),
    image: recipe.image.trim(),
    tags: (recipe.tags || []).map((tag) => tag.trim()).filter(Boolean),
    blocks: recipe.blocks.map((block) => {
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
          <p>Add Block</p>
          {['hero', 'media', 'gallery', 'ingredients', 'instructions', 'notes', 'nutrition'].map((type) => (
            <button key={type} type="button" onClick={() => addBlock(type)}>
              {type}
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
          {hasChanges ? <span className="editor-status">Unsaved</span> : <span className="editor-status is-saved">Saved</span>}
        </header>

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
                <label>Description</label>
                <textarea
                  value={recipe.description}
                  onChange={(e) => updateMetadata('description', e.target.value)}
                />
              </div>
            </div>

            <div className="recipe-paper-image">
              {recipe.image ? <img src={resolvePublicAsset(recipe.image)} alt="" /> : null}
              <span>{recipe.category}</span>
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
                      <label>Kicker</label>
                      <input
                        type="text"
                        value={block.data.kicker}
                        onChange={(e) => updateBlockData(index, { ...block.data, kicker: e.target.value })}
                      />
                    </div>
                    <div className="field-group">
                      <label>Hero Side Photo URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={block.data.backgroundImage || ''}
                        onChange={(e) => updateBlockData(index, { ...block.data, backgroundImage: e.target.value })}
                      />
                    </div>
                    <div className="field-group block-field-wide">
                      <label>Summary</label>
                      <textarea
                        value={block.data.summary}
                        onChange={(e) => updateBlockData(index, { ...block.data, summary: e.target.value })}
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
          <h2>Recipe Card</h2>
          <div className="field-group">
            <label>Thumbnail URL</label>
            <input
              type="text"
              placeholder="/recipe-art/crepes.svg or https://..."
              value={recipe.image}
              onChange={(e) => updateMetadata('image', e.target.value)}
            />
          </div>
          <div className="inspector-thumbnail">
            {recipe.image ? <img src={resolvePublicAsset(recipe.image)} alt="" /> : null}
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
          </div>
          <div className="field-group">
            <label>Tags</label>
            <input
              type="text"
              value={(recipe.tags || []).join(', ')}
              onChange={(e) => updateMetadata('tags', e.target.value.split(',').map(s => s.trim()))}
            />
          </div>
        </section>
      </aside>
    </div>
  )
}

export default AuthorEditor
