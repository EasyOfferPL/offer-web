import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="card">
        <p className="badge">404</p>
        <h1>Page not found</h1>
        <p className="muted">
          The address you opened does not match any screen in this frontend.
        </p>
        <Link to="/offers">Go to offers</Link>
      </div>
    </div>
  )
}
