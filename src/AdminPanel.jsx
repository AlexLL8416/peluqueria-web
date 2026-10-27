import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from './supabase'
import { Aviso } from './ui'
import APP_CONFIG from './config/tenant.js'
import { normalizarTelefono, telefonoValido, horaMadrid, madridAISO, rangoDiaMadrid, sumarDias, hoyMadrid } from './utils'

export default function AdminPanel() {
    const [fecha, setFecha] = useState(hoyMadrid)
    const [citasDelDia, setCitasDelDia] = useState([])
    const [citasBorrador, setCitasBorrador] = useState([])

    // Estados para el formulario de crear
    const [nuevaHora, setNuevaHora] = useState('10:00')
    const [nuevaDuracion, setNuevaDuracion] = useState(30)
    const [nuevoTipo, setNuevoTipo] = useState('Corte de pelo')

    // Estados para editar citas existentes
    const [citaEditando, setCitaEditando] = useState(null)
    const [editDatos, setEditDatos] = useState({ nombre_cliente: '', telefono: '', tipo: 'Corte de pelo' })

    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })

    const calcularSiguienteHueco = (citasGuardadas, borradores) => {
        const todasLasCitas = [...citasGuardadas, ...borradores]

        if (todasLasCitas.length === 0) {
            setNuevaHora('10:00')
            return
        }

        const ultimaCita = todasLasCitas[todasLasCitas.length - 1]
        const fechaFin = new Date(ultimaCita.fecha_hora).getTime() + ultimaCita.duracion_minutos * 60000

        setNuevaHora(horaMadrid(fechaFin))
        setNuevaDuracion(ultimaCita.duracion_minutos)
        setNuevoTipo(ultimaCita.tipo)
    }

    const pedirCitas = (dia) => {
        const [inicioDia, finDia] = rangoDiaMadrid(dia)
        return supabase
            .from('citas')
            .select('*')
            .gte('fecha_hora', inicioDia)
            .lt('fecha_hora', finDia)
            .order('fecha_hora', { ascending: true })
    }

    const mostrarCitas = ({ data, error }) => {
        if (error) {
            console.error("Error al cargar citas:", error)
            return
        }

        setCitasDelDia(data)
        calcularSiguienteHueco(data, [])
    }

    const cargarCitas = (dia) => pedirCitas(dia).then(mostrarCitas)

    useEffect(() => {
        pedirCitas(fecha).then(mostrarCitas)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo recarga al cambiar de día
    }, [fecha])

    // Al cambiar de día se descartan los borradores y la edición en curso.
    const irADia = (dia) => {
        if (citasBorrador.length > 0 && !window.confirm("Tienes citas sin guardar. Si cambias de día se perderán. ¿Continuar?")) return
        setCitasBorrador([])
        setCitaEditando(null)
        setFecha(dia)
    }

    const añadirBorrador = (e) => {
        e.preventDefault()
        const fechaHoraFormateada = madridAISO(fecha, nuevaHora)

        const nuevoBorrador = {
            id: `temp-${crypto.randomUUID()}`,
            fecha_hora: fechaHoraFormateada,
            estado: 'disponible',
            duracion_minutos: parseInt(nuevaDuracion),
            tipo: nuevoTipo,
            esBorrador: true
        }

        const nuevosBorradores = [...citasBorrador, nuevoBorrador]
        setCitasBorrador(nuevosBorradores)
        calcularSiguienteHueco(citasDelDia, nuevosBorradores)
    }

    const copiarHorarioAnterior = async () => {
        setMensaje({ texto: 'Buscando horario de ayer...', tipo: 'info' })

        const [inicioAyer, finAyer] = rangoDiaMadrid(sumarDias(fecha, -1))

        const { data, error } = await supabase
            .from('citas')
            .select('*')
            .gte('fecha_hora', inicioAyer)
            .lt('fecha_hora', finAyer)
            .order('fecha_hora', { ascending: true })

        if (error || data.length === 0) {
            setMensaje({ texto: 'No había citas el día anterior para copiar.', tipo: 'error' })
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000)
            return
        }

        const nuevosBorradores = data.map((cita) => {
            const nuevaFechaHora = madridAISO(fecha, horaMadrid(cita.fecha_hora))

            return {
                id: `temp-${crypto.randomUUID()}`,
                fecha_hora: nuevaFechaHora,
                estado: 'disponible',
                duracion_minutos: cita.duracion_minutos,
                tipo: cita.tipo,
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

    const eliminarCitaGuardada = async (id) => {
        const seguro = window.confirm("¿Seguro que quieres eliminar esta cita de la base de datos?");
        if (!seguro) return;

        const { error } = await supabase.from('citas').delete().eq('id', id);
        if (error) {
            setMensaje({ texto: 'Error al eliminar la cita.', tipo: 'error' });
            return;
        }

        const nuevasCitas = citasDelDia.filter(cita => cita.id !== id);
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
            duracion_minutos: cita.duracion_minutos,
            tipo: cita.tipo
        }))

        const { error } = await supabase.from('citas').insert(citasParaSubir)

        if (error) {
            setMensaje({ texto: 'Error al subir las citas.', tipo: 'error' })
        } else {
            setMensaje({ texto: '¡Día guardado con éxito!', tipo: 'exito' })
            setCitasBorrador([])
            cargarCitas(fecha)
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000)
        }
    }

    const cambiarDia = (dias) => irADia(sumarDias(fecha, dias))

    const banearTelefono = async (telefono, nombre) => {
        if (!telefono) return;
        if (!window.confirm(`¿Seguro que quieres bloquear a ${nombre || 'este cliente'} (${telefono})?`)) return;

        const { error } = await supabase.from('baneados').insert([{ telefono: normalizarTelefono(telefono) }]);
        if (error) {
            setMensaje({ texto: 'Error al banear el teléfono.', tipo: 'error' });
        } else {
            setMensaje({ texto: `El número ${telefono} ha sido baneado.`, tipo: 'exito' });
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
        }
    }

    // Funciones de Edición
    const iniciarEdicion = (cita) => {
        setCitaEditando(cita.id)
        setEditDatos({
            nombre_cliente: cita.nombre_cliente || '',
            telefono: cita.telefono || '',
            tipo: cita.tipo || 'Corte de pelo'
        })
    }

    const cancelarEdicion = () => {
        setCitaEditando(null)
        setEditDatos({ nombre_cliente: '', telefono: '', tipo: 'Corte de pelo' })
    }

    const guardarEdicion = async (citaId) => {
        const nombreTrim = editDatos.nombre_cliente.trim()
        const telefonoTrim = normalizarTelefono(editDatos.telefono)

        if (telefonoTrim && !telefonoValido(telefonoTrim)) {
            setMensaje({ texto: 'El teléfono debe tener 9 dígitos.', tipo: 'error' })
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000)
            return
        }

        // Si rellenan nombre o teléfono se marca como reservada, si lo borran queda libre
        const nuevoEstado = (nombreTrim || telefonoTrim) ? 'reservada' : 'disponible'

        setMensaje({ texto: 'Actualizando cita...', tipo: 'info' })

        const cambios = {
            nombre_cliente: nombreTrim || null,
            telefono: telefonoTrim || null,
            tipo: editDatos.tipo,
            estado: nuevoEstado
        }
        // Una cita libre no puede conservar el token de la reserva anterior.
        if (nuevoEstado === 'disponible') cambios.token_cancelacion = null

        const { error } = await supabase
            .from('citas')
            .update(cambios)
            .eq('id', citaId)

        if (error) {
            setMensaje({ texto: 'Error al actualizar la cita.', tipo: 'error' })
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000)
        } else {
            setMensaje({ texto: 'Cita actualizada correctamente.', tipo: 'exito' })
            const nuevasCitas = citasDelDia.map(c =>
                c.id === citaId
                    ? { ...c, nombre_cliente: nombreTrim || null, telefono: telefonoTrim || null, tipo: editDatos.tipo, estado: nuevoEstado }
                    : c
            )
            setCitasDelDia(nuevasCitas)
            setCitaEditando(null)
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000)
        }
    }

    const listaCompleta = [...citasDelDia, ...citasBorrador]

    return (
        <div className="w-full min-h-screen bg-background flex flex-col font-inter">
            <div className="w-full max-w-3xl mx-auto flex-1 p-6 md:py-12">

                {/* Navegación Días */}
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-darker/10">
                    <button onClick={() => cambiarDia(-1)} className="font-inter text-xs tracking-widest text-gray hover:text-primary uppercase transition-colors inline-flex items-center gap-1 min-h-11"><ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" /> Anterior</button>
                    <input type="date" aria-label="Día" value={fecha} onChange={(e) => e.target.value && irADia(e.target.value)} className="font-cormorant text-2xl md:text-3xl text-primary text-center bg-transparent outline-none cursor-pointer hover:text-accent transition-colors" />
                    <button onClick={() => cambiarDia(1)} className="font-inter text-xs tracking-widest text-gray hover:text-primary uppercase transition-colors inline-flex items-center gap-1 min-h-11">Siguiente <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" /></button>
                </div>

                <Aviso mensaje={mensaje} />

                {/* Lista de Citas */}
                <div className="mb-12 space-y-4">
                    <h3 className="font-inter text-[10px] tracking-widest text-gray uppercase px-2 mb-6">Citas para este día</h3>
                    {listaCompleta.length === 0 ? (
                        <div className="text-center py-12 bg-surface rounded-3xl border border-darker/10 shadow-sm flex flex-col items-center">
                            <p className="font-inter text-sm text-gray font-light mb-6">No hay citas creadas para este día.</p>
                            <button onClick={copiarHorarioAnterior} className="font-inter text-[10px] tracking-widest uppercase border border-darker/20 text-primary py-3 px-6 rounded-2xl hover:border-primary transition-all">
                                Copiar horario de ayer
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {listaCompleta.map((cita) => {
                                const hora = horaMadrid(cita.fecha_hora)
                                const estaReservada = cita.estado !== 'disponible' && !cita.esBorrador
                                const estaEditando = citaEditando === cita.id

                                // Si está en modo edición, mostramos el formulario integrado en la tarjeta
                                if (estaEditando) {
                                    return (
                                        <div key={cita.id} className="flex flex-col p-5 rounded-2xl border bg-surface border-accent shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="font-cormorant text-2xl text-primary">{hora}</span>
                                                    <span className="font-inter text-[9px] tracking-widest uppercase text-accent font-medium border border-accent/30 px-2 py-1 rounded-full">Editando</span>
                                                </div>
                                                <span className="font-inter text-xs text-gray">{cita.duracion_minutos} min</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                                <div className="flex flex-col">
                                                    <label className="font-inter text-[10px] tracking-widest text-gray uppercase mb-1">Servicio</label>
                                                    <select value={editDatos.tipo} onChange={(e) => setEditDatos({ ...editDatos, tipo: e.target.value })} className="w-full p-3 border border-darker/20 rounded-xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent outline-none text-sm transition-all">
                                                        {APP_CONFIG.services.map(srv => <option key={srv} value={srv}>{srv}</option>)}
                                                    </select>
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="font-inter text-[10px] tracking-widest text-gray uppercase mb-1">Nombre</label>
                                                    <input type="text" value={editDatos.nombre_cliente} onChange={(e) => setEditDatos({ ...editDatos, nombre_cliente: e.target.value })} placeholder="Ej. Ana" className="w-full p-3 border border-darker/20 rounded-xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent outline-none text-sm transition-all" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="font-inter text-[10px] tracking-widest text-gray uppercase mb-1">Teléfono</label>
                                                    <input type="tel" value={editDatos.telefono} onChange={(e) => setEditDatos({ ...editDatos, telefono: e.target.value })} placeholder="Opcional" className="w-full p-3 border border-darker/20 rounded-xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent outline-none text-sm transition-all" />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 mt-2 border-t border-darker/10 pt-4">
                                                <button onClick={cancelarEdicion} className="font-inter text-[10px] tracking-widest uppercase px-4 py-2 text-gray hover:bg-darker/5 rounded-xl transition-colors">Cancelar</button>
                                                <button onClick={() => guardarEdicion(cita.id)} className="font-inter text-[10px] tracking-widest uppercase px-5 py-2 bg-primary text-surface rounded-xl hover:bg-accent hover:text-primary transition-colors shadow-sm">Guardar Cambios</button>
                                            </div>
                                        </div>
                                    )
                                }

                                // Tarjeta Normal
                                return (
                                    <div key={cita.id} className={`flex flex-col p-5 rounded-2xl border transition-all ${cita.esBorrador ? 'bg-accent/5 border-accent/40 border-dashed' : estaReservada ? 'bg-surface border-darker/20 shadow-md' : 'bg-surface border-darker/10 shadow-sm hover:border-darker/30'}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                <span className="font-cormorant text-2xl text-primary">{hora}</span>
                                                {cita.esBorrador && <span className="font-inter text-[9px] tracking-widest uppercase text-accent font-medium border border-accent/30 px-2 py-1 rounded-full">Borrador</span>}
                                            </div>
                                            <div className="flex gap-4 md:gap-5 items-center justify-between sm:justify-end flex-wrap">
                                                <span className="font-inter text-xs text-gray">{cita.tipo} • {cita.duracion_minutos} min</span>
                                                <span className={`font-inter text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full ${estaReservada ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{cita.estado}</span>

                                                <div className="flex items-center gap-2">
                                                    {!cita.esBorrador && (
                                                        <button onClick={() => iniciarEdicion(cita)} className="font-inter text-[10px] tracking-widest uppercase text-accent hover:text-primary transition-colors" title="Editar cita">Editar</button>
                                                    )}
                                                    <button onClick={() => cita.esBorrador ? eliminarBorrador(cita.id) : eliminarCitaGuardada(cita.id)} className="font-inter text-[10px] tracking-widest uppercase text-gray hover:text-red-500 transition-colors" title="Eliminar cita">Eliminar</button>
                                                </div>
                                            </div>
                                        </div>
                                        {estaReservada && (cita.nombre_cliente || cita.telefono) && (
                                            <div className="mt-4 pt-4 border-t border-darker/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <p className="font-inter text-sm text-primary font-medium">{cita.nombre_cliente || 'Sin nombre'}</p>
                                                    <p className="font-inter text-xs text-gray">{cita.telefono || 'Sin teléfono'}</p>
                                                </div>
                                                <button onClick={() => banearTelefono(cita.telefono, cita.nombre_cliente)} className="text-red-600 font-inter text-[9px] tracking-widest uppercase border border-red-200 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors shrink-0">Bloquear Cliente</button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* FORMULARIO DE AÑADIR ADAPTADO */}
                <form onSubmit={añadirBorrador} className="p-5 sm:p-6 md:p-8 bg-surface rounded-3xl border border-darker/10 shadow-sm mb-8 w-full box-border overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-4 sm:gap-6 sm:items-end w-full">
                        <div className="w-full min-w-0 flex flex-col">
                            <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Hora</label>
                            <input type="time" value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} className="w-full min-w-0 appearance-none py-3 px-2 md:p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent outline-none transition-all font-light text-sm box-border" required />
                        </div>
                        <div className="w-full min-w-0 flex flex-col">
                            <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Minutos</label>
                            <input type="number" step="5" value={nuevaDuracion} onChange={(e) => setNuevaDuracion(e.target.value)} className="w-full min-w-0 appearance-none py-3 px-2 md:p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent outline-none transition-all font-light text-sm box-border" required />
                        </div>
                        <div className="w-full min-w-0 flex flex-col">
                            <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Servicio</label>
                            <select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} className="w-full min-w-0 py-3 px-2 md:p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent outline-none transition-all font-light text-sm box-border" required>
                                {APP_CONFIG.services.map(srv => <option key={srv} value={srv}>{srv}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full sm:w-auto py-3 md:py-4 px-8 bg-primary text-surface font-inter text-xs tracking-widest uppercase rounded-2xl hover:bg-accent hover:text-primary transition-colors shadow-md box-border">
                            Preparar Hueco
                        </button>
                    </div>
                </form>

                {/* PANEL DE GUARDADO */}
                {citasBorrador.length > 0 && (
                    <div className="bg-primary p-8 rounded-3xl text-center shadow-lg border border-primary">
                        <p className="font-inter text-sm text-surface/80 font-light mb-6">
                            Tienes <span className="text-accent font-medium">{citasBorrador.length}</span> hueco(s) listo(s) para subir.
                        </p>
                        <button onClick={guardarEnBaseDeDatos} className="w-full bg-accent text-primary font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl hover:bg-surface transition-colors shadow-md">
                            Guardar {citasBorrador.length} citas en la Base de Datos
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}