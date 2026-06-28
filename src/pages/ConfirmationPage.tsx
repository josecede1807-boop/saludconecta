import { CalendarDays, Check, Download, Video } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import { useApp } from '../context/AppContext'

export function ConfirmationPage() {
  const { id } = useParams()
  const { appointments } = useApp()
  const appointment = appointments.find((item) => item.id === id)
  if (!appointment) return <Navigate to="/citas" replace />

  const downloadReminder = () => {
    const content = `SALUDCONECTA - RECORDATORIO DE CITA\n\nPaciente: ${appointment.patientName}\nMédico: ${appointment.doctorName}\nEspecialidad: ${appointment.specialty}\nFecha: ${appointment.date}\nHora: ${appointment.time}\nModalidad: Videoconsulta\n\nPrototipo académico.`
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `recordatorio-${appointment.id}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <section className="confirmation-card card">
        <span className="success-icon"><Check /></span>
        <h1>¡Cita confirmada!</h1>
        <p>Tu pago simulado fue aprobado y la videoconsulta quedó registrada.</p>
        <div className="confirmation-details">
          <strong>{appointment.doctorName}</strong><span>{appointment.specialty}</span>
          <div><CalendarDays />{new Intl.DateTimeFormat('es-EC', { dateStyle: 'long' }).format(new Date(`${appointment.date}T12:00:00`))} · {appointment.time}</div>
          <div><Video />Videoconsulta · el enlace está disponible en Mis citas</div>
        </div>
        <div className="confirmation-actions"><Link className="button button-primary" to="/citas">Ver mis citas</Link><button className="button button-secondary" onClick={downloadReminder}><Download />Descargar recordatorio</button></div>
      </section>
    </DashboardLayout>
  )
}
