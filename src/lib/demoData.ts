import type { AppUser, Appointment, Doctor, FamilyMember } from '../types'

export const DEMO_USER: AppUser = {
  id: 'demo-patient',
  name: 'Mateo Pérez',
  email: 'demo@saludconecta.ec',
  identification: '1723456789',
  role: 'patient',
}

export const DEMO_ADMIN: AppUser = {
  id: 'demo-admin',
  name: 'Administrador',
  email: 'admin@saludconecta.ec',
  identification: 'admin',
  role: 'admin',
}

export const DEMO_PASSWORD = 'Demo1234'

export const DOCTORS: Doctor[] = [
  {
    id: 'doc-ana',
    name: 'Dra. Ana López',
    specialty: 'Medicina General',
    bio: 'Atención integral para adultos y seguimiento de enfermedades comunes.',
    price: 40,
    available: true,
    color: '#cfe5ff',
    slots: ['09:00', '09:30', '10:00', '11:00', '14:30'],
  },
  {
    id: 'doc-carlos',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Cardiología',
    bio: 'Valoración cardiovascular, hipertensión y seguimiento de resultados.',
    price: 50,
    available: true,
    color: '#d8e2ff',
    slots: ['08:30', '10:30', '15:00', '16:30'],
  },
  {
    id: 'doc-maria',
    name: 'Dra. María Gómez',
    specialty: 'Pediatría',
    bio: 'Consulta pediátrica, orientación familiar y controles de seguimiento.',
    price: 45,
    available: true,
    color: '#d8f3f5',
    slots: ['09:00', '11:30', '14:00', '17:00'],
  },
  {
    id: 'doc-javier',
    name: 'Dr. Javier Méndez',
    specialty: 'Dermatología',
    bio: 'Evaluación inicial de afecciones de piel y seguimiento de tratamientos.',
    price: 45,
    available: false,
    color: '#f1e3ff',
    slots: ['10:00', '12:00', '16:00'],
  },
]

export const INITIAL_FAMILY: FamilyMember[] = [
  {
    id: 'family-1',
    userId: DEMO_USER.id,
    name: 'Carmen Pérez',
    relationship: 'Madre',
    birthDate: '1962-08-03',
    identification: '1701234567',
  },
]

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const isoTomorrow = tomorrow.toISOString().slice(0, 10)

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appointment-demo',
    userId: DEMO_USER.id,
    patientName: DEMO_USER.name,
    doctorId: 'doc-ana',
    doctorName: 'Dra. Ana López',
    specialty: 'Medicina General',
    date: isoTomorrow,
    time: '10:00',
    reason: 'Control general y revisión de resultados.',
    insurance: 'Salud Integral EC',
    total: 20,
    status: 'confirmed',
    paid: true,
    roomName: 'SaludConecta-Demo-Ana-Mateo',
    createdAt: new Date().toISOString(),
  },
]
