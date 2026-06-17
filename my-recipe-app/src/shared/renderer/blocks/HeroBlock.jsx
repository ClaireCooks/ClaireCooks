import { resolvePublicAsset } from '../../utils/assets'

function HeroBlock({ block, recipe }) {
  const { kicker, summary, backgroundImage } = block.data
  const resolvedBackgroundImage = resolvePublicAsset(backgroundImage || recipe.image)

  return (
    <section className="recipe-hero">
      <div className="recipe-hero__copy">
        <p className="eyebrow">{kicker}</p>
        <h1>{recipe.title}</h1>
        <p className="hero-summary">{summary}</p>
        
        <dl className="recipe-facts">
          <div>
            <dt>Prep</dt>
            <dd>{recipe.prepTime}</dd>
          </div>
          <div>
            <dt>Cook</dt>
            <dd>{recipe.cookTime}</dd>
          </div>
          <div>
            <dt>Serves</dt>
            <dd>{recipe.servings}</dd>
          </div>
          {recipe.difficulty ? (
            <div>
              <dt>Level</dt>
              <dd>{recipe.difficulty}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {resolvedBackgroundImage ? (
        <img className="recipe-hero__image" src={resolvedBackgroundImage} alt="" />
      ) : null}
    </section>
  )
}

export default HeroBlock
