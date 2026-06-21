import Header from '../shared/components/Header.jsx'
import claireAboutImg from '../shared/assets/ClaireAbout.jpeg'

function AboutMe() {
  return (
    <article className="about-me-page">
      <Header eyebrow="Behind the recipes" title="About Claire" />
      
      <div className="about-layout">
        <div className="about-image-large">
          <img src={claireAboutImg} alt="Claire" />
        </div>
        
        <div className="about-content-rich">
          <section className="about-section">
            <h2>The Kitchen Journey</h2>
            <p>
              My cooking journey has been entirely self-taught, shaped by years of
              curiosity, creativity, and a love for good food. Living with celiac
              disease pushed me to learn how to adapt recipes and experiment with new
              ingredients, but it also sparked a passion for cooking that continues to
              grow today.
            </p>
            <p>
              I love trying new recipes, learning new techniques, and finding ways to
              make gluten-free dishes feel just as special as their traditional
              counterparts.
            </p>
          </section>

          <section className="about-section">
            <h2>Philosophy</h2>
            <p>
              I believe gluten-free food should never feel like a compromise.
            </p>
            <p>
              My goal is to challenge that idea by creating recipes that are flavorful,
              exciting, and something you'll genuinely look forward to eating. Whether
              it's a comforting weeknight dinner, a decadent dessert, or a dish for a
              special occasion, every recipe should bring joy to the table.
            </p>
            <p>
              Great food is for everyone, and being gluten-free shouldn't mean missing
              out.
            </p>
          </section>

          <section className="about-section">
            <h2>Beyond the Plate</h2>
            <p>
              When I'm not in the kitchen, I'm a middle school psychologist who is
              passionate about helping students learn, grow, and succeed. Outside of
              work, you'll usually find me curled up with a good book, planning my next
              travel adventure, or exploring new places and experiences.
            </p>
          </section>
        </div>
      </div>
    </article>
  )
}

export default AboutMe
