function NutritionBlock({ block }) {
  return (
    <section className="recipe-section">
      <h2>Nutrition</h2>
      <ul className="note-list">
        {block.data.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export default NutritionBlock
