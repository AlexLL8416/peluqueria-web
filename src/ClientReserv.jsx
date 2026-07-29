import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Camera } from 'lucide-react'

export default function ClientView() {
    const [citasDisponibles, setCitasDisponibles] = useState({})
    const [diasDisponibles, setDiasDisponibles] = useState([])
    const [diaSeleccionado, setDiaSeleccionado] = useState('')

    // Flujo de reserva
    const [citaSeleccionada, setCitaSeleccionada] = useState(null)
    const [citaConfirmada, setCitaConfirmada] = useState(null)
    const [nombre, setNombre] = useState('')
    const [telefono, setTelefono] = useState('')

    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        cargarCitas()
    }, [])

    const cargarCitas = async () => {
        setCargando(true)

        const hoy = new Date().toISOString()

        const { data, error } = await supabase
            .from('citas')
            .select('*')
            .eq('estado', 'disponible')
            .gte('fecha_hora', hoy)
            .order('fecha_hora', { ascending: true })

        if (error) {
            console.error("Error al cargar citas:", error)
            setMensaje({ texto: 'Error al conectar con la peluquería.', tipo: 'error' })
            setCargando(false)
            return
        }

        const citasAgrupadas = {}
        data.forEach(cita => {
            const fecha = cita.fecha_hora.split('T')[0]
            if (!citasAgrupadas[fecha]) {
                citasAgrupadas[fecha] = []
            }
            citasAgrupadas[fecha].push(cita)
        })

        const dias = Object.keys(citasAgrupadas)

        setCitasDisponibles(citasAgrupadas)
        setDiasDisponibles(dias)

        if (dias.length > 0) {
            setDiaSeleccionado(dias[0])
        }

        setCargando(false)
    }

    const formatearFecha = (fechaString) => {
        const opciones = { weekday: 'short', day: 'numeric', month: 'short' }
        const fecha = new Date(fechaString)
        return fecha.toLocaleDateString('es-ES', opciones).toUpperCase()
    }

    const confirmarReserva = async (e) => {
        e.preventDefault()

        const nombreTrim = nombre.trim()
        const telefonoTrim = telefono.trim()

        // 1. Validar que no estén vacíos
        if (!nombreTrim || !telefonoTrim) {
            setMensaje({ texto: 'Por favor, rellena todos los datos.', tipo: 'error' })
            return
        }

        // 2. Validar el nombre (solo letras, espacios y acentos, mínimo 2 caracteres)
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]{2,}$/
        if (!regexNombre.test(nombreTrim)) {
            setMensaje({ texto: 'Por favor, introduce un nombre válido (solo letras).', tipo: 'error' })
            return
        }

        // 3. Validar el teléfono (limpiamos espacios/guiones y comprobamos que tenga al menos 9 dígitos numéricos)
        const telefonoSoloDigitos = telefonoTrim.replace(/\D/g, '')
        if (telefonoSoloDigitos.length < 9) {
            setMensaje({ texto: 'Por favor, introduce un número de teléfono válido (mínimo 9 dígitos).', tipo: 'error' })
            return
        }

        setMensaje({ texto: 'Procesando reserva...', tipo: 'info' })

        const { data, error } = await supabase
            .from('citas')
            .update({
                estado: 'reservada',
                nombre_cliente: nombreTrim,
                telefono: telefonoTrim
            })
            .eq('id', citaSeleccionada.id)
            .select()

        if (error || !data || data.length === 0) {
            console.error("Error al reservar o cita ocupada:", error)
            setMensaje({ texto: '¡Vaya! Alguien acaba de reservar esta cita. Por favor, elige otra.', tipo: 'error' })

            cargarCitas()
            setCitaSeleccionada(null)
            return
        }

        setMensaje({ texto: '', tipo: '' })
        setCitaConfirmada(citaSeleccionada)
        setCitaSeleccionada(null)
        setNombre('')
        setTelefono('')
        cargarCitas()
    }

    if (cargando) {
        return (
            <div className="min-h-screen bg-scandi-light flex items-center justify-center">
                <div className="text-center p-10 font-inter text-scandi-gray font-light">
                    Buscando huecos disponibles...
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-scandi-light flex flex-col font-inter">

            {/* Cabecera Estilizada con botón de regreso general */}
            <div className="w-full bg-scandi-white border-b border-scandi-darker/10 p-8 shadow-sm text-center relative flex items-center justify-center">

                {/* NUEVO: Botón de regresar a la Home */}
                <a
                    href="/"
                    className="absolute left-8 md:left-12 scale-175 font-inter text-[10px] tracking-widest text-scandi-gray hover:text-scandi-black uppercase flex items-center gap-2 transition-colors"
                >
                    &larr; <span className="hidden md:inline">Volver</span>
                </a>

                <div>
                    <span className="font-inter text-[10px] tracking-[0.3em] text-scandi-gray uppercase mb-2 block">
                        Romero Studio
                    </span>
                    <h1 className="font-cormorant text-4xl text-scandi-black font-normal">
                        Reserva tu <span className="text-scandi-accent">cita</span>
                    </h1>
                </div>
            </div>

            <div className="w-full max-w-xl mx-auto flex-1 p-6 md:p-10">

                {/* MENSAJES DE ESTADO */}
                {mensaje.texto && (
                    <div className={`mb-8 p-4 text-center rounded-2xl font-light text-xs tracking-wider uppercase shadow-sm border ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                        mensaje.tipo === 'info' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                        {mensaje.texto}
                    </div>
                )}

                {/* FLUJO 1: MOSTRAR DÍAS Y HORAS */}
                {!citaSeleccionada && !citaConfirmada && (
                    <>
                        {diasDisponibles.length === 0 ? (
                            <div className="text-center p-12 bg-scandi-white rounded-3xl border border-scandi-darker/10 shadow-sm mt-4">
                                <p className="font-inter text-sm text-scandi-gray font-light">
                                    Lo sentimos, no hay citas disponibles en este momento.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="font-inter text-xs tracking-[0.2em] text-scandi-gray uppercase mb-4 px-1">
                                        ¿Qué día prefieres?
                                    </h2>

                                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                                        {diasDisponibles.map(dia => (
                                            <button
                                                key={dia}
                                                onClick={() => setDiaSeleccionado(dia)}
                                                className={`whitespace-nowrap px-6 py-4 rounded-2xl font-inter text-xs tracking-widest uppercase transition-all shrink-0 border ${diaSeleccionado === dia
                                                    ? 'bg-scandi-black text-scandi-light border-scandi-black shadow-md'
                                                    : 'bg-scandi-white text-scandi-black border-scandi-darker/20 hover:border-scandi-black'
                                                    }`}
                                            >
                                                {formatearFecha(dia)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="font-inter text-xs tracking-[0.2em] text-scandi-gray uppercase mb-4 px-1">
                                        Horas disponibles
                                    </h2>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {citasDisponibles[diaSeleccionado]?.map((cita) => {
                                            const hora = new Date(cita.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            return (
                                                <button
                                                    key={cita.id}
                                                    onClick={() => setCitaSeleccionada(cita)}
                                                    className="bg-scandi-white border border-scandi-darker/20 hover:border-scandi-accent text-scandi-black py-5 px-4 rounded-2xl shadow-sm transition-all duration-300 flex flex-col items-center justify-center gap-1 group"
                                                >
                                                    <span className="font-cormorant text-2xl group-hover:text-scandi-accent transition-colors">{hora}</span>
                                                    <span className="font-inter text-[10px] tracking-widest text-scandi-gray uppercase">{cita.duracion_minutos} min</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* FLUJO 2: FORMULARIO DE CONFIRMACIÓN */}
                {citaSeleccionada && !mensaje.texto.includes('éxito') && (
                    <div className="bg-scandi-white p-8 md:p-10 rounded-3xl shadow-sm border border-scandi-darker/10 mt-2">

                        <button
                            onClick={() => setCitaSeleccionada(null)}
                            className="font-inter text-xs tracking-widest text-scandi-gray hover:text-scandi-black uppercase mb-8 flex items-center gap-2 transition-colors"
                        >
                            &larr; Cambiar hora
                        </button>

                        <div className="mb-8 pb-6 border-b border-scandi-darker/10">
                            <p className="font-inter text-[10px] tracking-widest text-scandi-gray uppercase mb-1">Cita seleccionada</p>
                            <p className="font-cormorant text-2xl md:text-3xl text-scandi-black">
                                {formatearFecha(citaSeleccionada.fecha_hora.split('T')[0])} a las {new Date(citaSeleccionada.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        <form onSubmit={confirmarReserva} className="space-y-6">
                            <div>
                                <label className="block font-inter text-[10px] tracking-widest text-scandi-gray uppercase mb-2">Tu Nombre</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej. Alejandro"
                                    pattern="[A-Za-záéíóúÁÉÍÓÚñÑ\s]+"
                                    title="Solo se permiten letras, espacios y acentos"
                                    className="w-full p-4 border border-scandi-darker/20 rounded-2xl bg-scandi-light/50 focus:bg-scandi-white focus:ring-1 focus:ring-scandi-accent focus:border-scandi-accent outline-none transition-all font-light text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-inter text-[10px] tracking-widest text-scandi-gray uppercase mb-2">Tu Teléfono</label>
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="Ej. 600 123 456"
                                    pattern="[0-9\s+()-]+"
                                    title="Introduce un número de teléfono válido"
                                    className="w-full p-4 border border-scandi-darker/20 rounded-2xl bg-scandi-light/50 focus:bg-scandi-white focus:ring-1 focus:ring-scandi-accent focus:border-scandi-accent outline-none transition-all font-light text-sm"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-scandi-black text-scandi-white font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl hover:bg-scandi-accent hover:text-scandi-black transition-colors shadow-md mt-4"
                            >
                                Confirmar Reserva
                            </button>
                        </form>
                    </div>
                )}

                {/* FLUJO 3: TICKET DE CONFIRMACIÓN */}
                {citaConfirmada && (
                    <div className="bg-scandi-white p-8 md:p-10 rounded-3xl shadow-sm border border-scandi-darker/10 mt-2 text-center">

                        <div className="w-16 h-16 bg-scandi-accent/20 text-scandi-accent rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-light">
                            ✓
                        </div>

                        <h3 className="font-cormorant text-3xl text-scandi-black mb-2">¡Reserva confirmada!</h3>
                        <p className="font-inter text-sm text-scandi-gray font-light mb-8">Tu cita ha sido guardada correctamente.</p>

                        <div className="bg-scandi-light p-6 rounded-2xl border border-scandi-darker/10 mb-8 relative text-left">
                            <p className="font-inter text-[10px] tracking-widest text-scandi-gray uppercase mb-2">Código de cancelación</p>

                            <p className="text-xs font-mono text-scandi-black break-all bg-scandi-white p-4 border border-scandi-darker/10 rounded-xl shadow-inner">
                                {citaConfirmada.id}
                            </p>

                            <div className="mt-4 p-4 bg-scandi-accent/10 border border-scandi-accent/30 rounded-xl flex gap-3 items-start">
                                <Camera className="text-lg w-16 h-16 text-scandi-base fill-scandi-accent"/>
                                <p className="font-inter text-xs text-scandi-black/80 font-light leading-relaxed">
                                    ¡Haz una captura de pantalla a este código! Lo necesitarás si en algún momento deseas cancelar tu cita.
                                </p>
                            </div>
                        </div>

                        {/* NUEVO: Redirige a la página principal */}
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-scandi-black text-scandi-white font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl hover:bg-scandi-accent hover:text-scandi-black transition-colors shadow-md"
                        >
                            Volver a la web
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}