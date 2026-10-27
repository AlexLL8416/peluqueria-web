import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'

// Solo la portada va en el bundle inicial; el resto se carga al navegar.
const ClientReserv = lazy(() => import('./ClientReserv'))
const ClientCancel = lazy(() => import('./ClientCancel'))
const Products = lazy(() => import('./Products'))
const Admin = lazy(() => import('./Admin'))
const Privacy = lazy(() => import('./Privacy'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        {/* Inicio */}
        <Route path="/" element={<Home />} />
        
        {/* Clientes */}
        <Route path="/reservar" element={<ClientReserv />} />
        <Route path="/cancelar" element={<ClientCancel />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/privacidad" element={<Privacy />} />
        
        {/* Administrador */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
