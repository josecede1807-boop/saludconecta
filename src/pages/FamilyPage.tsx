import { Plus, Trash2, UserRound, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { DashboardLayout } from '../components/Layout'
import { useApp } from '../context/AppContext'

export function FamilyPage() {
  const { family, addFamilyMember, deleteFamilyMember } = useApp()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', relationship: '', birthDate: '', identification: '' })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    await addFamilyMember(form)
    setBusy(false)
    setOpen(false)
    setForm({ name: '', relationship: '', birthDate: '', identification: '' })
  }

  return (
    <DashboardLayout title="Gestión familiar" subtitle="Administra los perfiles para quienes puedes reservar una cita.">
      <div className="page-actions"><button className="button button-primary" onClick={() => setOpen(true)}><Plus />Agregar familiar</button></div>
      <section className="family-grid">
        {family.map((member) => (
          <article className="card family-card" key={member.id}>
            <div className="family-top"><Avatar name={member.name} size={60} /><div><h2>{member.name}</h2><span className="relationship">{member.relationship}</span></div></div>
            <dl><div><dt>Identificación</dt><dd>{member.identification}</dd></div><div><dt>Fecha de nacimiento</dt><dd>{new Intl.DateTimeFormat('es-EC').format(new Date(`${member.birthDate}T12:00:00`))}</dd></div></dl>
            <button className="button button-danger button-small" onClick={() => deleteFamilyMember(member.id)}><Trash2 />Eliminar</button>
          </article>
        ))}
        {!family.length && <div className="card empty-state"><UserRound /><h2>No hay familiares</h2><p>Agrega un perfil para reservar citas a su nombre.</p></div>}
      </section>

      {open && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="family-modal-title">
            <div className="modal-header"><h2 id="family-modal-title">Nuevo familiar</h2><button className="icon-button" onClick={() => setOpen(false)} aria-label="Cerrar"><X /></button></div>
            <form className="form-stack" onSubmit={submit}>
              <label>Nombre completo<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>Parentesco<select required value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}><option value="">Selecciona</option><option>Madre</option><option>Padre</option><option>Hijo/a</option><option>Pareja</option><option>Otro</option></select></label>
              <label>Fecha de nacimiento<input required type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></label>
              <label>Identificación<input required inputMode="numeric" value={form.identification} onChange={(e) => setForm({ ...form, identification: e.target.value.replace(/\D/g, '').slice(0, 10) })} /></label>
              <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button button-primary" disabled={busy}>{busy ? 'Guardando...' : 'Guardar'}</button></div>
            </form>
          </section>
        </div>
      )}
    </DashboardLayout>
  )
}
