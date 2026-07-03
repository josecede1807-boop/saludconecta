import { BrowserRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppProvider } from './context/AppContext'
import { AdminPage } from './pages/AdminPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { AuthPage } from './pages/AuthPage'
import { BookingPage } from './pages/BookingPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { ConsultationPage } from './pages/ConsultationPage'
import { DashboardPage } from './pages/DashboardPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { DoctorClosePage } from './pages/DoctorClosePage'
import { DoctorPage } from './pages/DoctorPage'
import { FamilyPage } from './pages/FamilyPage'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PaymentPage } from './pages/PaymentPage'
import { WaitingRoomPage } from './pages/WaitingRoomPage'

const secured = (element: ReactNode) => <ProtectedRoute>{element}</ProtectedRoute>
const patient = (element: ReactNode) => <ProtectedRoute role="patient">{element}</ProtectedRoute>
const doctor = (element: ReactNode) => <ProtectedRoute role="doctor">{element}</ProtectedRoute>
const admin = (element: ReactNode) => <ProtectedRoute role="admin">{element}</ProtectedRoute>

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/acceso" element={<AuthPage />} />
          <Route path="/panel" element={patient(<DashboardPage />)} />
          <Route path="/familia" element={patient(<FamilyPage />)} />
          <Route path="/agendar" element={patient(<BookingPage />)} />
          <Route path="/pago" element={patient(<PaymentPage />)} />
          <Route path="/confirmacion/:id" element={patient(<ConfirmationPage />)} />
          <Route path="/citas" element={patient(<AppointmentsPage />)} />
          <Route path="/citas/:id/sala" element={patient(<WaitingRoomPage />)} />
          <Route path="/consulta/:id" element={secured(<ConsultationPage />)} />
          <Route path="/documentos" element={patient(<DocumentsPage />)} />
          <Route path="/citas/:id/documentos" element={secured(<DocumentsPage />)} />
          <Route path="/medico" element={doctor(<DoctorPage />)} />
          <Route path="/medico/historial" element={doctor(<DoctorPage history />)} />
          <Route path="/medico/citas/:id/cerrar" element={doctor(<DoctorClosePage />)} />
          <Route path="/admin" element={admin(<AdminPage />)} />
          <Route path="/admin/medicos" element={admin(<AdminPage doctorsOnly />)} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
