import { CalendarDays, FileText, Plus, Video } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DashboardLayout } from '../components/Layout'
import { StatusChip } from '../components/StatusChip'
import { useApp } from '../context/AppContext'

export function AppointmentsPage() {
  const { appointments, cancelAppointment, user } = useApp()
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const visible = appointments.filter((item) => tab === 'active' ? ['confirmed', 'pending'].includes(item.status) : ['completed', 'cancelled'].includes(item.status))

  return (
    <DashboardLayout title={user?.role === 'admin' ? 'Citas registradas' : 'Mis citas'} subtitle="Consulta las citas programadas y el historial.">
      {user?.role !== 'admin' && <div className="page-actions"><Link className="button button-primary" to="/agendar"><Plus />Agendar cita</Link></div>}
      <div className="tabs content-tabs"><button className={tab === 'active' ? 'active' : ''} onClick={() => setTab('active')}>Citas vigentes</button><button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>Historial</button></div>
      <section className="appointment-list">
        {visible.map((item) => (
          <article className="card appointment-card" key={item.id}>
            <Avatar name={item.doctorName} color="#cfe5ff" size={64} />
            <div className="appointment-main"><div className="appointment-heading"><div><h2>{item.doctorName}</h2><span>{item.specialty}</span></div><StatusChip status={item.status} /></div><div className="appointment-meta"><span><CalendarDays />{new Intl.DateTimeFormat('es-EC', { dateStyle: 'long' }).format(new Date(`${item.date}T12:00:00`))}</span><span>{item.time}</span><span>Paciente: {item.patientName}</span></div></div>
            <div className="appointment-actions">
              {item.status === 'confirmed' && <><Link className="button button-primary button-small" to={`/citas/${item.id}/sala`}><Video />Ingresar a sala</Link><button className="button button-danger button-small" onClick={() => cancelAppointment(item.id)}>Cancelar</button></>}
              {item.status === 'completed' && <Link className="button button-secondary button-small" to={`/citas/${item.id}/documentos`}><FileText />Ver documentos</Link>}
            </div>
          </article>
        ))}
        {!visible.length && <div className="card empty-state"><CalendarDays /><h2>No hay citas en esta sección</h2><p>Las citas aparecerán aquí cuando completes un agendamiento.</p></div>}
      </section>
    </DashboardLayout>
  )
}
