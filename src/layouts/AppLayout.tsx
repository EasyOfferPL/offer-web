import { Link, NavLink, Outlet } from 'react-router-dom'
import { API_BASE_URL } from '../api/config'

const navItems = [
  { to: '/offers', label: 'Offers' },
  { to: '/analytics', label: 'Analytics' },
]

export function AppLayout() {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            EasyOffer <span>Analytics</span>
          </Link>

          <nav aria-label="Main navigation">
            <ul className="nav">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      isActive ? 'nav-link is-active' : 'nav-link'
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="container main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span>EasyOffer frontend · M1 foundation</span>
          <span className="muted">
            API base: <code>{API_BASE_URL}</code>
          </span>
        </div>
      </footer>
    </div>
  )
}
