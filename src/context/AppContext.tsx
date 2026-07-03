import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEMO_ADMIN, DEMO_PASSWORD, DEMO_USER, DOCTORS, INITIAL_APPOINTMENTS, INITIAL_FAMILY } from '../lib/demoData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { AppUser, Appointment, AppointmentDraft, Doctor, FamilyMember, RegisterInput } from '../types'

interface AppContextValue {
  user: AppUser | null
  loading: boolean
  dataMode: 'demo' | 'supabase'
  doctors: Doctor[]
  family: FamilyMember[]
  appointments: Appointment[]
  login: (email: string, password: string) => Promise<string | null>
  register: (input: RegisterInput) => Promise<string | null>
  logout: () => Promise<void>
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'userId'>) => Promise<void>
  deleteFamilyMember: (id: string) => Promise<void>
  createAppointment: (draft: AppointmentDraft) => Promise<Appointment>
  cancelAppointment: (id: string) => Promise<void>
  finishAppointment: (id: string) => Promise<void>
  completeMedicalConsultation: (id: string, notes: { diagnosis: string; indications: string; prescription: string }) => Promise<void>
  setDoctorAvailability: (id: string, available: boolean) => Promise<void>
  resetDemo: () => void
}

const AppContext = createContext<AppContextValue | null>(null)
const key = (name: string) => `saludconecta:${name}`

function readLocal<T>(name: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key(name))
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocal<T>(name: string, value: T) {
  localStorage.setItem(key(name), JSON.stringify(value))
}

function profileFromSession(sessionUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AppUser {
  const metadataRole = sessionUser.user_metadata?.role
  return {
    id: sessionUser.id,
    name: String(sessionUser.user_metadata?.full_name || 'Paciente'),
    email: sessionUser.email || '',
    identification: String(sessionUser.user_metadata?.identification || ''),
    role: metadataRole === 'admin' || metadataRole === 'doctor' ? metadataRole : 'patient',
    doctorId: metadataRole === 'doctor' ? String(sessionUser.user_metadata?.doctor_id || '') : undefined,
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<Doctor[]>(() => readLocal('doctors', DOCTORS))
  const [family, setFamily] = useState<FamilyMember[]>(() => readLocal('family', INITIAL_FAMILY))
  const [appointments, setAppointments] = useState<Appointment[]>(() => readLocal('appointments', INITIAL_APPOINTMENTS))

  useEffect(() => {
    if (!supabase) {
      setUser(readLocal<AppUser | null>('session', null))
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? profileFromSession(data.session.user) : null)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? profileFromSession(session.user) : null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !user) return
    const client = supabase
    const load = async () => {
      let appointmentQuery = client.from('appointments').select('*').order('date', { ascending: false })
      if (user.role === 'patient') appointmentQuery = appointmentQuery.eq('user_id', user.id)
      if (user.role === 'doctor') appointmentQuery = appointmentQuery.eq('doctor_id', user.doctorId || '')
      const [doctorResult, familyResult, appointmentResult] = await Promise.all([
        client.from('doctors').select('*').order('name'),
        client.from('family_members').select('*').eq('user_id', user.id).order('name'),
        appointmentQuery,
      ])
      if (doctorResult.data?.length) {
        setDoctors(doctorResult.data.map((d) => ({
          id: d.id,
          name: d.name,
          specialty: d.specialty,
          bio: d.bio || '',
          price: Number(d.price),
          available: d.available,
          color: d.color || '#cfe5ff',
          slots: d.slots || [],
        })))
      }
      if (familyResult.data) {
        setFamily(familyResult.data.map((m) => ({
          id: m.id,
          userId: m.user_id,
          name: m.name,
          relationship: m.relationship,
          birthDate: m.birth_date,
          identification: m.identification,
        })))
      }
      if (appointmentResult.data) {
        setAppointments(appointmentResult.data.map((a) => ({
          id: a.id,
          userId: a.user_id,
          patientName: a.patient_name,
          doctorId: a.doctor_id,
          doctorName: a.doctor_name,
          specialty: a.specialty,
          date: a.date,
          time: a.time.slice(0, 5),
          reason: a.reason || '',
          insurance: a.insurance,
          total: Number(a.total),
          status: a.status,
          paid: a.paid,
          roomName: a.room_name,
          createdAt: a.created_at,
          diagnosis: a.diagnosis || '',
          indications: a.indications || '',
          prescription: a.prescription || '',
        })))
      }
    }
    void load()
  }, [user])

  const login = async (email: string, password: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error?.message || null
    }
    const normalized = email.trim().toLowerCase()
    const localUsers = readLocal<Array<AppUser & { password: string }>>('users', [])
    const localUser = localUsers.find((item) => item.email === normalized && item.password === password)
    const demo = normalized === DEMO_USER.email && password === DEMO_PASSWORD ? DEMO_USER : null
    const admin = normalized === DEMO_ADMIN.email && password === DEMO_PASSWORD ? DEMO_ADMIN : null
    const nextUser = localUser || demo || admin
    if (!nextUser) return 'Correo o contraseña incorrectos.'
    const cleanUser: AppUser = { id: nextUser.id, name: nextUser.name, email: nextUser.email, identification: nextUser.identification, role: nextUser.role }
    setUser(cleanUser)
    writeLocal('session', cleanUser)
    return null
  }

  const register = async (input: RegisterInput) => {
    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { full_name: input.name, identification: input.identification, role: 'patient' } },
      })
      return error?.message || null
    }
    const users = readLocal<Array<AppUser & { password: string }>>('users', [])
    if (users.some((item) => item.email === input.email.toLowerCase())) return 'Este correo ya está registrado.'
    const nextUser: AppUser & { password: string } = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email.toLowerCase(),
      identification: input.identification,
      role: 'patient',
      password: input.password,
    }
    writeLocal('users', [...users, nextUser])
    const cleanUser: AppUser = { id: nextUser.id, name: nextUser.name, email: nextUser.email, identification: nextUser.identification, role: nextUser.role }
    setUser(cleanUser)
    writeLocal('session', cleanUser)
    return null
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut()
    localStorage.removeItem(key('session'))
    setUser(null)
  }

  const addFamilyMember = async (input: Omit<FamilyMember, 'id' | 'userId'>) => {
    if (!user) return
    if (supabase) {
      const { data, error } = await supabase.from('family_members').insert({
        user_id: user.id,
        name: input.name,
        relationship: input.relationship,
        birth_date: input.birthDate,
        identification: input.identification,
      }).select().single()
      if (error) throw error
      setFamily((items) => [...items, { id: data.id, userId: user.id, ...input }])
      return
    }
    const next = [...family, { id: crypto.randomUUID(), userId: user.id, ...input }]
    setFamily(next)
    writeLocal('family', next)
  }

  const deleteFamilyMember = async (id: string) => {
    if (supabase) await supabase.from('family_members').delete().eq('id', id)
    const next = family.filter((item) => item.id !== id)
    setFamily(next)
    writeLocal('family', next)
  }

  const createAppointment = async (draft: AppointmentDraft) => {
    if (!user) throw new Error('Debes iniciar sesión.')
    const doctor = doctors.find((item) => item.id === draft.doctorId)
    if (!doctor) throw new Error('Médico no encontrado.')
    const discount = draft.insurance === 'Atención particular' ? 0 : doctor.price / 2
    const payload: Appointment = {
      id: crypto.randomUUID(),
      userId: user.id,
      patientName: draft.patientName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: draft.date,
      time: draft.time,
      reason: draft.reason,
      insurance: draft.insurance,
      total: doctor.price - discount,
      status: 'confirmed',
      paid: true,
      roomName: `SaludConecta-${crypto.randomUUID().replaceAll('-', '')}`,
      createdAt: new Date().toISOString(),
    }
    if (supabase) {
      const { data, error } = await supabase.from('appointments').insert({
        user_id: payload.userId,
        patient_name: payload.patientName,
        doctor_id: payload.doctorId,
        doctor_name: payload.doctorName,
        specialty: payload.specialty,
        date: payload.date,
        time: payload.time,
        reason: payload.reason,
        insurance: payload.insurance,
        total: payload.total,
        status: payload.status,
        paid: payload.paid,
        room_name: payload.roomName,
      }).select().single()
      if (error) throw error
      payload.id = data.id
    }
    const next = [payload, ...appointments]
    setAppointments(next)
    writeLocal('appointments', next)
    return payload
  }

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    if (supabase) await supabase.from('appointments').update({ status }).eq('id', id)
    const next = appointments.map((item) => (item.id === id ? { ...item, status } : item))
    setAppointments(next)
    writeLocal('appointments', next)
  }

  const cancelAppointment = (id: string) => updateAppointmentStatus(id, 'cancelled')
  const finishAppointment = (id: string) => updateAppointmentStatus(id, 'completed')

  const completeMedicalConsultation = async (id: string, notes: { diagnosis: string; indications: string; prescription: string }) => {
    if (supabase) {
      const { error } = await supabase.from('appointments').update({
        status: 'completed',
        diagnosis: notes.diagnosis,
        indications: notes.indications,
        prescription: notes.prescription,
      }).eq('id', id)
      if (error) throw error
    }
    setAppointments((items) => items.map((item) => item.id === id ? { ...item, status: 'completed', ...notes } : item))
  }

  const setDoctorAvailability = async (id: string, available: boolean) => {
    if (supabase) await supabase.from('doctors').update({ available }).eq('id', id)
    const next = doctors.map((item) => (item.id === id ? { ...item, available } : item))
    setDoctors(next)
    writeLocal('doctors', next)
  }

  const resetDemo = () => {
    ;['doctors', 'family', 'appointments', 'session', 'users'].forEach((name) => localStorage.removeItem(key(name)))
    setDoctors(DOCTORS)
    setFamily(INITIAL_FAMILY)
    setAppointments(INITIAL_APPOINTMENTS)
    setUser(null)
  }

  const value = useMemo<AppContextValue>(() => ({
    user,
    loading,
    dataMode: isSupabaseConfigured ? 'supabase' : 'demo',
    doctors,
    family: user ? family.filter((item) => item.userId === user.id || user.id === DEMO_USER.id) : [],
    appointments: user?.role === 'admin'
      ? appointments
      : user?.role === 'doctor'
        ? appointments.filter((item) => item.doctorId === user.doctorId)
        : appointments.filter((item) => item.userId === user?.id),
    login,
    register,
    logout,
    addFamilyMember,
    deleteFamilyMember,
    createAppointment,
    cancelAppointment,
    finishAppointment,
    completeMedicalConsultation,
    setDoctorAvailability,
    resetDemo,
  }), [user, loading, doctors, family, appointments])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe usarse dentro de AppProvider')
  return context
}
