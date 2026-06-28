import { CalendarDays, FileText, Plus, Users, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DashboardLayout } from '../components/Layout'
import { StatusChip } from '../components/StatusChip'
import { useApp } from '../context/AppContext'

function displayDate(value: string) {
  return new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

export function DashboardPage() {
  const { user, appointments, family } = useApp()
  const nextAppointment = [...appointments]
    .filter((item) => item.status === 'confirmed' && new Date(`${item.date}T${item.time}`) >= new Date())
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]

  return (
    <DashboardLayout title={`Hola, ${user?.name.split(' ')[0]}`} subtitle="Aquí puedes revisar y gestionar tus videoconsultas.">
      <div className="dashboard-grid">
        <section className="card next-appointment">
          <div className="card-title-row"><h2><Video />Próxima videoconsulta</h2>{nextAppointment && <StatusChip status={nextAppointment.status} />}</div>
          {nextAppointment ? (
            <div className="appointment-highlight">
              <Avatar name={nextAppointment.doctorName} color="#cfe5ff" size={64} />
              <div className="appointment-info"><strong>{nextAppointment.doctorName}</strong><span>{nextAppointment.specialty}</span><span><CalendarDays />{displayDate(nextAppointment.date)} · {nextAppointment.time}</span></div>
              <Link className="button button-primary" to={`/citas/${nextAppointment.id}/sala`}>Preparar consulta</Link>
            </div>
          ) : (
            <div className="empty-state"><CalendarDays /><h3>No tienes citas próximas</h3><p>Agenda una videoconsulta cuando la necesites.</p><Link className="button button-primary" to="/agendar">Agendar ahora</Link></div>
          )}
        </section>

        <section className="quick-actions">
          <Link to="/agendar" className="quick-card"><span><Plus /></span><div><strong>Nueva cita</strong><small>Reserva una videoconsulta</small></div></Link>
          <Link to="/citas" className="quick-card"><span><CalendarDays /></span><div><strong>Mis citas</strong><small>{appointments.length} registradas</small></div></Link>
          <Link to="/familia" className="quick-card"><span><Users /></span><div><strong>Familiares</strong><small>{family.length} perfiles asociados</small></div></Link>
          <Link to="/documentos" className="quick-card"><span><FileText /></span><div><strong>Documentos</strong><small>Recetas y recomendaciones</small></div></Link>
        </section>
      </div>

      <section className="card recent-section">
        <div className="card-title-row"><h2>Citas recientes</h2><Link to="/citas">Ver todas</Link></div>
        <div className="simple-list">
          {appointments.slice(0, 3).map((item) => (
            <article key={item.id}>
              <Avatar name={item.doctorName} size={42} />
              <div><strong>{item.doctorName}</strong><small>{displayDate(item.date)} · {item.time}</small></div>
              <StatusChip status={item.status} />
            </article>
          ))}
          {!appointments.length && <p className="muted">No hay citas registradas todavía.</p>}
        </div>
      </section>
    </DashboardLayout>
  )
}
