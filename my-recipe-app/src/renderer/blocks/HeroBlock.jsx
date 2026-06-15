function HeroBlock({ block, recipe }) {
  const { kicker, summary, backgroundImage } = block.data
  
  const sectionStyle = backgroundImage 
    ? { 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        border: 'none'
      } 
    : {}

  return (
    <section className="recipe-hero" style={sectionStyle}>
      <p className="eyebrow" style={backgroundImage ? {color: 'rgba(255,255,255,0.8)'} : {}}>{kicker}</p>
      <h1 style={backgroundImage ? {color: '#fff'} : {}}>{recipe.title}</h1>
      <p className="hero-summary" style={backgroundImage ? {color: 'rgba(255,255,255,0.9)'} : {}}>{summary}</p>
      
      <dl className="recipe-facts">
        <div style={backgroundImage ? {background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.2)'} : {}}>
          <dt style={backgroundImage ? {color: 'rgba(255,255,255,0.7)'} : {}}>Prep</dt>
          <dd style={backgroundImage ? {color: '#fff'} : {}}>{recipe.prepTime}</dd>
        </div>
        <div style={backgroundImage ? {background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.2)'} : {}}>
          <dt style={backgroundImage ? {color: 'rgba(255,255,255,0.7)'} : {}}>Cook</dt>
          <dd style={backgroundImage ? {color: '#fff'} : {}}>{recipe.cookTime}</dd>
        </div>
        <div style={backgroundImage ? {background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.2)'} : {}}>
          <dt style={backgroundImage ? {color: 'rgba(255,255,255,0.7)'} : {}}>Serves</dt>
          <dd style={backgroundImage ? {color: '#fff'} : {}}>{recipe.servings}</dd>
        </div>
        {recipe.difficulty ? (
          <div style={backgroundImage ? {background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.2)'} : {}}>
            <dt style={backgroundImage ? {color: 'rgba(255,255,255,0.7)'} : {}}>Level</dt>
            <dd style={backgroundImage ? {color: '#fff'} : {}}>{recipe.difficulty}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}

export default HeroBlock
