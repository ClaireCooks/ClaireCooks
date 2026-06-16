import Header from '../shared/components/Header.jsx'
import claireImg from '../shared/assets/Claire.jpg'

function AboutMe() {
  return (
    <article className="about-me-page">
      <Header eyebrow="Behind the recipes" title="About Claire" />
      
      <div className="about-layout">
        <div className="about-image-large">
          <img src={claireImg} alt="Claire" />
        </div>
        
        <div className="about-content-rich">
          <section className="about-section">
            <h2>The Kitchen Journey</h2>
            <p>
              Welcome to my culinary sanctuary. I'm Claire, a self-taught cook and food 
              enthusiast dedicated to the art of simple, soulful cooking. My journey 
              started in a small kitchen with a handful of family recipes and a 
              passion for gathering people around the table.
            </p>
          </section>

          <section className="about-section">
            <h2>Philosophy</h2>
            <p>
              I believe that cooking should be an act of joy, not a chore. My recipes 
              focus on high-quality seasonal ingredients, clear techniques, and the 
              occasional creative twist on the classics. Whether you're a seasoned 
              chef or just starting out, there's a seat at this table for you.
            </p>
          </section>

          <section className="about-section">
            <h2>Beyond the Plate</h2>
            <p>
              When I'm not developing recipes or photographing food, you'll likely 
              find me exploring local farmers' markets, tending to my herb garden, 
              or hunting for vintage kitchenware.
            </p>
          </section>
        </div>
      </div>
    </article>
  )
}

export default AboutMe
