import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Camera } from 'lucide-react'
import APP_CONFIG from './config/tenant.js'

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
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        cargarCitas()
    }, [])

    const cargarCitas = async () => {
        setCargando(true)

        const fechaConMargen = new Date();
        fechaConMargen.setHours(fechaConMargen.getHours() + 1);
        const limite = fechaConMargen.toISOString();

        const { data, error } = await supabase
            .from('citas')
            .select('*')
            .eq('estado', 'disponible')
            .gte('fecha_hora', limite)
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
        setGuardando(true)

        const nombreTrim = nombre.trim()
        const telefonoTrim = telefono.trim()

        // 1. Validar que no estén vacíos
        if (!nombreTrim || !telefonoTrim) {
            setMensaje({ texto: 'Por favor, rellena todos los datos.', tipo: 'error' })
            setGuardando(false)
            return
        }

        // 2. Validar el nombre (solo letras, espacios y acentos, mínimo 2 caracteres)
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]{2,}$/
        if (!regexNombre.test(nombreTrim)) {
            setMensaje({ texto: 'Por favor, introduce un nombre válido (solo letras).', tipo: 'error' })
            setGuardando(false)
            return
        }

        // 3. Validar el teléfono (limpiamos espacios/guiones y comprobamos que tenga al menos 9 dígitos numéricos)
        const telefonoSoloDigitos = telefonoTrim.replace(/\D/g, '')
        if (telefonoSoloDigitos.length !== 9) {
            setMensaje({ texto: 'Por favor, introduce un número de teléfono válido (mínimo 9 dígitos).', tipo: 'error' })
            setGuardando(false)
            return
        }

        setMensaje({ texto: 'Verificando disponibilidad...', tipo: 'info' })

        // --- VALIDACIÓN A: Comprobar si el teléfono está baneado ---
        const { data: baneado } = await supabase
            .from('baneados')
            .select('*')
            .eq('telefono', telefonoTrim)
            .single()

        if (baneado) {
            setMensaje({ texto: 'Este número de teléfono no tiene permitido realizar reservas.', tipo: 'error' })
            setGuardando(false)
            return
        }

        // --- VALIDACIÓN B: Comprobar si ya tiene una cita esa semana ---
        const fechaCitaElegida = new Date(citaSeleccionada.fecha_hora)

        const diaSemana = fechaCitaElegida.getDay()
        const diffAlLunes = fechaCitaElegida.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1)
        const inicioSemana = new Date(fechaCitaElegida.setDate(diffAlLunes))
        inicioSemana.setHours(0, 0, 0, 0)

        const finSemana = new Date(inicioSemana)
        finSemana.setDate(finSemana.getDate() + 6)
        finSemana.setHours(23, 59, 59, 999)

        const { data: citasDeLaSemana, error: errorSemana } = await supabase
            .from('citas')
            .select('*')
            .eq('telefono', telefonoTrim)
            .gte('fecha_hora', inicioSemana.toISOString())
            .lte('fecha_hora', finSemana.toISOString())
            .neq('estado', 'disponible')

        if (!errorSemana && citasDeLaSemana && citasDeLaSemana.length > 0) {
            setMensaje({ texto: 'Ya tienes una cita reservada para esta semana. Solo se permite una por semana.', tipo: 'error' })
            setGuardando(false)
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
            setGuardando(false)
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center p-10 font-inter text-gray font-light">
                    Buscando huecos disponibles...
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-background flex flex-col font-inter">

            {/* Cabecera Estilizada con botón de regreso general */}
            <div className="w-full bg-surface border-b border-darker/10 p-8 shadow-sm text-center relative flex items-center justify-center">

                {/* Botón de regresar a la Home */}
                <a
                    href="/"
                    className="absolute left-8 md:left-12 scale-175 font-inter text-[10px] tracking-widest text-gray hover:text-primary uppercase flex items-center gap-2 transition-colors"
                >
                    &larr; <span className="hidden md:inline">Volver</span>
                </a>

                <div>
                    <span className="font-inter text-[10px] tracking-[0.3em] text-gray uppercase mb-2 block">
                        {APP_CONFIG.site.name}
                    </span>
                    <h1 className="font-cormorant text-4xl text-primary font-normal">
                        {APP_CONFIG.copy.heroTagline} <span className="text-accent">cita</span>
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
                            <div className="text-center p-12 bg-surface rounded-3xl border border-darker/10 shadow-sm mt-4">
                                <p className="font-inter text-sm text-gray font-light">
                                    Lo sentimos, no hay citas disponibles en este momento.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="font-inter text-xs tracking-[0.2em] text-gray uppercase mb-4 px-1">
                                        ¿Qué día prefieres?
                                    </h2>

                                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                                        {diasDisponibles.map(dia => (
                                            <button
                                                key={dia}
                                                onClick={() => setDiaSeleccionado(dia)}
                                                className={`whitespace-nowrap px-6 py-4 rounded-2xl font-inter text-xs tracking-widest uppercase transition-all shrink-0 border ${diaSeleccionado === dia
                                                        ? 'bg-primary text-background border-primary shadow-md'
                                                            : 'bg-surface text-primary border-darker/20 hover:border-primary'
                                                    }`}
                                            >
                                                {formatearFecha(dia)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="font-inter text-xs tracking-[0.2em] text-gray uppercase mb-4 px-1">
                                        Horas disponibles
                                    </h2>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {citasDisponibles[diaSeleccionado]?.map((cita) => {
                                            const hora = new Date(cita.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            return (
                                                <button
                                                    key={cita.id}
                                                    onClick={() => setCitaSeleccionada(cita)}
                                                    className="bg-surface border border-darker/20 hover:border-accent text-primary py-5 px-4 rounded-2xl shadow-sm transition-all duration-300 flex flex-col items-center justify-center gap-1 group"
                                                >
                                                    <span className="font-cormorant text-2xl group-hover:text-accent transition-colors">{hora}</span>
                                                    <span className="font-inter text-[10px] tracking-widest text-gray uppercase">{cita.duracion_minutos} min</span>
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
                    <div className="bg-surface p-8 md:p-10 rounded-3xl shadow-sm border border-darker/10 mt-2">

                        <button
                            onClick={() => setCitaSeleccionada(null)}
                            className="font-inter text-xs tracking-widest text-gray hover:text-primary uppercase mb-8 flex items-center gap-2 transition-colors"
                        >
                            &larr; Cambiar hora
                        </button>

                        <div className="mb-8 pb-6 border-b border-darker/10">
                            <p className="font-inter text-[10px] tracking-widest text-gray uppercase mb-1">Cita seleccionada</p>
                            <p className="font-cormorant text-2xl md:text-3xl text-primary">
                                {formatearFecha(citaSeleccionada.fecha_hora.split('T')[0])} a las {new Date(citaSeleccionada.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        <form onSubmit={confirmarReserva} className="space-y-6">
                            <div>
                                <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Tu Nombre</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej. Alejandro"
                                    pattern="[A-Za-záéíóúÁÉÍÓÚñÑ\s]+"
                                    title="Solo se permiten letras, espacios y acentos"
                                    className="w-full p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all font-light text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Tu Teléfono</label>
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="Ej. 600 123 456"
                                    pattern="[0-9\s+()-]+"
                                    title="Introduce un número de teléfono válido"
                                    className="w-full p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all font-light text-sm"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={guardando}
                                className={`w-full font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl shadow-md mt-4 transition-colors ${guardando ? 'bg-gray text-surface cursor-not-allowed' : 'bg-primary text-surface hover:bg-accent hover:text-primary'
                                    }`}
                            >
                                {guardando ? 'Procesando...' : 'Confirmar Reserva'}
                            </button>
                        </form>
                    </div>
                )}

                {/* FLUJO 3: TICKET DE CONFIRMACIÓN */}
                {citaConfirmada && (
                    <div className="bg-surface p-8 md:p-10 rounded-3xl shadow-sm border border-darker/10 mt-2 text-center">

                        <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-light">
                            ✓
                        </div>

                        <h3 className="font-cormorant text-3xl text-primary mb-2">¡Reserva confirmada!</h3>
                        <p className="font-inter text-sm text-gray font-light mb-8">Tu cita ha sido guardada correctamente.</p>

                        <div className="py-5 border-y border-darker/10 mb-8">
                            <p className="font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Te esperamos el</p>
                            <p className="font-cormorant text-2xl md:text-3xl text-primary">
                                {formatearFecha(citaConfirmada.fecha_hora.split('T')[0])} a las {new Date(citaConfirmada.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        <div className="bg-background p-6 rounded-2xl border border-darker/10 mb-8 relative text-left">
                            <p className="font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Código de cancelación</p>

                            <p className="text-xs font-mono text-primary break-all bg-surface p-4 border border-darker/10 rounded-xl shadow-inner">
                                {citaConfirmada.id}
                            </p>

                            <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-xl flex gap-3 items-start">
                                <Camera className="text-lg w-16 h-16 text-secondary fill-accent" />
                                <p className="font-inter text-xs text-primary/80 font-light leading-relaxed">
                                    ¡Haz una captura de pantalla a este código! Lo necesitarás si en algún momento deseas cancelar tu cita.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-primary text-surface font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl hover:bg-accent hover:text-primary transition-colors shadow-md"
                        >
                            Volver a la web
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}