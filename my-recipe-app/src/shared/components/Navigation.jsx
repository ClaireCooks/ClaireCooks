import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import Footer from './Footer.jsx'
import ScrollToTop from './ScrollToTop.jsx'

const Navigation = () => {
  const [query, setQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isEditor = location.pathname.startsWith('/author/new') || 
                   location.pathname.startsWith('/author/edit')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/recipes?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setIsMenuOpen(false)
    }
  }

  return (
    <div className="site-layout">
      <ScrollToTop />
      <header className="site-header">
        <div className="header-main">
          <NavLink className="brand" to="/" onClick={() => setIsMenuOpen(false)}>
            Claire Cooks
          </NavLink>
          
          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
        
        <div className={`header-collapsible ${isMenuOpen ? 'is-open' : ''}`}>
          <form className="nav-search" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search recipes..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <nav className="site-nav" aria-label="Primary navigation">
            <NavLink to="/" end onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/recipes" onClick={() => setIsMenuOpen(false)}>Recipes</NavLink>
            <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>About</NavLink>
            <a href={`${import.meta.env.BASE_URL}author.html`} onClick={() => setIsMenuOpen(false)}>Author</a>
          </nav>
        </div>
      </header>
      
      <main>
        <Outlet />
      </main>

      {!isEditor && <Footer />}
    </div>
  )
}

export default Navigation
