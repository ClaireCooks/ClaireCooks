import { resolvePublicAsset } from '../../utils/assets'

function IngredientsBlock({ block }) {
  const { image, items } = block.data

  return (
    <section className={`recipe-section ingredients-block${image ? ' has-side-image' : ''}`}>
      <div className="ingredients-content">
        <h2 className="section-title">Ingredients</h2>
        <ul className="ingredient-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {image ? (
        <img
          className="ingredients-side-image"
          src={resolvePublicAsset(image)}
          alt=""
        />
      ) : null}
    </section>
  )
}

export default IngredientsBlock
