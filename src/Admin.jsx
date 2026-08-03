import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import AdminLogin from './AdminLogin'
import AdminPanel from './AdminPanel'
import AdminPlantilla from './AdminPlantilla'
import AdminBaneados from './AdminBaneados'

export default function Admin() {
    const [sesion, setSesion] = useState(null)
    const [cargandoAuth, setCargandoAuth] = useState(true)
    const [vistaActiva, setVistaActiva] = useState('diario')

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSesion(session)
            setCargandoAuth(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSesion(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (cargandoAuth) {
        return <div className="text-center p-10 mt-20 font-light text-scandi-black">Verificando acceso...</div>
    }

    if (!sesion) {
        return <AdminLogin />
    }

    const cerrarSesion = async () => {
        await supabase.auth.signOut()
    }

    return (
        <div className="w-full min-h-screen bg-scandi-light flex flex-col font-inter">

            {/* Cabecera Estilizada Global adaptada a móvil */}
            <div className="w-full bg-scandi-white border-b border-scandi-darker/10 px-4 py-5 md:px-12 flex flex-col lg:flex-row justify-between items-center shadow-sm gap-6">
                <div className="text-center lg:text-left">
                    <span className="font-inter text-[10px] tracking-[0.3em] text-scandi-gray uppercase block mb-1">
                        Romero Studio
                    </span>
                    <h1 className="font-cormorant text-2xl md:text-3xl text-scandi-black font-normal">
                        Panel de <span className="text-scandi-accent">Admin</span>
                    </h1>
                </div>

                {/* Selector de vistas actualizado */}
                <div className="flex bg-scandi-light/50 p-1.5 rounded-xl border border-scandi-darker/10 w-full lg:w-auto justify-center overflow-x-auto">
                    <button
                        onClick={() => setVistaActiva('diario')}
                        className={`flex-1 lg:flex-none px-4 md:px-5 py-2.5 rounded-lg font-inter text-[10px] tracking-widest uppercase transition-all whitespace-nowrap ${vistaActiva === 'diario' ? 'bg-scandi-black text-scandi-white shadow-sm' : 'text-scandi-gray hover:text-scandi-black'
                            }`}
                    >
                        Día Individual
                    </button>
                    <button
                        onClick={() => setVistaActiva('mensual')}
                        className={`flex-1 lg:flex-none px-4 md:px-5 py-2.5 rounded-lg font-inter text-[10px] tracking-widest uppercase transition-all whitespace-nowrap ${vistaActiva === 'mensual' ? 'bg-scandi-black text-scandi-white shadow-sm' : 'text-scandi-gray hover:text-scandi-black'
                            }`}
                    >
                        Múltiple
                    </button>
                    <button
                        onClick={() => setVistaActiva('baneados')}
                        className={`flex-1 lg:flex-none px-4 md:px-5 py-2.5 rounded-lg font-inter text-[10px] tracking-widest uppercase transition-all whitespace-nowrap ${vistaActiva === 'baneados' ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' : 'text-scandi-gray hover:text-red-500'
                            }`}
                    >
                        Bloqueados
                    </button>
                </div>

                <button
                    onClick={cerrarSesion}
                    className="font-inter text-[10px] tracking-widest uppercase text-scandi-gray hover:text-red-500 transition-colors border-b border-transparent hover:border-red-500 pb-0.5"
                >
                    Cerrar Sesión
                </button>
            </div>

            {/* Renderizado del componente según la pestaña seleccionada */}
            <div className="flex-1 flex flex-col w-full">
                {vistaActiva === 'diario' && <AdminPanel />}
                {vistaActiva === 'mensual' && <AdminPlantilla />}
                {vistaActiva === 'baneados' && <AdminBaneados />}
            </div>

        </div>
    )
}