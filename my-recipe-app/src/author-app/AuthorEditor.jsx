import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import RecipeRenderer from '../shared/renderer/RecipeRenderer'
import { fetchRecipes, commitRecipe } from './services/github'

const EMPTY_RECIPE = {
  id: `recipe-${Date.now()}`,
  title: 'New Recipe',
  slug: 'new-recipe',
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

function AuthorEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchRecipes()
        .then(all => {
          const existing = all.find(r => r.slug === slug)
          if (existing) {
            setRecipe(existing)
          }
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    } else {
      setRecipe(JSON.parse(JSON.stringify(EMPTY_RECIPE)))
      setIsLoading(false)
    }
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
      ingredients: { items: ['New ingredient'] },
      instructions: { steps: ['New step'] },
      notes: { items: ['New note'] },
      nutrition: { items: ['New info'] },
      media: { type: 'image', url: '', caption: '' },
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

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await commitRecipe(recipe)
      setHasChanges(false)
      alert('Recipe published to GitHub!')
      if (!slug) {
        navigate(`/edit/${recipe.slug}`)
      }
    } catch (e) {
      alert(`Failed to publish: ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="author-editor-layout">
      <aside className="editor-sidebar">
        <header className="editor-header">
          <Link to="/" className="site-nav a">&larr; Dashboard</Link>
          <h2>Editor</h2>
          {hasChanges && <span style={{ fontSize: '10px', color: 'var(--warm)', fontWeight: 800, marginLeft: 'auto' }}>UNSAVED</span>}
        </header>

        <section className="editor-fields">
          <div className="field-group">
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

          <div className="field-group-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="field-group">
              <label>Prep Time</label>
              <input
                type="text"
                value={recipe.prepTime}
                onChange={(e) => updateMetadata('prepTime', e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Cook Time</label>
              <input
                type="text"
                value={recipe.cookTime}
                onChange={(e) => updateMetadata('cookTime', e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Servings</label>
              <input
                type="number"
                value={recipe.servings}
                onChange={(e) => updateMetadata('servings', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="field-group">
              <label>Difficulty</label>
              <select
                value={recipe.difficulty}
                onChange={(e) => updateMetadata('difficulty', e.target.value)}
              >
                <option value="Easy">Easy</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="field-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={(recipe.tags || []).join(', ')}
              onChange={(e) => updateMetadata('tags', e.target.value.split(',').map(s => s.trim()))}
            />
          </div>

          <hr />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Content Blocks</h3>
            <div className="palette-dropdown">
              <button className="btn btn-primary" style={{ fontSize: '12px' }}>+ Add Block</button>
              <div className="palette-menu">
                <button onClick={() => addBlock('hero')}>Hero</button>
                <button onClick={() => addBlock('media')}>Media (Image/Video)</button>
                <button onClick={() => addBlock('ingredients')}>Ingredients</button>
                <button onClick={() => addBlock('instructions')}>Instructions</button>
                <button onClick={() => addBlock('notes')}>Notes</button>
                <button onClick={() => addBlock('nutrition')}>Nutrition</button>
              </div>
            </div>
          </div>

          {recipe.blocks.map((block, index) => (
            <div key={index} className="block-editor-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{block.type.toUpperCase()}</h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="tool-btn" onClick={() => moveBlock(index, -1)} disabled={index === 0}>&uarr;</button>
                  <button className="tool-btn" onClick={() => moveBlock(index, 1)} disabled={index === recipe.blocks.length - 1}>&darr;</button>
                  <button className="tool-btn danger" onClick={() => removeBlock(index)}>X</button>
                </div>
              </div>

              {block.type === 'hero' && (
                <div className="field-group">
                  <label>Kicker</label>
                  <input
                    type="text"
                    value={block.data.kicker}
                    onChange={(e) =>
                      updateBlockData(index, { ...block.data, kicker: e.target.value })
                    }
                  />
                  <label>Summary</label>
                  <textarea
                    value={block.data.summary}
                    onChange={(e) =>
                      updateBlockData(index, { ...block.data, summary: e.target.value })
                    }
                  />
                  <label>Background Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={block.data.backgroundImage || ''}
                    onChange={(e) =>
                      updateBlockData(index, { ...block.data, backgroundImage: e.target.value })
                    }
                  />
                </div>
              )}

              {block.type === 'media' && (
                <div className="field-group">
                  <label>Type</label>
                  <select 
                    value={block.data.type} 
                    onChange={(e) => updateBlockData(index, { ...block.data, type: e.target.value })}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video (Link/TikTok)</option>
                  </select>
                  <label>URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={block.data.url}
                    onChange={(e) =>
                      updateBlockData(index, { ...block.data, url: e.target.value })
                    }
                  />
                  <label>Caption</label>
                  <input
                    type="text"
                    value={block.data.caption}
                    onChange={(e) =>
                      updateBlockData(index, { ...block.data, caption: e.target.value })
                    }
                  />
                </div>
              )}
              {(block.type === 'ingredients' || block.type === 'instructions' || block.type === 'notes' || block.type === 'nutrition') && (
                <div className="field-group">
                  <label>{block.type === 'instructions' ? 'Steps' : 'Items'} (one per line)</label>
                  <textarea
                    value={(block.data.items || block.data.steps || []).join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n')
                      const key = block.type === 'instructions' ? 'steps' : 'items'
                      updateBlockData(index, {
                        ...block.data,
                        [key]: lines,
                      })
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </section>

        <footer className="editor-footer" style={{ display: 'grid', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Publishing to GitHub...' : 'Publish to GitHub'}
          </button>
        </footer>
      </aside>

      <main className="editor-preview">
        <div className="preview-label">Live Preview</div>
        <div className="preview-content">
          <RecipeRenderer recipe={recipe} />
        </div>
      </main>
    </div>
  )
}

export default AuthorEditor
