import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import ClientReserv from './ClientReserv' 
import ClientCancel from './ClientCancel' 
import Products from './Products'
import Admin from './Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Inicio */}
        <Route path="/" element={<Home />} />
        
        {/* Clientes */}
        <Route path="/reservar" element={<ClientReserv />} />
        <Route path="/cancelar" element={<ClientCancel />} />
        <Route path="/productos" element={<Products />} />
        
        {/* Administrador */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
