import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import Footer from './Footer.jsx'

const Navigation = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const isEditor = location.pathname.startsWith('/author/new') || 
                   location.pathname.startsWith('/author/edit')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/recipes?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <div className="site-layout">
      <header className="site-header">
        <NavLink className="brand" to="/">
          Claire Cooks
        </NavLink>
        
        <form className="nav-search" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search recipes..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <nav className="site-nav" aria-label="Primary navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/recipes">Recipes</NavLink>
          <NavLink to="/about">About</NavLink>
          <a href={`${import.meta.env.BASE_URL}author.html`}>Author</a>
        </nav>
      </header>
      
      <main>
        <Outlet />
      </main>

      {!isEditor && <Footer />}
    </div>
  )
}

export default Navigation
