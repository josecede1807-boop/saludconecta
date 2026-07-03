import { CalendarDays, ClipboardPlus, FileText, UserRound, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import { StatusChip } from '../components/StatusChip'
import { useApp } from '../context/AppContext'

export function DoctorPage({ history = false }: { history?: boolean }) {
  const { appointments } = useApp()
  const visible = appointments.filter((item) => history
    ? ['completed', 'cancelled'].includes(item.status)
    : ['confirmed', 'pending'].includes(item.status))

  return (
    <DashboardLayout
      title={history ? 'Consultas atendidas' : 'Mi agenda médica'}
      subtitle={history ? 'Revisa las consultas finalizadas y sus indicaciones.' : 'Citas asignadas a tu perfil médico.'}
    >
      <section className="appointment-list">
        {visible.map((item) => (
          <article className="card appointment-card" key={item.id}>
            <div className="doctor-patient-icon"><UserRound /></div>
            <div className="appointment-main">
              <div className="appointment-heading"><div><h2>{item.patientName}</h2><span>{item.specialty}</span></div><StatusChip status={item.status} /></div>
              <div className="appointment-meta">
                <span><CalendarDays />{new Intl.DateTimeFormat('es-EC', { dateStyle: 'long' }).format(new Date(`${item.date}T12:00:00`))}</span>
                <span>{item.time}</span>
                <span>Motivo: {item.reason || 'Consulta general'}</span>
                <span>Seguro: {item.insurance}</span>
              </div>
            </div>
            <div className="appointment-actions">
              {item.status === 'confirmed' && <>
                <Link className="button button-primary button-small" to={`/consulta/${item.id}`}><Video />Entrar a consulta</Link>
                <Link className="button button-secondary button-small" to={`/medico/citas/${item.id}/cerrar`}><ClipboardPlus />Registrar atención</Link>
              </>}
              {item.status === 'completed' && <Link className="button button-secondary button-small" to={`/citas/${item.id}/documentos`}><FileText />Ver resumen</Link>}
            </div>
          </article>
        ))}
        {!visible.length && <div className="card empty-state"><CalendarDays /><h2>No hay consultas en esta sección</h2><p>Las citas asignadas aparecerán aquí.</p></div>}
      </section>
    </DashboardLayout>
  )
}
