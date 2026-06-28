import { CalendarDays, CircleHelp, FileText, HeartPulse, Home, LogOut, Menu, Settings, Users, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Avatar } from './Avatar'

export function Brand() {
  return (
    <NavLink className="brand" to="/">
      <HeartPulse size={28} />
      <span>SaludConecta</span>
    </NavLink>
  )
}

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user } = useApp()
  return (
    <div className="app-shell">
      <div className="prototype-bar">Prototipo académico — No es un servicio médico real</div>
      <header className="public-header">
        <Brand />
        <nav className="public-nav" aria-label="Navegación principal">
          <NavLink to="/">Inicio</NavLink>
          <a href="#especialistas">Especialistas</a>
          <a href="#servicios">Servicios</a>
          <a href="#ayuda">Ayuda</a>
        </nav>
        <NavLink className="button button-primary button-small" to={user ? '/panel' : '/acceso'}>
          {user ? 'Ir al panel' : 'Ingresar'}
        </NavLink>
      </header>
      {children}
      <Footer />
    </div>
  )
}

export function DashboardLayout({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const { user, logout, dataMode } = useApp()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="dashboard-shell">
      <div className="prototype-bar">Prototipo académico — No es un servicio médico real</div>
      <header className="mobile-header">
        <button className="icon-button" onClick={() => setOpen(true)} aria-label="Abrir menú"><Menu /></button>
        <Brand />
        <Avatar name={user?.name || 'Usuario'} size={36} />
      </header>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Brand />
          <button className="icon-button close-menu" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X /></button>
        </div>
        <div className="user-summary">
          <Avatar name={user?.name || 'Usuario'} />
          <div><strong>{user?.name}</strong><small>{isAdmin ? 'Administración' : 'Paciente'}</small></div>
        </div>
        <nav className="sidebar-nav" onClick={() => setOpen(false)}>
          {isAdmin ? (
            <>
              <NavLink to="/admin"><Home />Resumen</NavLink>
              <NavLink to="/admin/medicos"><HeartPulse />Médicos</NavLink>
              <NavLink to="/citas"><CalendarDays />Citas</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/panel"><Home />Panel</NavLink>
              <NavLink to="/citas"><CalendarDays />Mis citas</NavLink>
              <NavLink to="/familia"><Users />Gestión familiar</NavLink>
              <NavLink to="/documentos"><FileText />Documentos</NavLink>
              <NavLink className="sidebar-cta" to="/agendar"><CalendarDays />Agendar cita</NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-bottom">
          <span className="mode-badge">{dataMode === 'demo' ? 'Modo demostración' : 'Conectado a Supabase'}</span>
          <button><Settings />Configuración</button>
          <button><CircleHelp />Ayuda</button>
          <button onClick={signOut}><LogOut />Cerrar sesión</button>
        </div>
      </aside>
      {open && <button className="sidebar-backdrop" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
      <main className="dashboard-main">
        {(title || subtitle) && (
          <header className="page-heading">
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </header>
        )}
        {children}
      </main>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <strong>SaludConecta</strong>
      <div><a href="#terminos">Términos</a><a href="#privacidad">Privacidad</a><a href="#contacto">Contacto</a></div>
      <small>© 2026 SaludConecta. Proyecto académico.</small>
    </footer>
  )
}
