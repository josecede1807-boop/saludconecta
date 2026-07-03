import { Save, Stethoscope } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import { useApp } from '../context/AppContext'

export function DoctorClosePage() {
  const { id } = useParams()
  const { appointments, completeMedicalConsultation } = useApp()
  const appointment = appointments.find((item) => item.id === id)
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    diagnosis: appointment?.diagnosis || '',
    indications: appointment?.indications || '',
    prescription: appointment?.prescription || '',
  })

  if (!appointment) return <Navigate to="/medico" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.diagnosis.trim() || !form.indications.trim()) {
      setError('Registra al menos el diagnóstico y las indicaciones.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await completeMedicalConsultation(appointment.id, form)
      navigate('/medico/historial')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la consulta.')
      setBusy(false)
    }
  }

  return (
    <DashboardLayout title="Registrar atención" subtitle={`${appointment.patientName} · ${appointment.date} · ${appointment.time}`}>
      <form className="card medical-form form-stack" onSubmit={submit}>
        <div className="medical-form-heading"><Stethoscope /><div><h2>Resumen médico</h2><p>Documento demostrativo sin validez médica.</p></div></div>
        <label>Diagnóstico o impresión clínica<textarea rows={3} value={form.diagnosis} onChange={(event) => setForm((current) => ({ ...current, diagnosis: event.target.value }))} placeholder="Ej. Cuadro respiratorio leve en observación" /></label>
        <label>Indicaciones y recomendaciones<textarea rows={5} value={form.indications} onChange={(event) => setForm((current) => ({ ...current, indications: event.target.value }))} placeholder="Reposo, hidratación y signos de alarma..." /></label>
        <label>Prescripción simulada (opcional)<textarea rows={3} value={form.prescription} onChange={(event) => setForm((current) => ({ ...current, prescription: event.target.value }))} placeholder="No se prescribe medicación / indicación demostrativa" /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary" disabled={busy}><Save />{busy ? 'Guardando...' : 'Guardar y finalizar consulta'}</button>
      </form>
    </DashboardLayout>
  )
}
