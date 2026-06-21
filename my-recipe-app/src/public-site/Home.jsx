import { Link } from 'react-router-dom'
import { publishedRecipes } from '../shared/content/recipes'
import claireHomeImg from '../shared/assets/ClaireHome.jpeg'
import { resolvePublicAsset } from '../shared/utils/assets'

function Home() {
  const recentRecipes = publishedRecipes.slice(0, 3)

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="eyebrow">Claire Cooks</p>
          <h1>Elevated Flavors, <br />Simple Techniques.</h1>
          <div className="hero-actions">
            <Link to="/recipes" className="btn btn-primary">Browse Recipes</Link>
            <Link to="/about" className="btn">About Claire</Link>
          </div>
        </div>
      </section>

      {/* Carousel / Recent Recipes */}
      <section className="home-section">
        <div className="section-header">
          <h2>Latest Recipes</h2>
          <Link to="/recipes" className="text-link">View all recipes &rarr;</Link>
        </div>
        <div className="recipe-carousel">
          {recentRecipes.map(recipe => (
            <Link key={recipe.slug} to={`/recipes/${recipe.slug}`} className="carousel-card">
              <img src={resolvePublicAsset(recipe.image)} alt={recipe.title} />
              <div className="card-overlay">
                <span className="category">{recipe.category}</span>
                <h3>{recipe.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About Me Snapshot */}
      <section className="home-about-snapshot">
        <div className="snapshot-grid">
          <div className="snapshot-image">
            <img src={claireHomeImg} alt="Claire" />
          </div>
          <div className="snapshot-content">
            <p className="eyebrow">Meet the Author</p>
            <h2>I'm Claire, and I believe everyone can cook beautiful food.</h2>
            <p>
              I've been living gluten-free since I was diagnosed with celiac disease at
              nine years old. What started as a necessity eventually became a passion
              for cooking, creating, and sharing food that looks just as beautiful as it
              tastes.
            </p>
            <p>
              At 25, you'll usually find me in the kitchen testing new recipes, plating
              dishes for the perfect photo, or sharing my latest gluten-free creations
              online. Through this website and my social channels, my goal is simple: to
              show that gluten-free food doesn't have to feel limiting. It can be
              comforting, creative, impressive, and something you're genuinely excited to
              make and share.
            </p>
            <Link to="/about" className="btn btn-primary">Read My Story</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
