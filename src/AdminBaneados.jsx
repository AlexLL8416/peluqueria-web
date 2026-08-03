import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function AdminBaneados() {
    const [baneados, setBaneados] = useState([])
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarBaneados()
    }, [])

    const cargarBaneados = async () => {
        const { data, error } = await supabase
            .from('baneados')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error:", error)
        } else {
            setBaneados(data || [])
        }
        setCargando(false)
    }

    const desbanear = async (id, telefono) => {
        const seguro = window.confirm(`¿Quieres perdonar al número ${telefono} y dejar que vuelva a reservar?`)
        if (!seguro) return

        const { error } = await supabase.from('baneados').delete().eq('id', id)

        if (error) {
            setMensaje({ texto: 'Error al quitar el bloqueo.', tipo: 'error' })
        } else {
            setBaneados(baneados.filter(b => b.id !== id))
            setMensaje({ texto: 'Número desbloqueado.', tipo: 'exito' })
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000)
        }
    }

    return (
        <div className="w-full max-w-3xl mx-auto flex-1 p-4 sm:p-6 lg:py-12">
            <div className="mb-8">
                <h2 className="font-cormorant text-2xl text-scandi-black mb-2">Lista Negra</h2>
                <p className="font-inter text-sm text-scandi-gray font-light">
                    Los números de teléfono en esta lista no podrán realizar nuevas reservas a través de la web.
                </p>
            </div>

            {mensaje.texto && (
                <div className={`mb-8 p-4 text-center rounded-2xl font-light text-xs tracking-wider uppercase shadow-sm border ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                    {mensaje.texto}
                </div>
            )}

            {cargando ? (
                <div className="text-center py-10 text-scandi-gray text-sm">Cargando lista...</div>
            ) : baneados.length === 0 ? (
                <div className="text-center py-12 bg-scandi-white rounded-3xl border border-scandi-darker/10 border-dashed">
                    <p className="font-inter text-sm text-scandi-gray font-light">No hay ningún número bloqueado.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {baneados.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-5 rounded-2xl bg-white border border-red-100 shadow-sm">
                            <span className="font-inter text-lg text-scandi-black font-medium">{b.telefono}</span>
                            <button
                                onClick={() => desbanear(b.id, b.telefono)}
                                className="font-inter text-[10px] tracking-widest uppercase text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors"
                            >
                                Perdonar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}