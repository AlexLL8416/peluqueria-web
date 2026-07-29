import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import AdminLogin from './AdminLogin'
import AdminPanel from './AdminPanel'

export default function Admin() {
    const [sesion, setSesion] = useState(null)
    const [cargandoAuth, setCargandoAuth] = useState(true)

    useEffect(() => {
        // Verificar sesión iniciada
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSesion(session)
            setCargandoAuth(false)
        })

        // Escuchar si el usuario inicia o cierra sesión
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSesion(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (cargandoAuth) {
        return <div className="text-center p-10 mt-20 font-light text-scandi-black">Verificando acceso...</div>
    }

    // Si hay sesión, entra al panel. Si no, muestra el login.
    return sesion ? <AdminPanel /> : <AdminLogin />
}