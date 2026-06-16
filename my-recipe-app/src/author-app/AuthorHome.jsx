import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../shared/components/Header.jsx'
import { fetchRecipes, getLiveRecipeUrl, repository } from './services/github'

function AuthorHome() {
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecipes()
      .then(data => {
        setRecipes(data)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <h2>Loading content from GitHub...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)' }}>GitHub Connection Error</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>{error}</p>
        <p style={{ marginTop: '24px' }}>Check your token permissions for <code>{repository.fullName}</code>.</p>
      </div>
    )
  }

  return (
    <>
      <Header eyebrow="Author Mode" title="Workspace">
        <p>
          Manage your live content library by committing directly to the GitHub repository.
        </p>
      </Header>

      <section className="author-dashboard">
        <article className="author-panel">
          <header className="panel-header">
            <h2>Live Content Inventory</h2>
            <div className="panel-actions">
              <Link to="/new" className="btn btn-primary">
                + Create Recipe
              </Link>
            </div>
          </header>
          
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <div key={recipe.slug} className="recipe-card">
                <span className="category">{recipe.category}</span>
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {recipe.status}
                </p>
                <div className="card-footer">
                  {recipe.status === 'published' ? (
                    <a href={getLiveRecipeUrl(recipe.slug)} target="_blank" rel="noopener noreferrer" className="btn">View Live</a>
                  ) : (
                    <button className="btn" type="button" disabled>Draft</button>
                  )}
                  <Link to={`/edit/${recipe.slug}`} className="btn btn-primary">Edit</Link>
                </div>
              </div>
            ))}
          </div>

          <dl className="content-stats">
            <div>
              <dt>GitHub Recipes</dt>
              <dd>{recipes.length}</dd>
            </div>
            <div>
              <dt>Sync Status</dt>
              <dd style={{ fontSize: '14px', fontWeight: 700, color: 'var(--success)' }}>CONNECTED</dd>
            </div>
          </dl>
        </article>

        <article className="author-panel">
          <header className="panel-header">
            <h2>CMS Information</h2>
          </header>
          <div className="publishing-flow">
            <p>
              This workspace is connected directly to your GitHub repository. Every time you save a recipe, 
              a new commit is created in <code>{repository.fullName}</code> on the <code>main</code> branch,
              which may trigger a GitHub Pages redeploy.
            </p>
          </div>
        </article>
      </section>
    </>
  )
}

export default AuthorHome
