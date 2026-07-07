import { CalendarDays, Check, ChevronLeft, ChevronRight, HeartPulse, ShieldCheck, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DashboardLayout } from '../components/Layout'
import { useApp } from '../context/AppContext'
import type { AppointmentDraft } from '../types'

const steps = ['Paciente', 'Motivo', 'Especialidad', 'Médico', 'Horario', 'Seguro']
const insurances = [
  { name: 'Salud Integral EC', detail: 'Cobertura demostrativa del 50%' },
  { name: 'Red Médica Privada', detail: 'Cobertura demostrativa del 50%' },
  { name: 'Atención particular', detail: 'Pago completo de la consulta' },
]

function nextDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index + 1)
    return {
      value: date.toISOString().slice(0, 10),
      day: new Intl.DateTimeFormat('es-EC', { weekday: 'short' }).format(date),
      number: date.getDate(),
      month: new Intl.DateTimeFormat('es-EC', { month: 'short' }).format(date),
    }
  })
}

export function BookingPage() {
  const { user, family, doctors } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<AppointmentDraft>({ patientName: user?.name || '', doctorId: '', date: '', time: '', reason: '', insurance: '' })
  const dates = useMemo(nextDates, [])
  const selectedDoctor = doctors.find((item) => item.id === draft.doctorId)
  const specialties = [...new Set(doctors.filter((doctor) => doctor.available).map((doctor) => doctor.specialty))]
  const [specialty, setSpecialty] = useState(searchParams.get('especialidad') || '')

  const validateStep = () => {
    if (step === 0 && !draft.patientName) return 'Selecciona el paciente.'
    if (step === 2 && !specialty) return 'Selecciona una especialidad.'
    if (step === 3 && !draft.doctorId) return 'Selecciona un médico.'
    if (step === 4 && (!draft.date || !draft.time)) return 'Selecciona una fecha y un horario.'
    if (step === 5 && !draft.insurance) return 'Selecciona un seguro o atención particular.'
    return ''
  }

  const next = () => {
    const validation = validateStep()
    if (validation) { setError(validation); return }
    setError('')
    if (step < steps.length - 1) setStep((value) => value + 1)
  }

  const continueToPayment = () => {
    const validation = validateStep()
    if (validation) { setError(validation); return }
    sessionStorage.setItem('saludconecta:draft', JSON.stringify(draft))
    navigate('/pago')
  }

  return (
    <DashboardLayout title="Agendar videoconsulta" subtitle="Completa los pasos para reservar tu cita.">
      <div className="booking-layout">
        <aside className="stepper" aria-label="Progreso de agendamiento">
          {steps.map((label, index) => (
            <div className={index === step ? 'step-active' : index < step ? 'step-done' : ''} key={label}>
              <span>{index < step ? <Check /> : index + 1}</span><strong>{label}</strong>
            </div>
          ))}
        </aside>

        <section className="card booking-card">
          {step === 0 && (
            <div className="booking-step"><h2>¿Para quién es la cita?</h2><p>Selecciona el paciente que recibirá la atención.</p><div className="choice-grid">
              {[user?.name, ...family.map((item) => item.name)].filter(Boolean).map((name) => (
                <button className={`choice-card ${draft.patientName === name ? 'selected' : ''}`} key={name} onClick={() => setDraft({ ...draft, patientName: name! })}><UserRound /><span><strong>{name}</strong><small>{name === user?.name ? 'Mi perfil' : 'Familiar asociado'}</small></span>{draft.patientName === name && <Check />}</button>
              ))}
            </div></div>
          )}

          {step === 1 && (
            <div className="booking-step"><h2>Motivo de consulta</h2><p>Describe brevemente el motivo. Este campo es opcional.</p><label>Descripción<textarea maxLength={500} rows={6} value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} placeholder="Ej. Dolor de cabeza desde hace tres días..." /><small>{draft.reason.length}/500 caracteres</small></label></div>
          )}

          {step === 2 && (
            <div className="booking-step"><h2>Selecciona una especialidad</h2><p>Mostraremos los médicos disponibles.</p><div className="choice-grid">
              {specialties.map((item) => <button className={`choice-card ${specialty === item ? 'selected' : ''}`} key={item} onClick={() => { setSpecialty(item); setDraft({ ...draft, doctorId: '' }) }}><HeartPulse /><strong>{item}</strong>{specialty === item && <Check />}</button>)}
            </div></div>
          )}

          {step === 3 && (
            <div className="booking-step"><h2>Elige un médico</h2><p>{specialty}</p><div className="doctor-grid">
              {doctors.filter((doctor) => doctor.available && doctor.specialty === specialty).map((doctor) => (
                <button className={`doctor-card ${draft.doctorId === doctor.id ? 'selected' : ''}`} key={doctor.id} onClick={() => setDraft({ ...draft, doctorId: doctor.id, date: '', time: '' })}><Avatar name={doctor.name} color={doctor.color} size={64} /><span><strong>{doctor.name}</strong><small>{doctor.specialty}</small><small>${doctor.price.toFixed(2)} USD</small></span>{draft.doctorId === doctor.id && <Check />}</button>
              ))}
            </div></div>
          )}

          {step === 4 && selectedDoctor && (
            <div className="booking-step"><h2>Fecha y horario</h2><div className="selected-doctor"><Avatar name={selectedDoctor.name} color={selectedDoctor.color} /><div><strong>{selectedDoctor.name}</strong><small>{selectedDoctor.specialty}</small></div></div><h3>Selecciona una fecha</h3><div className="date-grid">
              {dates.map((date) => <button className={draft.date === date.value ? 'selected' : ''} key={date.value} onClick={() => setDraft({ ...draft, date: date.value, time: '' })}><small>{date.day}</small><strong>{date.number}</strong><small>{date.month}</small></button>)}
            </div>{draft.date && <><h3>Horarios disponibles</h3><div className="time-grid">{selectedDoctor.slots.map((time) => <button className={draft.time === time ? 'selected' : ''} key={time} onClick={() => setDraft({ ...draft, time })}>{time}</button>)}</div></>}</div>
          )}

          {step === 5 && selectedDoctor && (
            <div className="booking-step"><h2>Seguro o convenio</h2><p>Selecciona una opción para calcular el valor final.</p><div className="insurance-grid">
              {insurances.map((item) => <button className={`choice-card ${draft.insurance === item.name ? 'selected' : ''}`} key={item.name} onClick={() => setDraft({ ...draft, insurance: item.name })}><ShieldCheck /><span><strong>{item.name}</strong><small>{item.detail}</small></span>{draft.insurance === item.name && <Check />}</button>)}
            </div>{draft.insurance && <div className="total-preview"><span>Total estimado</span><strong>${(draft.insurance === 'Atención particular' ? selectedDoctor.price : selectedDoctor.price / 2).toFixed(2)} USD</strong></div>}</div>
          )}

          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="booking-actions">
            <button className="button button-secondary" onClick={() => step === 0 ? navigate('/panel') : setStep((value) => value - 1)}><ChevronLeft />{step === 0 ? 'Cancelar' : 'Atrás'}</button>
            {step < steps.length - 1 ? <button className="button button-primary" onClick={next}>Siguiente<ChevronRight /></button> : <button className="button button-primary" onClick={continueToPayment}>Continuar al pago<ChevronRight /></button>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
