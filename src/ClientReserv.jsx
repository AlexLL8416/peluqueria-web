import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabase'
import { ArrowLeft, ArrowRight, Camera, Check, Phone } from 'lucide-react'
import { Aviso, VolverInicio } from './ui'
import APP_CONFIG from './config/tenant.js'
import { nombreValido, telefonoValido, horaMadrid, diaMadrid, fechaCortaMadrid, descargarICS } from './utils'

const ERRORES_RESERVA = {
    no_disponible: '¡Vaya! Esta hora ya no está disponible. Por favor, elige otra.',
    baneado: 'Este número de teléfono no tiene permitido realizar reservas.',
    limite_semanal: 'Ya tienes una cita reservada para esta semana. Solo se permite una por semana.',
    telefono_invalido: 'Introduce un teléfono de 9 dígitos (puedes usar espacios o +34).',
    nombre_invalido: 'Por favor, introduce un nombre válido (solo letras).',
    demasiadas_reservas: 'Se han hecho demasiadas reservas desde esta conexión. Llámanos y te ayudamos.'
}

export default function ClientView() {
    const [todasLasCitas, setTodasLasCitas] = useState([])
    const [diaSeleccionado, setDiaSeleccionado] = useState('')

    // Flujo de reserva
    // La carta de la portada enlaza con ?servicio= para llegar con el servicio elegido.
    const [servicioSeleccionado, setServicioSeleccionado] = useState(() => {
        const servicio = new URLSearchParams(window.location.search).get('servicio')
        return APP_CONFIG.services.includes(servicio) ? servicio : null
    })
    const [citaSeleccionada, setCitaSeleccionada] = useState(null)
    const [citaConfirmada, setCitaConfirmada] = useState(null)

    const [nombre, setNombre] = useState('')
    const [telefono, setTelefono] = useState('')
    const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false)

    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)

    // Huecos del servicio elegido agrupados por día de Madrid.
    const citasDisponibles = useMemo(() => {
        const agrupadas = {}
        todasLasCitas
            .filter(c => c.tipo === servicioSeleccionado)
            .forEach(cita => {
                const dia = diaMadrid(cita.fecha_hora)
                ;(agrupadas[dia] ||= []).push(cita)
            })
        return agrupadas
    }, [servicioSeleccionado, todasLasCitas])

    const diasDisponibles = Object.keys(citasDisponibles)
    const diaActivo = citasDisponibles[diaSeleccionado] ? diaSeleccionado : diasDisponibles[0]
    const huecosPorServicio = useMemo(() => {
        const cuenta = {}
        todasLasCitas.forEach(c => { cuenta[c.tipo] = (cuenta[c.tipo] || 0) + 1 })
        return cuenta
    }, [todasLasCitas])

    // La vista ya filtra huecos libres con más de 1 h de margen.
    const pedirHuecos = () => supabase
        .from('huecos_disponibles')
        .select('*')
        .order('fecha_hora', { ascending: true })

    const mostrarHuecos = ({ data, error }) => {
        if (error) {
            console.error("Error al cargar citas:", error)
            setMensaje({ texto: 'Error al conectar con la peluquería.', tipo: 'error' })
            setCargando(false)
            return
        }

        setTodasLasCitas(data)
        setCargando(false)
    }

    const cargarCitas = () => pedirHuecos().then(mostrarHuecos)

    useEffect(() => {
        pedirHuecos().then(mostrarHuecos)
    }, [])

    const enlaceCancelacion = (token) => `${window.location.origin}/cancelar?token=${token}`

    const copiarEnlace = async () => {
        try {
            await navigator.clipboard.writeText(enlaceCancelacion(citaConfirmada.token))
            setMensaje({ texto: 'Enlace copiado. Guárdalo para poder cancelar.', tipo: 'exito' })
        } catch {
            setMensaje({ texto: 'No se ha podido copiar. Haz una captura del código.', tipo: 'error' })
        }
    }

    const añadirAlCalendario = () => descargarICS({
        inicio: citaConfirmada.fecha_hora,
        minutos: citaConfirmada.duracion_minutos,
        titulo: `${citaConfirmada.tipo} · ${APP_CONFIG.site.name}`,
        descripcion: `Para cancelar: ${enlaceCancelacion(citaConfirmada.token)}`,
        lugar: APP_CONFIG.contact.address
    })

    const confirmarReserva = async (e) => {
        e.preventDefault()

        // Validación solo para feedback inmediato; el servidor vuelve a validarlo todo.
        if (!nombreValido(nombre)) {
            setMensaje({ texto: ERRORES_RESERVA.nombre_invalido, tipo: 'error' })
            return
        }
        if (!telefonoValido(telefono)) {
            setMensaje({ texto: ERRORES_RESERVA.telefono_invalido, tipo: 'error' })
            return
        }
        if (!aceptaPrivacidad) {
            setMensaje({ texto: 'Debes aceptar la política de privacidad para reservar.', tipo: 'error' })
            return
        }

        setGuardando(true)
        setMensaje({ texto: 'Procesando reserva...', tipo: 'info' })

        const { data, error } = await supabase.rpc('reservar_cita', {
            p_id: citaSeleccionada.id,
            p_nombre: nombre,
            p_telefono: telefono
        })

        setGuardando(false)

        if (error) {
            setMensaje({ texto: ERRORES_RESERVA[error.message] || 'No se ha podido completar la reserva. Inténtalo de nuevo.', tipo: 'error' })
            if (error.message === 'no_disponible') {
                setCitaSeleccionada(null)
                cargarCitas()
            }
            return
        }

        setMensaje({ texto: '', tipo: '' })
        setCitaConfirmada({ ...citaSeleccionada, fecha_hora: data.fecha_hora, token: data.token })
        setCitaSeleccionada(null)
        setNombre('')
        setTelefono('')
        setAceptaPrivacidad(false)
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
            <div className="w-full bg-surface border-b border-darker/10 p-8 shadow-sm text-center relative flex items-center justify-center">
                <VolverInicio className="absolute left-3 md:left-10" />
                <div>
                    <span className="font-inter text-[10px] tracking-[0.3em] text-gray uppercase mb-2 block">
                        {APP_CONFIG.site?.name || 'Salón de Belleza'}
                    </span>
                    <h1 className="font-cormorant text-4xl text-primary font-normal">
                        Reserva tu <span className="text-accent">cita</span>
                    </h1>
                </div>
            </div>

            <div className="w-full max-w-xl mx-auto flex-1 p-6 md:p-10">

                <Aviso mensaje={mensaje} />

                {/* FLUJO 0: SELECCIONAR SERVICIO */}
                {!servicioSeleccionado && !citaConfirmada && (
                    <div className="space-y-4 fade-in">
                        <h2 className="font-cormorant text-3xl text-primary mb-8 px-1 text-center text-balance">
                            ¿Qué servicio necesitas hoy?
                        </h2>
                        <div className="flex flex-col gap-4">
                            {APP_CONFIG.services.map(srv => (
                                <button
                                    key={srv}
                                    onClick={() => { setMensaje({ texto: '', tipo: '' }); setServicioSeleccionado(srv) }}
                                    className="bg-surface border border-darker/20 hover:border-accent text-primary p-6 rounded-2xl shadow-sm transition-all duration-300 text-xl font-cormorant flex justify-between items-center group"
                                >
                                    <span className="flex flex-col items-start gap-1">
                                        {srv}
                                        <span className="font-inter text-[10px] tracking-widest text-gray uppercase">
                                            {huecosPorServicio[srv] ? `${huecosPorServicio[srv]} huecos libres` : 'Sin huecos ahora'}
                                        </span>
                                    </span>
                                    <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" className="text-accent opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* FLUJO 1: MOSTRAR DÍAS Y HORAS */}
                {servicioSeleccionado && !citaSeleccionada && !citaConfirmada && (
                    <div className="fade-in">
                        <button
                            onClick={() => setServicioSeleccionado(null)}
                            className="font-inter text-xs tracking-widest text-gray hover:text-primary uppercase mb-8 flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" /> Cambiar servicio
                        </button>

                        <div className="mb-6">
                            <span className="font-inter text-[10px] tracking-widest text-accent uppercase px-3 py-1 bg-accent/10 rounded-full">
                                {servicioSeleccionado}
                            </span>
                        </div>

                        {diasDisponibles.length === 0 ? (
                            <div className="text-center p-12 bg-surface rounded-3xl border border-darker/10 shadow-sm mt-4">
                                <p className="font-cormorant text-2xl text-primary mb-2">Ahora mismo no quedan huecos</p>
                                <p className="font-inter text-sm text-gray font-light leading-relaxed mb-6">
                                    Abrimos nuevas horas cada semana. Si te corre prisa, llámanos y te buscamos un hueco.
                                </p>
                                <a href={APP_CONFIG.contact.phoneHref} className="inline-flex items-center gap-2 min-h-11 px-6 rounded-full bg-primary text-surface font-inter text-xs tracking-widest uppercase hover:bg-accent hover:text-primary transition-colors">
                                    <Phone size={16} strokeWidth={1.5} aria-hidden="true" /> {APP_CONFIG.contact.phone}
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="font-inter text-xs tracking-[0.2em] text-gray uppercase mb-4 px-1">¿Qué día prefieres?</h2>
                                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                                        {diasDisponibles.map(dia => (
                                            <button
                                                key={dia}
                                                onClick={() => setDiaSeleccionado(dia)}
                                                className={`whitespace-nowrap px-6 py-4 rounded-2xl font-inter text-xs tracking-widest uppercase transition-all shrink-0 border ${diaActivo === dia
                                                    ? 'bg-primary text-background border-primary shadow-md'
                                                    : 'bg-surface text-primary border-darker/20 hover:border-primary'
                                                    }`}
                                            >
                                                {fechaCortaMadrid(dia)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="font-inter text-xs tracking-[0.2em] text-gray uppercase mb-4 px-1">Horas disponibles</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {citasDisponibles[diaActivo]?.map((cita) => {
                                            const hora = horaMadrid(cita.fecha_hora)
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
                    </div>
                )}

                {/* FLUJO 2: FORMULARIO DE CONFIRMACIÓN */}
                {citaSeleccionada && (
                    <div className="bg-surface p-8 md:p-10 rounded-3xl shadow-sm border border-darker/10 mt-2 fade-in">
                        <button
                            onClick={() => setCitaSeleccionada(null)}
                            className="font-inter text-xs tracking-widest text-gray hover:text-primary uppercase mb-8 flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" /> Cambiar hora
                        </button>

                        <div className="mb-8 pb-6 border-b border-darker/10">
                            <p className="font-inter text-[10px] tracking-widest text-gray uppercase mb-1">{citaSeleccionada.tipo}</p>
                            <p className="font-cormorant text-2xl md:text-3xl text-primary">
                                {fechaCortaMadrid(citaSeleccionada.fecha_hora)} a las {horaMadrid(citaSeleccionada.fecha_hora)}
                            </p>
                        </div>

                        <form onSubmit={confirmarReserva} className="space-y-6">
                            <div>
                                <label htmlFor="reserva-nombre" className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Tu Nombre</label>
                                <input
                                    id="reserva-nombre"
                                    type="text"
                                    autoComplete="name"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej. María"
                                    className="w-full p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all font-light text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="reserva-telefono" className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Tu Teléfono</label>
                                <input
                                    id="reserva-telefono"
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="Ej. 600 123 456"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    className="w-full p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all font-light text-sm"
                                    required
                                />
                            </div>
                            <label className="flex items-start gap-3 font-inter text-xs text-gray font-light leading-relaxed cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={aceptaPrivacidad}
                                    onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                                    className="mt-0.5 accent-primary"
                                    required
                                />
                                <span>
                                    He leído y acepto la <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-accent">política de privacidad</a>.
                                </span>
                            </label>
                            <button
                                type="submit"
                                disabled={guardando}
                                className={`w-full font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl shadow-md mt-4 transition-colors ${guardando ? 'bg-gray text-surface cursor-not-allowed' : 'bg-primary text-surface hover:bg-accent hover:text-primary'}`}
                            >
                                {guardando ? 'Procesando...' : 'Confirmar Reserva'}
                            </button>
                        </form>
                    </div>
                )}

                {/* FLUJO 3: TICKET DE CONFIRMACIÓN */}
                {citaConfirmada && (
                    <div className="bg-surface p-8 md:p-10 rounded-3xl shadow-sm border border-darker/10 mt-2 text-center fade-in">
                        <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6"><Check size={28} strokeWidth={1.5} aria-hidden="true" /></div>
                        <h3 className="font-cormorant text-3xl text-primary mb-2">¡Reserva confirmada!</h3>
                        <p className="font-inter text-sm text-gray font-light mb-8">Tu cita ha sido guardada correctamente.</p>

                        <div className="py-5 border-y border-darker/10 mb-8">
                            <p className="font-inter text-[10px] tracking-widest text-gray uppercase mb-2">{citaConfirmada.tipo}</p>
                            <p className="font-cormorant text-2xl md:text-3xl text-primary">
                                {fechaCortaMadrid(citaConfirmada.fecha_hora)} a las {horaMadrid(citaConfirmada.fecha_hora)}
                            </p>
                        </div>

                        <div className="bg-background p-6 rounded-2xl border border-darker/10 mb-8 relative text-left">
                            <p className="font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Código de cancelación</p>
                            <p className="text-xs font-mono text-primary break-all bg-surface p-4 border border-darker/10 rounded-xl shadow-inner">{citaConfirmada.token}</p>
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                                <button type="button" onClick={copiarEnlace} className="font-inter text-[10px] tracking-widest text-gray hover:text-primary uppercase underline transition-colors">
                                    Copiar enlace de cancelación
                                </button>
                                <a href={`/cancelar?token=${citaConfirmada.token}`} className="font-inter text-[10px] tracking-widest text-gray hover:text-primary uppercase underline transition-colors">
                                    Abrir enlace
                                </a>
                            </div>
                            <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-xl flex gap-3 items-start">
                                <Camera size={18} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5 text-accent" />
                                <p className="font-inter text-xs text-primary/80 font-light leading-relaxed">
                                    Guarda este código (una captura vale) o añade la cita a tu calendario: el enlace para cancelar va dentro.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={añadirAlCalendario}
                            className="w-full mb-3 border border-primary text-primary font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl hover:bg-primary hover:text-surface transition-colors"
                        >
                            Añadir a mi calendario
                        </button>
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