import { Eye, EyeOff, HeartPulse, Info } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { DEMO_PASSWORD, DEMO_USER } from '../lib/demoData'

export function AuthPage() {
  const { user, login, register, dataMode } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', identification: '', email: '', password: '' })
  const navigate = useNavigate()
  const location = useLocation()

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'doctor' ? '/medico' : '/panel'} replace />

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (mode === 'register' && (!form.name.trim() || !form.identification.trim())) {
      setError('Completa tu nombre y número de identificación.')
      return
    }
    if (!form.email.includes('@') || form.password.length < 6) {
      setError('Ingresa un correo válido y una contraseña de al menos 6 caracteres.')
      return
    }
    setBusy(true)
    const message = mode === 'login'
      ? await login(form.email, form.password)
      : await register({ name: form.name, identification: form.identification, email: form.email, password: form.password })
    setBusy(false)
    if (message) {
      setError(message)
      return
    }
    const destination = (location.state as { from?: string } | null)?.from || '/panel'
    navigate(destination)
  }

  const fillDemo = () => setForm((current) => ({ ...current, email: DEMO_USER.email, password: DEMO_PASSWORD }))

  return (
    <div className="auth-page">
      <div className="prototype-bar">Prototipo académico inspirado en Veris Online — No es un servicio oficial</div>
      <a className="auth-brand" href="/"><HeartPulse />Veris Videoconsulta</a>
      <main className="auth-card">
        <div className="auth-title"><HeartPulse /><h1>Acceso al portal</h1><p>Gestiona tus videoconsultas en un solo lugar.</p></div>
        <div className="tabs" role="tablist">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>Iniciar sesión</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>Crear cuenta</button>
        </div>
        {dataMode === 'demo' && mode === 'login' && (
          <button type="button" className="demo-box" onClick={fillDemo}>
            <Info /><span><strong>Usar cuenta demostrativa</strong><small>{DEMO_USER.email} · {DEMO_PASSWORD}</small></span>
          </button>
        )}
        <form onSubmit={submit} className="form-stack">
          {mode === 'register' && (
            <>
              <label>Nombre completo<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ej. Mateo Pérez" autoComplete="name" /></label>
              <label>Número de identificación<input value={form.identification} onChange={(e) => update('identification', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Cédula" inputMode="numeric" /></label>
            </>
          )}
          <label>Correo electrónico<input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="nombre@correo.com" autoComplete="email" /></label>
          <label>Contraseña<span className="password-field"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff /> : <Eye />}</button></span></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button button-primary button-full" disabled={busy}>{busy ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</button>
        </form>
        <p className="auth-note">{dataMode === 'demo' ? 'Los datos se guardan únicamente en este navegador.' : 'Autenticación conectada con Supabase.'}</p>
      </main>
    </div>
  )
}
