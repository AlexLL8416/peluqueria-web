import { useState } from 'react'
import { supabase } from './supabase'
import { APP_CONFIG } from './config/tenant'

export default function ClientCancel() {
    const [codigo, setCodigo] = useState('')
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
    const [cargando, setCargando] = useState(false)

    const cancelarCita = async (e) => {
        e.preventDefault()

        if (!codigo) {
            setMensaje({ texto: 'Por favor, introduce el código de cancelación.', tipo: 'error' })
            return
        }

        setCargando(true)
        setMensaje({ texto: 'Cancelando cita...', tipo: 'info' })

        const { data, error } = await supabase
            .from('citas')
            .select('*')
            .eq('id', codigo.trim())
            .eq('estado', 'reservada')
            .single()

        if (error || !data) {
            setMensaje({ texto: 'Código de cancelación inválido o cita ya cancelada.', tipo: 'error' })
            setCargando(false)
            return
        }

        const { error: cancelError } = await supabase
            .from('citas')
            .update({
                estado: 'disponible',
                nombre_cliente: null,
                telefono: null
            })
            .eq('id', codigo.trim())

        if (cancelError) {
            setMensaje({ texto: 'Error al cancelar la cita. Intenta nuevamente.', tipo: 'error' })
            setCargando(false)
            return
        }
        else {
            setMensaje({ texto: 'Cita cancelada con éxito.', tipo: 'exito' })
            setCodigo('')
        }

        setCargando(false)
    }

    return (
        <div className="w-full min-h-screen bg-background flex flex-col justify-center items-center p-6 font-inter relative">

            {/* Botón para volver a la web principal */}
            <a
                href="/"
                className="absolute top-8 left-8 md:left-12 scale-175 font-inter text-[10px] tracking-widest text-gray hover:text-primary uppercase flex items-center gap-2 transition-colors"
            >
                &larr; <span className="hidden md:inline">Volver</span>
            </a>

            <div className="w-full max-w-md bg-surface p-8 md:p-10 rounded-3xl shadow-sm border border-darker/10">

                <div className="text-center mb-8">
                    <span className="font-inter text-[10px] tracking-[0.3em] text-gray uppercase mb-2 block">
                        {APP_CONFIG.site.name}
                    </span>
                    <h2 className="font-cormorant text-3xl md:text-4xl text-primary font-normal mb-3">
                        Cancelar <span className="text-accent">cita</span>
                    </h2>
                    <p className="font-inter text-xs text-gray font-light leading-relaxed">
                        Introduce el código que guardaste al hacer la reserva para liberar tu hueco.
                    </p>
                </div>

                {/* MENSAJES DE ESTADO */}
                {mensaje.texto && (
                    <div className={`mb-8 p-4 text-center rounded-2xl font-light text-xs tracking-wider uppercase shadow-sm border ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                        mensaje.tipo === 'info' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                        {mensaje.texto}
                    </div>
                )}

                <form onSubmit={cancelarCita} className="space-y-6">
                    <div>
                        <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">
                            Código de cancelación
                        </label>
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            placeholder="Ej. 9bc8f49d-..."
                            className="w-full p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-mono text-sm text-primary placeholder-gray/40"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className={`w-full font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl transition-all shadow-md ${cargando
                            ? 'bg-darker/10 text-gray cursor-not-allowed'
                            : 'bg-primary text-surface hover:bg-red-950'
                            }`}
                    >
                        {cargando ? 'Procesando...' : 'Cancelar mi reserva'}
                    </button>
                </form>

                {/* NUEVO: Mensaje de recuperación o ayuda */}
                <div className="mt-8 pt-6 border-t border-darker/10 text-center">
                    <p className="font-inter text-xs text-gray font-light leading-relaxed">
                        ¿Has perdido tu código? <br className="md:hidden" />
                        Llámanos o envíanos un WhatsApp al <a href="tel:+34600123456" className="text-primary font-medium hover:text-accent transition-colors block md:inline mt-1 md:mt-0">600 123 456</a>
                    </p>
                </div>
            </div>
        </div>
    )
}