function getInstructionSections(data) {
  if (Array.isArray(data.sections) && data.sections.length > 0) {
    return data.sections
      .map((section) => ({
        title: section.title || '',
        steps: (section.steps || []).filter(Boolean),
      }))
      .filter((section) => section.title || section.steps.length > 0)
  }

  return [{ title: '', steps: data.steps || [] }]
}

function InstructionsBlock({ block }) {
  const sections = getInstructionSections(block.data)

  return (
    <section className="recipe-section">
      <h2 className="section-title">Instructions</h2>
      <div className="recipe-subsection-list">
        {sections.map((section, sectionIndex) => (
          <div className="recipe-subsection" key={`${section.title}-${sectionIndex}`}>
            {section.title ? <h3>{section.title}</h3> : null}
            <ol className="step-list">
              {section.steps.map((step, stepIndex) => (
                <li key={`${step}-${stepIndex}`}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}

export default InstructionsBlock
