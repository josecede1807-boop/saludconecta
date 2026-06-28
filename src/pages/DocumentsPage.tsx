import { Download, FileText, Printer, Stethoscope } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '../components/Layout'
import { useApp } from '../context/AppContext'

function downloadText(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function DocumentsPage() {
  const { id } = useParams()
  const { appointments } = useApp()
  const completed = appointments.filter((item) => item.status === 'completed')
  const appointment = id ? appointments.find((item) => item.id === id) : completed[0]

  if (id && !appointment) return <Navigate to="/citas" replace />

  if (!appointment) {
    return <DashboardLayout title="Documentos" subtitle="Recetas, recomendaciones y certificados demostrativos."><div className="card empty-state"><FileText /><h2>Aún no tienes documentos</h2><p>Finaliza una videoconsulta para generar el resumen demostrativo.</p><Link className="button button-primary" to="/citas">Ver mis citas</Link></div></DashboardLayout>
  }

  const report = `SALUDCONECTA - RESUMEN POST-CONSULTA\nPROTOTIPO ACADÉMICO - SIN VALIDEZ MÉDICA\n\nPaciente: ${appointment.patientName}\nMédico: ${appointment.doctorName}\nEspecialidad: ${appointment.specialty}\nFecha: ${appointment.date}\n\nRecomendaciones demostrativas:\n- Mantener hidratación y reposo según necesidad.\n- Solicitar valoración presencial si los síntomas empeoran.\n- En caso de emergencia, acudir inmediatamente a un centro asistencial.\n\nEste documento es ficticio y se genera únicamente para demostrar el sistema.`

  return (
    <DashboardLayout title="Resumen post-consulta" subtitle="Documentos ficticios generados para la demostración.">
      <div className="document-actions"><button className="button button-secondary" onClick={() => window.print()}><Printer />Imprimir o guardar como PDF</button><button className="button button-primary" onClick={() => downloadText(`resumen-${appointment.id}.txt`, report)}><Download />Descargar resumen</button></div>
      <article className="document-sheet">
        <header><div><Stethoscope />SaludConecta</div><span>DOCUMENTO DEMOSTRATIVO</span></header>
        <h2>Resumen de videoconsulta</h2>
        <div className="document-meta"><span><strong>Paciente</strong>{appointment.patientName}</span><span><strong>Médico</strong>{appointment.doctorName}</span><span><strong>Fecha</strong>{appointment.date}</span><span><strong>Especialidad</strong>{appointment.specialty}</span></div>
        <section><h3>Motivo registrado</h3><p>{appointment.reason || 'Consulta general de seguimiento.'}</p></section>
        <section><h3>Recomendaciones de demostración</h3><ul><li>Mantener hidratación y reposo según necesidad.</li><li>Solicitar una valoración presencial si los síntomas empeoran.</li><li>En caso de emergencia, acudir inmediatamente a un centro asistencial.</li></ul></section>
        <section className="demo-prescription"><h3>Receta médica simulada</h3><p>No se prescribe medicación en este prototipo académico.</p></section>
        <footer>Este documento no tiene validez médica ni legal. Datos completamente ficticios.</footer>
      </article>
    </DashboardLayout>
  )
}
