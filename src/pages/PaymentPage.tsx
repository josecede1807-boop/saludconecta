import { ArrowLeft, CalendarDays, CheckCircle2, CreditCard, LockKeyhole, ShieldCheck, Video } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DashboardLayout } from '../components/Layout'
import { useApp } from '../context/AppContext'
import type { AppointmentDraft } from '../types'

export function PaymentPage() {
  const { doctors, createAppointment } = useApp()
  const navigate = useNavigate()
  const draft = useMemo<AppointmentDraft | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('saludconecta:draft') || 'null') } catch { return null }
  }, [])
  const doctor = doctors.find((item) => item.id === draft?.doctorId)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: 'Mateo Pérez', number: '4111 1111 1111 1111', expiry: '12/28', cvv: '123' })
  const [error, setError] = useState('')

  if (!draft || !doctor) return <Navigate to="/agendar" replace />
  const total = draft.insurance === 'Atención particular' ? doctor.price : doctor.price / 2

  const pay = async (event: FormEvent) => {
    event.preventDefault()
    if (form.number.replace(/\s/g, '').length < 16 || form.cvv.length < 3) {
      setError('Completa los datos ficticios de la tarjeta.')
      return
    }
    setBusy(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    const appointment = await createAppointment(draft)
    sessionStorage.removeItem('saludconecta:draft')
    navigate(`/confirmacion/${appointment.id}`)
  }

  return (
    <DashboardLayout title="Confirmar y pagar" subtitle="Revisa la información antes de reservar la cita.">
      <Link className="back-link" to="/agendar"><ArrowLeft />Volver al agendamiento</Link>
      <div className="payment-grid">
        <section className="card summary-card">
          <h2>Resumen de cita</h2>
          <div className="selected-doctor"><Avatar name={doctor.name} color={doctor.color} size={58} /><div><strong>{doctor.name}</strong><small>{doctor.specialty}</small></div></div>
          <dl className="summary-list">
            <div><dt><Video />Tipo</dt><dd>Videoconsulta</dd></div>
            <div><dt><CalendarDays />Fecha</dt><dd>{new Intl.DateTimeFormat('es-EC', { dateStyle: 'long' }).format(new Date(`${draft.date}T12:00:00`))} · {draft.time}</dd></div>
            <div><dt><ShieldCheck />Cobertura</dt><dd>{draft.insurance}</dd></div>
          </dl>
          <div className="price-lines"><span>Valor consulta <strong>${doctor.price.toFixed(2)}</strong></span>{draft.insurance !== 'Atención particular' && <span>Cobertura demostrativa <strong>-${(doctor.price / 2).toFixed(2)}</strong></span>}<span className="price-total">Total <strong>${total.toFixed(2)} USD</strong></span></div>
        </section>

        <form className="card payment-card" onSubmit={pay}>
          <h2><CreditCard />Pago simulado</h2>
          <div className="notice"><CheckCircle2 /><span>Estos datos son ficticios. No se realizará ningún cargo.</span></div>
          <label>Nombre en la tarjeta<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Número de tarjeta<input required inputMode="numeric" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value.replace(/[^\d ]/g, '').slice(0, 19) })} /></label>
          <div className="form-row"><label>Vencimiento<input required value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value.slice(0, 5) })} /></label><label>CVV<input required inputMode="numeric" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })} /></label></div>
          {error && <div className="form-error">{error}</div>}
          <button className="button button-primary button-full" disabled={busy}><LockKeyhole />{busy ? 'Procesando pago...' : `Confirmar pago de $${total.toFixed(2)}`}</button>
          <small className="center-note">Pago académico simulado. No se almacenan datos de tarjeta.</small>
        </form>
      </div>
    </DashboardLayout>
  )
}
