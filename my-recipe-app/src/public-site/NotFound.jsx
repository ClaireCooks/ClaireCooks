import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="empty-state">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>This page is not in the Claire Cooks recipe book.</p>
      <Link className="btn btn-primary" to="/">Back Home</Link>
    </section>
  )
}

export default NotFound
