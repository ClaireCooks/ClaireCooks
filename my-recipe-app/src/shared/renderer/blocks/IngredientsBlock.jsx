import { resolvePublicAsset } from '../../utils/assets'

function getIngredientSections(data) {
  if (Array.isArray(data.sections) && data.sections.length > 0) {
    return data.sections
      .map((section) => ({
        title: section.title || '',
        items: (section.items || []).filter(Boolean),
      }))
      .filter((section) => section.title || section.items.length > 0)
  }

  return [{ title: '', items: data.items || [] }]
}

function IngredientsBlock({ block }) {
  const { image } = block.data
  const sections = getIngredientSections(block.data)

  return (
    <section className={`recipe-section ingredients-block${image ? ' has-side-image' : ''}`}>
      <div className="ingredients-content">
        <h2 className="section-title">Ingredients</h2>
        <div className="recipe-subsection-list">
          {sections.map((section, sectionIndex) => (
            <div className="recipe-subsection" key={`${section.title}-${sectionIndex}`}>
              {section.title ? <h3>{section.title}</h3> : null}
              <ul className="ingredient-list">
                {section.items.map((item, itemIndex) => (
                  <li key={`${item}-${itemIndex}`}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
