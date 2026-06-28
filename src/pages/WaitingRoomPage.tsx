import { Camera, CameraOff, Headphones, Lightbulb, Mic, MicOff, ShieldCheck, Video } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DashboardLayout } from '../components/Layout'
import { useApp } from '../context/AppContext'

export function WaitingRoomPage() {
  const { id } = useParams()
  const { appointments } = useApp()
  const appointment = appointments.find((item) => item.id === id)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [mediaError, setMediaError] = useState('')

  useEffect(() => {
    let active = true
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((track) => track.stop()); return }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => setMediaError('No fue posible acceder a cámara o micrófono. Puedes continuar y habilitarlos en la videollamada.'))
    return () => { active = false; streamRef.current?.getTracks().forEach((track) => track.stop()) }
  }, [])

  if (!appointment || appointment.status !== 'confirmed') return <Navigate to="/citas" replace />

  const toggleCamera = () => {
    const next = !cameraOn
    streamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next })
    setCameraOn(next)
  }
  const toggleMic = () => {
    const next = !micOn
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next })
    setMicOn(next)
  }

  return (
    <DashboardLayout title="Sala de espera" subtitle="Comprueba tu cámara y micrófono antes de entrar.">
      <div className="waiting-grid">
        <section className="camera-panel card">
          <div className="camera-frame">
            {mediaError ? <div className="camera-placeholder"><CameraOff /><p>{mediaError}</p></div> : <video ref={videoRef} autoPlay muted playsInline />}
            <div className="media-controls"><button className={!micOn ? 'off' : ''} onClick={toggleMic} aria-label={micOn ? 'Desactivar micrófono' : 'Activar micrófono'}>{micOn ? <Mic /> : <MicOff />}</button><button className={!cameraOn ? 'off' : ''} onClick={toggleCamera} aria-label={cameraOn ? 'Desactivar cámara' : 'Activar cámara'}>{cameraOn ? <Camera /> : <CameraOff />}</button></div>
          </div>
          <Link className="button button-primary button-full button-large" to={`/consulta/${appointment.id}`} onClick={() => streamRef.current?.getTracks().forEach((track) => track.stop())}><Video />Entrar a la videollamada</Link>
        </section>
        <aside className="waiting-side">
          <section className="card doctor-waiting"><Avatar name={appointment.doctorName} size={72} /><h2>{appointment.doctorName}</h2><p>{appointment.specialty}</p><span className="status status-confirmed">Listo para atender</span></section>
          <section className="card tips"><h2>Recomendaciones</h2><div><Lightbulb /><span><strong>Buena iluminación</strong><small>Ubícate frente a una fuente de luz.</small></span></div><div><Headphones /><span><strong>Usa auriculares</strong><small>Ayudan a evitar eco durante la llamada.</small></span></div><div><ShieldCheck /><span><strong>Entorno privado</strong><small>Busca un lugar tranquilo y sin interrupciones.</small></span></div></section>
        </aside>
      </div>
    </DashboardLayout>
  )
}
