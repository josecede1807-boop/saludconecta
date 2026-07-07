import { CalendarCheck, Clock3, Laptop, ShieldCheck, Stethoscope, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/Layout'

export function LandingPage() {
  const specialties = [
    { name: 'Medicina General', doctor: 'Dra. Ana López', available: true },
    { name: 'Cardiología', doctor: 'Dr. Carlos Mendoza', available: true },
    { name: 'Pediatría', doctor: 'Dra. María Gómez', available: true },
    { name: 'Dermatología', doctor: 'Dr. Javier Méndez', available: false },
  ]

  return (
    <PublicLayout>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Videoconsultas en Ecuador</span>
            <h1>Atención médica estés donde estés.</h1>
            <p>Agenda una consulta en línea, elige un especialista y conéctate desde tu computadora, tableta o celular.</p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/agendar"><CalendarCheck />Agendar videoconsulta</Link>
              <a className="button button-secondary" href="#especialistas">Ver especialistas</a>
            </div>
            <div className="trust-line"><ShieldCheck /> Proyecto académico con información ficticia</div>
          </div>
          <div className="hero-visual" aria-label="Ilustración de una consulta médica en línea">
            <div className="video-card">
              <div className="doctor-illustration"><Stethoscope size={80} /><span>Dra. Ana López</span></div>
              <div className="video-pill"><span className="online-dot" />Videoconsulta disponible</div>
            </div>
            <div className="floating-card"><ShieldCheck /><div><strong>Consulta segura</strong><small>Acceso mediante una sala privada</small></div></div>
          </div>
        </section>

        <section className="section" id="servicios">
          <div className="section-heading"><span className="eyebrow">Cómo funciona</span><h2>Una experiencia simple de principio a fin</h2></div>
          <div className="feature-grid">
            <article className="feature-card"><CalendarCheck /><h3>1. Agenda</h3><p>Selecciona paciente, especialidad, médico, fecha y horario.</p></article>
            <article className="feature-card"><Clock3 /><h3>2. Confirma</h3><p>Revisa el resumen y completa un pago simulado para reservar.</p></article>
            <article className="feature-card"><Laptop /><h3>3. Conéctate</h3><p>Ingresa a la sala desde cualquier dispositivo con internet.</p></article>
          </div>
        </section>

        <section className="section section-tinted" id="especialistas">
          <div className="section-heading"><span className="eyebrow">Especialidades de demostración</span><h2>Profesionales para distintas necesidades</h2></div>
          <div className="specialty-grid">
            {specialties.map((item) => item.available ? (
              <Link className="specialty-card specialty-card-link" key={item.name} to={`/agendar?especialidad=${encodeURIComponent(item.name)}`}>
                <Stethoscope /><strong>{item.name}</strong><span>{item.doctor}</span><small>Seleccionar especialidad →</small>
              </Link>
            ) : (
              <div className="specialty-card specialty-card-disabled" key={item.name} aria-disabled="true">
                <Stethoscope /><strong>{item.name}</strong><span>{item.doctor}</span><small>Temporalmente no disponible</small>
              </div>
            ))}
          </div>
        </section>

        <section className="section cta-section" id="ayuda">
          <Users size={42} />
          <div><h2>¿Listo para probar el sistema?</h2><p>Utiliza la cuenta demostrativa o registra un usuario nuevo.</p></div>
          <Link className="button button-primary" to="/acceso">Ingresar al prototipo</Link>
        </section>
      </main>
    </PublicLayout>
  )
}
