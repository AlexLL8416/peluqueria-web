import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function AdminPanel() {
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
    const [citasDelDia, setCitasDelDia] = useState([])

    // Memoria temporal
    const [citasBorrador, setCitasBorrador] = useState([])

    const [nuevaHora, setNuevaHora] = useState('10:00')
    const [nuevaDuracion, setNuevaDuracion] = useState(30)
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })

    useEffect(() => {
        cargarCitas(fecha)
        // Al cambiar de día, limpiamos los borradores para no mezclarlos
        setCitasBorrador([])
    }, [fecha])

    const cargarCitas = async (dia) => {
        const inicioDia = `${dia}T00:00:00.000Z`
        const finDia = `${dia}T23:59:59.999Z`

        const { data, error } = await supabase
            .from('citas')
            .select('*')
            .gte('fecha_hora', inicioDia)
            .lte('fecha_hora', finDia)
            .order('fecha_hora', { ascending: true })

        if (error) {
            console.error("Error al cargar citas:", error)
            return
        }

        setCitasDelDia(data)
        calcularSiguienteHueco(data, [])
    }

    const calcularSiguienteHueco = (citasGuardadas, borradores) => {
        const todasLasCitas = [...citasGuardadas, ...borradores]

        if (todasLasCitas.length === 0) {
            setNuevaHora('10:00')
            return
        }

        const ultimaCita = todasLasCitas[todasLasCitas.length - 1]
        const fechaFin = new Date(ultimaCita.fecha_hora)
        fechaFin.setMinutes(fechaFin.getMinutes() + ultimaCita.duracion_minutos)

        const horaCalculada = fechaFin.toTimeString().substring(0, 5)
        setNuevaHora(horaCalculada)
        setNuevaDuracion(ultimaCita.duracion_minutos)
    }

    const añadirBorrador = (e) => {
        e.preventDefault()

        const fechaHoraFormateada = new Date(`${fecha}T${nuevaHora}`).toISOString()

        const nuevoBorrador = {
            id: `temp-${Date.now()}`,
            fecha_hora: fechaHoraFormateada,
            estado: 'disponible',
            duracion_minutos: parseInt(nuevaDuracion),
            esBorrador: true
        }

        const nuevosBorradores = [...citasBorrador, nuevoBorrador]
        setCitasBorrador(nuevosBorradores)

        calcularSiguienteHueco(citasDelDia, nuevosBorradores)
    }

    const copiarHorarioAnterior = async () => {
        setMensaje({ texto: 'Buscando horario de ayer...', tipo: 'info' })

        const fechaActual = new Date(fecha)
        fechaActual.setDate(fechaActual.getDate() - 1)
        const diaAnterior = fechaActual.toISOString().split('T')[0]

        const inicioAyer = `${diaAnterior}T00:00:00.000Z`
        const finAyer = `${diaAnterior}T23:59:59.999Z`

        const { data, error } = await supabase
            .from('citas')
            .select('*')
            .gte('fecha_hora', inicioAyer)
            .lte('fecha_hora', finAyer)
            .order('fecha_hora', { ascending: true })

        if (error) {
            setMensaje({ texto: 'Error al buscar el horario de ayer.', tipo: 'error' })
            return
        }

        if (data.length === 0) {
            setMensaje({ texto: 'No había citas el día anterior para copiar.', tipo: 'error' })
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000)
            return
        }

        const nuevosBorradores = data.map((cita, index) => {
            const fechaVieja = new Date(cita.fecha_hora)
            const horaString = fechaVieja.toTimeString().substring(0, 5)

            const nuevaFechaHora = new Date(`${fecha}T${horaString}`).toISOString()

            return {
                id: `temp-copy-${Date.now()}-${index}`,
                fecha_hora: nuevaFechaHora,
                estado: 'disponible',
                duracion_minutos: cita.duracion_minutos,
                esBorrador: true
            }
        })

        setCitasBorrador(nuevosBorradores)
        calcularSiguienteHueco(citasDelDia, nuevosBorradores)
        setMensaje({ texto: '¡Horario copiado! Pulsa el botón inferior para guardarlo.', tipo: 'exito' })
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000)
    }

    const eliminarBorrador = (idParaEliminar) => {
        const nuevosBorradores = citasBorrador.filter(cita => cita.id !== idParaEliminar)
        setCitasBorrador(nuevosBorradores)
        calcularSiguienteHueco(citasDelDia, nuevosBorradores)
    }

    const eliminarCitaGuardada = async (fechaHora) => {
        const seguro = window.confirm("¿Seguro que quieres eliminar esta cita de la base de datos?");
        if (!seguro) return;

        const { error } = await supabase
            .from('citas')
            .delete()
            .eq('fecha_hora', fechaHora);

        if (error) {
            console.error("Error al eliminar:", error);
            setMensaje({ texto: 'Error al eliminar la cita.', tipo: 'error' });
            return;
        }

        const nuevasCitas = citasDelDia.filter(cita => cita.fecha_hora !== fechaHora);
        setCitasDelDia(nuevasCitas);

        calcularSiguienteHueco(nuevasCitas, citasBorrador);

        setMensaje({ texto: 'Cita eliminada correctamente.', tipo: 'exito' });
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    }

    const guardarEnBaseDeDatos = async () => {
        setMensaje({ texto: 'Guardando en la base de datos...', tipo: 'info' })

        const citasParaSubir = citasBorrador.map(cita => ({
            fecha_hora: cita.fecha_hora,
            estado: cita.estado,
            duracion_minutos: cita.duracion_minutos
        }))

        const { error } = await supabase
            .from('citas')
            .insert(citasParaSubir)

        if (error) {
            console.error(error)
            setMensaje({ texto: 'Error al subir las citas.', tipo: 'error' })
        } else {
            setMensaje({ texto: '¡Día guardado con éxito!', tipo: 'exito' })
            setCitasBorrador([])
            cargarCitas(fecha)
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000)
        }
    }

    const cambiarDia = (dias) => {
        if (citasBorrador.length > 0) {
            const seguro = window.confirm("Tienes citas sin guardar. Si cambias de día se perderán. ¿Continuar?")
            if (!seguro) return
        }

        const d = new Date(fecha)
        d.setDate(d.getDate() + dias)
        setFecha(d.toISOString().split('T')[0])
    }

    const listaCompleta = [...citasDelDia, ...citasBorrador]

    const banearTelefono = async (telefono, nombre) => {
        if (!telefono) return;
        const seguro = window.confirm(`¿Seguro que quieres bloquear a ${nombre || 'este cliente'} (${telefono})? No podrá volver a reservar.`);
        if (!seguro) return;

        const { error } = await supabase.from('baneados').insert([{ telefono: telefono }]);

        if (error) {
            console.error(error);
            setMensaje({ texto: 'Error al banear el teléfono.', tipo: 'error' });
        } else {
            setMensaje({ texto: `El número ${telefono} ha sido baneado.`, tipo: 'exito' });
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
        }
    }

    return (
        <div className="w-full min-h-screen bg-scandi-light flex flex-col font-inter">

            <div className="w-full max-w-3xl mx-auto flex-1 p-6 md:py-12">

                {/* Navegación de Días */}
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-scandi-darker/10">
                    <button
                        onClick={() => cambiarDia(-1)}
                        className="font-inter text-xs tracking-widest text-scandi-gray hover:text-scandi-black uppercase transition-colors"
                    >
                        &larr; Anterior
                    </button>

                    <input
                        type="date"
                        value={fecha}
                        onChange={(e) => {
                            if (citasBorrador.length > 0 && !window.confirm("Perderás los cambios sin guardar. ¿Continuar?")) return;
                            setFecha(e.target.value)
                        }}
                        className="font-cormorant text-2xl md:text-3xl text-scandi-black text-center bg-transparent outline-none cursor-pointer hover:text-scandi-accent transition-colors"
                    />

                    <button
                        onClick={() => cambiarDia(1)}
                        className="font-inter text-xs tracking-widest text-scandi-gray hover:text-scandi-black uppercase transition-colors"
                    >
                        Siguiente &rarr;
                    </button>
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

                {/* Lista de Citas */}
                <div className="mb-12 space-y-4">
                    <h3 className="font-inter text-[10px] tracking-widest text-scandi-gray uppercase px-2 mb-6">
                        Citas para este día
                    </h3>

                    {listaCompleta.length === 0 ? (
                        <div className="text-center py-12 bg-scandi-white rounded-3xl border border-scandi-darker/10 shadow-sm flex flex-col items-center">
                            <p className="font-inter text-sm text-scandi-gray font-light mb-6">No hay citas creadas para este día.</p>
                            <button
                                onClick={copiarHorarioAnterior}
                                className="font-inter text-[10px] tracking-widest uppercase border border-scandi-darker/20 text-scandi-black py-3 px-6 rounded-2xl hover:border-scandi-black transition-all"
                            >
                                Copiar horario de ayer
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {listaCompleta.map((cita) => {
                                const hora = new Date(cita.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                const estaReservada = cita.estado !== 'disponible' && !cita.esBorrador

                                return (
                                    <div
                                        key={cita.id}
                                        className={`flex flex-col p-5 rounded-2xl border transition-all ${cita.esBorrador
                                                ? 'bg-scandi-accent/5 border-scandi-accent/40 border-dashed'
                                                : estaReservada
                                                    ? 'bg-white border-scandi-darker/20 shadow-md'
                                                    : 'bg-scandi-white border-scandi-darker/10 shadow-sm'
                                            }`}
                                    >
                                        {/* Fila Superior: Hora y controles */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                <span className="font-cormorant text-2xl text-scandi-black">{hora}</span>
                                                {cita.esBorrador && (
                                                    <span className="font-inter text-[9px] tracking-widest uppercase text-scandi-accent font-medium border border-scandi-accent/30 px-2 py-1 rounded-full">
                                                        Borrador
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-4 md:gap-6 items-center justify-between sm:justify-end">
                                                <span className="font-inter text-xs text-scandi-gray">{cita.duracion_minutos} min</span>

                                                <span className={`font-inter text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full ${estaReservada ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                    {cita.estado}
                                                </span>

                                                <button
                                                    onClick={() => cita.esBorrador ? eliminarBorrador(cita.id) : eliminarCitaGuardada(cita.fecha_hora)}
                                                    className="font-inter text-[10px] tracking-widest uppercase text-scandi-gray hover:text-red-500 transition-colors ml-2"
                                                    title="Eliminar cita"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>

                                        {/* Fila Inferior: Datos del cliente (Solo si está reservada) */}
                                        {estaReservada && (cita.nombre_cliente || cita.telefono) && (
                                            <div className="mt-4 pt-4 border-t border-scandi-darker/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <p className="font-inter text-sm text-scandi-black font-medium">{cita.nombre_cliente || 'Sin nombre'}</p>
                                                    <p className="font-inter text-xs text-scandi-gray">{cita.telefono || 'Sin teléfono'}</p>
                                                </div>
                                                <button
                                                    onClick={() => banearTelefono(cita.telefono, cita.nombre_cliente)}
                                                    className="text-red-600 font-inter text-[9px] tracking-widest uppercase border border-red-200 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors shrink-0"
                                                >
                                                    Bloquear Cliente
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* FORMULARIO DE AÑADIR ADAPTADO A iOS */}
                <form onSubmit={añadirBorrador} className="p-5 sm:p-6 md:p-8 bg-scandi-white rounded-3xl border border-scandi-darker/10 shadow-sm mb-8 w-full box-border overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 sm:gap-6 sm:items-end w-full">
                        <div className="w-full min-w-0 flex flex-col">
                            <label className="block font-inter text-[10px] tracking-widest text-scandi-gray uppercase mb-2">Hora</label>
                            <input
                                type="time"
                                value={nuevaHora}
                                onChange={(e) => setNuevaHora(e.target.value)}
                                className="w-full min-w-0 appearance-none py-3 px-2 md:p-4 border border-scandi-darker/20 rounded-2xl bg-scandi-light/50 focus:bg-scandi-white focus:ring-1 focus:ring-scandi-accent outline-none transition-all font-light text-sm box-border"
                                required
                            />
                        </div>
                        <div className="w-full min-w-0 flex flex-col">
                            <label className="block font-inter text-[10px] tracking-widest text-scandi-gray uppercase mb-2">Minutos</label>
                            <input
                                type="number"
                                step="5"
                                value={nuevaDuracion}
                                onChange={(e) => setNuevaDuracion(e.target.value)}
                                className="w-full min-w-0 appearance-none py-3 px-2 md:p-4 border border-scandi-darker/20 rounded-2xl bg-scandi-light/50 focus:bg-scandi-white focus:ring-1 focus:ring-scandi-accent outline-none transition-all font-light text-sm box-border"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto py-3 md:py-4 px-8 bg-scandi-black text-scandi-white font-inter text-xs tracking-widest uppercase rounded-2xl hover:bg-scandi-accent hover:text-scandi-black transition-colors shadow-md box-border"
                        >
                            Preparar Hueco
                        </button>
                    </div>
                </form>

                {/* PANEL DE GUARDADO (Solo visible si hay borradores) */}
                {citasBorrador.length > 0 && (
                    <div className="bg-scandi-black p-8 rounded-3xl text-center shadow-lg border border-scandi-black">
                        <p className="font-inter text-sm text-scandi-white/80 font-light mb-6">
                            Tienes <span className="text-scandi-accent font-medium">{citasBorrador.length}</span> hueco(s) listo(s) para subir.
                        </p>
                        <button
                            onClick={guardarEnBaseDeDatos}
                            className="w-full bg-scandi-accent text-scandi-black font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl hover:bg-scandi-white transition-colors shadow-md"
                        >
                            Guardar {citasBorrador.length} citas en la Base de Datos
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}