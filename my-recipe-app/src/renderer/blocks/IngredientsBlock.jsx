function IngredientsBlock({ block }) {
  return (
    <section className="recipe-section">
      <h2 className="section-title">Ingredients</h2>
      <ul className="ingredient-list">
        {block.data.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export default IngredientsBlock
