import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <div className="center-page"><span className="error-code">404</span><h1>Página no encontrada</h1><p>La dirección solicitada no existe.</p><Link className="button button-primary" to="/"><ArrowLeft />Volver al inicio</Link></div>
}
