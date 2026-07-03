import { CalendarDays, HeartPulse, ToggleLeft, ToggleRight, Users, Video } from 'lucide-react'
import { Avatar } from '../components/Avatar'
import { DashboardLayout } from '../components/Layout'
import { StatusChip } from '../components/StatusChip'
import { useApp } from '../context/AppContext'

export function AdminPage({ doctorsOnly = false }: { doctorsOnly?: boolean }) {
  const { doctors, appointments, setDoctorAvailability } = useApp()
  const active = doctors.filter((item) => item.available).length
  const confirmed = appointments.filter((item) => item.status === 'confirmed').length

  if (doctorsOnly) {
    return (
      <DashboardLayout title="Gestión de médicos" subtitle="Habilita o pausa la disponibilidad para el agendamiento.">
        <section className="card admin-table-card"><div className="admin-doctor-list">
          {doctors.map((doctor) => (
            <article key={doctor.id}><Avatar name={doctor.name} color={doctor.color} /><div><strong>{doctor.name}</strong><small>{doctor.specialty} · ${doctor.price.toFixed(2)} USD</small></div><span className={`status ${doctor.available ? 'status-confirmed' : 'status-cancelled'}`}>{doctor.available ? 'Disponible' : 'Pausado'}</span><button className="icon-button" onClick={() => setDoctorAvailability(doctor.id, !doctor.available)} aria-label={doctor.available ? `Pausar a ${doctor.name}` : `Habilitar a ${doctor.name}`}>{doctor.available ? <ToggleRight /> : <ToggleLeft />}</button></article>
          ))}
        </div></section>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Resumen administrativo" subtitle="Estado general del prototipo Veris Videoconsulta.">
      <section className="metrics-grid">
        <article className="metric card"><span><CalendarDays /></span><div><small>Citas registradas</small><strong>{appointments.length}</strong></div></article>
        <article className="metric card"><span><HeartPulse /></span><div><small>Médicos activos</small><strong>{active}</strong></div></article>
        <article className="metric card"><span><Video /></span><div><small>Próximas consultas</small><strong>{confirmed}</strong></div></article>
        <article className="metric card"><span><Users /></span><div><small>Modo de datos</small><strong>Demo</strong></div></article>
      </section>
      <div className="admin-grid">
        <section className="card"><div className="card-title-row"><h2>Próximas citas</h2></div><div className="simple-list">
          {appointments.slice(0, 5).map((item) => <article key={item.id}><Avatar name={item.doctorName} size={40} /><div><strong>{item.patientName}</strong><small>{item.time} · {item.doctorName}</small></div><StatusChip status={item.status} /></article>)}
        </div></section>
        <section className="card"><div className="card-title-row"><h2>Estado de médicos</h2></div><div className="simple-list">
          {doctors.map((doctor) => <article key={doctor.id}><Avatar name={doctor.name} color={doctor.color} size={40} /><div><strong>{doctor.name}</strong><small>{doctor.specialty}</small></div><span className={`status ${doctor.available ? 'status-confirmed' : 'status-cancelled'}`}>{doctor.available ? 'Disponible' : 'Pausado'}</span></article>)}
        </div></section>
      </div>
    </DashboardLayout>
  )
}
