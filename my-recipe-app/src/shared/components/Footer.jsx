import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="brand">Claire Cooks</Link>
          <p>Elevated flavors for the modern home cook.</p>
        </div>
        
        <nav className="footer-nav">
          <div className="footer-nav-col">
            <h4>Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/recipes">Recipes</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="footer-nav-col">
            <h4>Connect</h4>
            <a href="https://www.instagram.com/claire_stone19/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@claire_stone19" target="_blank" rel="noopener noreferrer">TikTok</a>
          </div>
          <div className="footer-nav-col">
            <h4>Author</h4>
            <a href={`${import.meta.env.BASE_URL}author.html`}>Dashboard</a>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Claire Cooks. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
