import { Link, useParams } from 'react-router-dom'
import { getPublishedRecipeBySlug } from '../shared/content/recipes'
import RecipeRenderer from '../shared/renderer/RecipeRenderer'

function RecipeDetail() {
  const { slug } = useParams()
  const recipe = getPublishedRecipeBySlug(slug)

  if (!recipe) {
    return (
      <section className="empty-state">
        <h1>Recipe not found</h1>
        <p>This recipe is not in the local content library yet.</p>
        <Link to="/">Back to recipes</Link>
      </section>
    )
  }

  return <RecipeRenderer recipe={recipe} />
}

export default RecipeDetail
