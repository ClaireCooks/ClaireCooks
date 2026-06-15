import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { publishedRecipes } from '../content/recipes'

function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null) {
      setSearchTerm(q)
    }
  }, [searchParams])

  const categories = useMemo(() => {
    return ['All', ...new Set(publishedRecipes.map((recipe) => recipe.category))]
  }, [])

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return publishedRecipes.filter((recipe) => {
      const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory
      const searchableText = [
        recipe.title,
        recipe.description,
        recipe.category,
        recipe.difficulty,
        ...(recipe.tags ?? []),
      ]
        .join(' ')
        .toLowerCase()

      return matchesCategory && searchableText.includes(normalizedSearch)
    })
  }, [searchTerm, selectedCategory])

  return (
    <>
      <Header eyebrow="Recipe Library" title="Browse recipes">
        <p>
          Search the structured recipe library, filter by category, and open
          fully rendered recipe pages from local JSON content.
        </p>
      </Header>

      <section className="catalog-tools" aria-label="Recipe filters">
        <label className="search-field">
          <span>Search recipes</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title, tag, or category"
          />
        </label>

        <div className="category-filter" aria-label="Categories">
          {categories.map((category) => (
            <button
              className={category === selectedCategory ? 'is-selected' : ''}
              key={category}
              onClick={() => setSelectedCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="catalog-summary" aria-live="polite">
        <p>
          Showing {filteredRecipes.length} of {publishedRecipes.length} published recipes
        </p>
      </section>

      {filteredRecipes.length > 0 ? (
        <section className="recipe-grid" aria-label="Recipes">
          {filteredRecipes.map((recipe) => (
            <RecipeCard recipe={recipe} key={recipe.slug} />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>No recipes found</h2>
          <p>Try a different search term or category.</p>
        </section>
      )}
    </>
  )
}

function RecipeCard({ recipe }) {
  return (
    <Link className="recipe-card" to={`/recipes/${recipe.slug}`}>
      <img src={recipe.image} alt="" />
      <div className="recipe-card__body">
        <p className="eyebrow">{recipe.category}</p>
        <h2>{recipe.title}</h2>
        <p>{recipe.description}</p>
        <div className="recipe-card__tags" aria-label="Tags">
          {recipe.tags?.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <dl className="recipe-card__meta">
          <div>
            <dt>Prep</dt>
            <dd>{recipe.prepTime}</dd>
          </div>
          <div>
            <dt>Cook</dt>
            <dd>{recipe.cookTime}</dd>
          </div>
          <div>
            <dt>Level</dt>
            <dd>{recipe.difficulty}</dd>
          </div>
        </dl>
      </div>
    </Link>
  )
}

export default Recipes
