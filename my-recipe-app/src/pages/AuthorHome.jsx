import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { invalidRecipes, recipes } from '../content/recipes'
import { importRecipesFromJSON } from '../utils/storage'

function AuthorHome() {
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const success = importRecipesFromJSON(event.target.result)
        if (success) {
          alert('Recipes imported successfully! Refreshing...')
          window.location.reload()
        } else {
          alert('Failed to import recipes. Check JSON format.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <>
      <Header eyebrow="Author Mode" title="Workspace">
        <p>
          Visually build recipes, manage your local content library, and export
          bundles for static publishing.
        </p>
      </Header>

      <section className="author-dashboard">
        <article className="author-panel">
          <header className="panel-header">
            <h2>Content Inventory</h2>
            <div className="panel-actions">
              <button onClick={handleImport} className="btn">Import JSON</button>
              <Link to="/author/new" className="btn btn-primary">
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
                <div className="card-footer">
                  <Link to={`/recipes/${recipe.slug}`} className="btn">View</Link>
                  <Link to={`/author/edit/${recipe.slug}`} className="btn btn-primary">Edit</Link>
                </div>
              </div>
            ))}
          </div>

          <dl className="content-stats">
            <div>
              <dt>Valid recipes</dt>
              <dd>{recipes.length}</dd>
            </div>
            <div>
              <dt>Validation issues</dt>
              <dd>{invalidRecipes.length}</dd>
            </div>
          </dl>
        </article>

        <article className="author-panel">
          <header className="panel-header">
            <h2>Validation Report</h2>
          </header>
          {invalidRecipes.length > 0 ? (
            <ul className="issue-list">
              {invalidRecipes.map((recipe) => (
                <li key={recipe.id} className="issue-item">
                  <strong>{recipe.id}</strong>: {recipe.errors.join(' ')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="status-message success">All local recipe JSON files match the current schema.</p>
          )}
        </article>

        <article className="author-panel">
          <header className="panel-header">
            <h2>Publishing</h2>
          </header>
          <div className="publishing-flow">
            <p>
              Export a consolidated JSON bundle to be added to the project repository for deployment.
            </p>
            <button 
              onClick={() => import('../utils/storage').then(m => m.exportAllRecipes())} 
              className="btn btn-primary"
            >
              Export Production Bundle
            </button>
          </div>
        </article>
      </section>
    </>
  )
}

export default AuthorHome
