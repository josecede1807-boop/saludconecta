import { PhoneOff } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export function ConsultationPage() {
  const { id } = useParams()
  const { appointments, user } = useApp()
  const appointment = appointments.find((item) => item.id === id)
  const navigate = useNavigate()
  if (!appointment || !['confirmed', 'completed'].includes(appointment.status)) return <Navigate to="/citas" replace />

  const finish = async () => {
    if (user?.role === 'doctor') navigate(`/medico/citas/${appointment.id}/cerrar`)
    else navigate(user?.role === 'admin' ? '/admin' : '/citas')
  }

  return (
    <div className="consultation-page">
      <div className="prototype-bar">Prototipo académico — No es un servicio médico real</div>
      <header className="consultation-header"><div><strong>{user?.role === 'doctor' ? `Videoconsulta con ${appointment.patientName}` : `Videoconsulta con ${appointment.doctorName}`}</strong><span>{appointment.patientName} · {appointment.specialty}</span></div><button className="button button-danger" onClick={finish}><PhoneOff />{user?.role === 'doctor' ? 'Cerrar y registrar atención' : 'Salir de la consulta'}</button></header>
      <iframe
        className="jitsi-frame"
        src={`https://meet.jit.si/${encodeURIComponent(appointment.roomName)}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`}
        title="Videollamada SaludConecta"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
      />
      <div className="consultation-fallback">Si la sala no carga, revisa tu conexión a internet y los permisos de cámara y micrófono.</div>
    </div>
  )
}
