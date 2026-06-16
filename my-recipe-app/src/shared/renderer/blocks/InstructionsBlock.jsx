function InstructionsBlock({ block }) {
  return (
    <section className="recipe-section">
      <h2 className="section-title">Instructions</h2>
      <ol className="step-list">
        {block.data.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  )
}

export default InstructionsBlock
