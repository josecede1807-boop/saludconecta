import type { AppointmentStatus } from '../types'

const labels: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export function StatusChip({ status }: { status: AppointmentStatus }) {
  return <span className={`status status-${status}`}>{labels[status]}</span>
}
