import { NavLink, Outlet } from 'react-router-dom'
import './AppLayout.css'

const NAV_ITEMS = [
  { to: '/', label: 'Nueva conciliación' },
  { to: '/resultados', label: 'Resultados' },
  { to: '/historial', label: 'Historial' },
]

export default function AppLayout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__mark">⊞</span>
          <div>
            <h1 className="app-header__title">Libro de Conciliación</h1>
            <p className="app-header__subtitle">Banco × Sistema — Supervielle ALAMO</p>
          </div>
        </div>
        <nav className="app-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
