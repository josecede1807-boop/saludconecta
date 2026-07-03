export type Role = 'patient' | 'doctor' | 'admin'

export interface AppUser {
  id: string
  name: string
  email: string
  identification: string
  role: Role
  doctorId?: string
}

export interface FamilyMember {
  id: string
  userId: string
  name: string
  relationship: string
  birthDate: string
  identification: string
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  bio: string
  price: number
  available: boolean
  color: string
  slots: string[]
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Appointment {
  id: string
  userId: string
  patientName: string
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  reason: string
  insurance: string
  total: number
  status: AppointmentStatus
  paid: boolean
  roomName: string
  createdAt: string
  diagnosis?: string
  indications?: string
  prescription?: string
}

export interface AppointmentDraft {
  patientName: string
  doctorId: string
  date: string
  time: string
  reason: string
  insurance: string
}

export interface RegisterInput {
  name: string
  email: string
  identification: string
  password: string
}
