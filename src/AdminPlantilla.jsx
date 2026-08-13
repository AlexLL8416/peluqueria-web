import { useState } from 'react'
import { supabase } from './supabase'

export default function AdminPlantilla() {
    const [plantilla, setPlantilla] = useState([])
    const [nuevaHora, setNuevaHora] = useState('10:00')
    const [nuevaDuracion, setNuevaDuracion] = useState(30)
    const [nuevoTipo, setNuevoTipo] = useState('Corte de pelo') // Nuevo estado

    const [fechaCalendario, setFechaCalendario] = useState(new Date())
    const [diasSeleccionados, setDiasSeleccionados] = useState([])
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })

    const calcularSiguienteHueco = (huecos) => {
        if (huecos.length === 0) {
            setNuevaHora('10:00')
            return
        }
        const ultimaCita = huecos[huecos.length - 1]
        const [horas, minutos] = ultimaCita.hora.split(':').map(Number)
        const fechaFin = new Date(2000, 0, 1, horas, minutos + ultimaCita.duracion)
        setNuevaHora(fechaFin.toTimeString().substring(0, 5))
        setNuevaDuracion(ultimaCita.duracion)
        setNuevoTipo(ultimaCita.tipo) // Arrastra el último servicio
    }

    const añadirHueco = (e) => {
        e.preventDefault()
        const nuevoHueco = {
            id: `plantilla-${Date.now()}`,
            hora: nuevaHora,
            duracion: parseInt(nuevaDuracion),
            tipo: nuevoTipo // Guardamos el tipo
        }
        const nuevaPlantilla = [...plantilla, nuevoHueco]
        setPlantilla(nuevaPlantilla)
        calcularSiguienteHueco(nuevaPlantilla)
    }

    const eliminarHueco = (id) => {
        const nuevaPlantilla = plantilla.filter(h => h.id !== id)
        setPlantilla(nuevaPlantilla)
        calcularSiguienteHueco(nuevaPlantilla)
    }

    const diasMesActual = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + 1, 0).getDate()
    const primerDiaMes = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth(), 1).getDay()
    const inicioOffset = primerDiaMes === 0 ? 6 : primerDiaMes - 1
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

    const toggleDia = (dia) => {
        const mesFormateado = (fechaCalendario.getMonth() + 1).toString().padStart(2, '0')
        const diaFormateado = dia.toString().padStart(2, '0')
        const fechaString = `${fechaCalendario.getFullYear()}-${mesFormateado}-${diaFormateado}`

        if (diasSeleccionados.includes(fechaString)) {
            setDiasSeleccionados(diasSeleccionados.filter(d => d !== fechaString))
        } else {
            setDiasSeleccionados([...diasSeleccionados, fechaString])
        }
    }

    const cambiarMes = (incremento) => {
        const nuevaFecha = new Date(fechaCalendario)
        nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento)
        setFechaCalendario(nuevaFecha)
    }

    const generarCitas = async () => {
        if (plantilla.length === 0) {
            setMensaje({ texto: 'Añade al menos un hueco a la plantilla.', tipo: 'error' })
            return
        }
        if (diasSeleccionados.length === 0) {
            setMensaje({ texto: 'Selecciona al menos un día en el calendario.', tipo: 'error' })
            return
        }

        setMensaje({ texto: 'Generando citas en bloque...', tipo: 'info' })

        const citasParaSubir = []
        diasSeleccionados.forEach(diaString => {
            plantilla.forEach(hueco => {
                const fechaHora = new Date(`${diaString}T${hueco.hora}`).toISOString()
                citasParaSubir.push({
                    fecha_hora: fechaHora,
                    estado: 'disponible',
                    duracion_minutos: hueco.duracion,
                    tipo: hueco.tipo // Inyectamos el tipo a la BDD
                })
            })
        })

        const { error } = await supabase.from('citas').insert(citasParaSubir)

        if (error) {
            setMensaje({ texto: 'Error al subir las citas múltiples.', tipo: 'error' })
        } else {
            setMensaje({ texto: `¡Se han creado ${citasParaSubir.length} citas correctamente!`, tipo: 'exito' })
            setPlantilla([])
            setDiasSeleccionados([])
            setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000)
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:py-12">
            {mensaje.texto && (
                <div className={`mb-8 p-4 text-center rounded-2xl font-light text-xs tracking-wider uppercase shadow-sm border ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border-red-200' : mensaje.tipo === 'info' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* PARTE 1: PLANTILLA DE HORAS */}
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                    <h3 className="font-inter text-[10px] tracking-widest text-gray uppercase mb-2 px-2">1. Define los huecos del día</h3>

                    <form onSubmit={añadirHueco} className="p-5 md:p-6 bg-surface rounded-3xl border border-darker/10 shadow-sm w-full box-border overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-4 sm:gap-6 sm:items-end w-full">
                            <div className="w-full min-w-0 flex flex-col">
                                <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Inicio</label>
                                <input type="time" value={nuevaHora} onChange={(e) => setNuevaHora(e.target.value)} className="w-full min-w-0 appearance-none py-3 px-2 md:p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent outline-none text-sm transition-all box-border" required />
                            </div>
                            <div className="w-full min-w-0 flex flex-col">
                                <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Min</label>
                                <input type="number" step="5" value={nuevaDuracion} onChange={(e) => setNuevaDuracion(e.target.value)} className="w-full min-w-0 appearance-none py-3 px-2 md:p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent outline-none text-sm transition-all box-border" required />
                            </div>
                            <div className="w-full min-w-0 flex flex-col">
                                <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">Servicio</label>
                                <select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} className="w-full min-w-0 py-3 px-2 md:p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent outline-none text-sm transition-all box-border" required>
                                    <option value="Corte de pelo">Corte de pelo</option>
                                    <option value="Peinado y Styling">Peinado y Styling</option>
                                    <option value="Color y Mechas">Color y Mechas</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full sm:w-auto bg-primary text-surface font-inter text-xs tracking-widest uppercase py-3 md:py-4 px-6 rounded-2xl hover:bg-accent hover:text-primary transition-colors shadow-md box-border">
                                Añadir
                            </button>
                        </div>
                    </form>

                    <div className="space-y-3 mt-2">
                        {plantilla.length === 0 ? (
                            <div className="text-center py-12 bg-surface rounded-3xl border border-darker/10 border-dashed">
                                <p className="font-inter text-sm text-gray font-light">No hay huecos añadidos a la plantilla.</p>
                            </div>
                        ) : (
                            plantilla.map((hueco) => (
                                <div key={hueco.id} className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-darker/10 shadow-sm transition-all hover:border-darker/30">
                                    <div className="flex flex-col">
                                        <span className="font-cormorant text-2xl text-primary">{hueco.hora}</span>
                                        <span className="font-inter text-[10px] tracking-widest text-accent uppercase">{hueco.tipo}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="font-inter text-xs text-gray">{hueco.duracion} min</span>
                                        <button onClick={() => eliminarHueco(hueco.id)} className="font-inter text-[10px] tracking-widest uppercase text-gray hover:text-red-500 transition-colors">Eliminar</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* PARTE 2: CALENDARIO */}
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                    <h3 className="font-inter text-[10px] tracking-widest text-gray uppercase mb-2 px-2">2. Aplícalos al calendario</h3>
                    <div className="bg-surface p-5 md:p-8 rounded-3xl border border-darker/10 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <button onClick={() => cambiarMes(-1)} className="text-gray hover:text-primary p-2 text-xl transition-colors">&larr;</button>
                            <h4 className="font-cormorant text-xl md:text-2xl text-primary uppercase font-medium tracking-wide">
                                {meses[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}
                            </h4>
                            <button onClick={() => cambiarMes(1)} className="text-gray hover:text-primary p-2 text-xl transition-colors">&rarr;</button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                                <div key={d} className="text-center font-inter text-[10px] md:text-xs tracking-widest text-gray uppercase pb-2">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {Array.from({ length: inicioOffset }).map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
                            {Array.from({ length: diasMesActual }).map((_, i) => {
                                const dia = i + 1;
                                const mesStr = (fechaCalendario.getMonth() + 1).toString().padStart(2, '0')
                                const diaStr = dia.toString().padStart(2, '0')
                                const fechaActualStr = `${fechaCalendario.getFullYear()}-${mesStr}-${diaStr}`
                                const seleccionado = diasSeleccionados.includes(fechaActualStr)

                                return (
                                    <button key={dia} onClick={() => toggleDia(dia)} className={`aspect-square flex items-center justify-center rounded-xl font-inter text-xs md:text-sm transition-all ${seleccionado ? 'bg-primary text-surface shadow-md scale-105' : 'bg-background text-primary hover:border hover:border-accent border border-transparent'}`}>
                                        {dia}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 md:mt-12 flex justify-end">
                <button onClick={generarCitas} disabled={plantilla.length === 0 || diasSeleccionados.length === 0} className={`w-full lg:w-auto px-8 md:px-12 py-5 rounded-2xl font-inter text-xs tracking-widest uppercase transition-all shadow-md ${plantilla.length > 0 && diasSeleccionados.length > 0 ? 'bg-accent text-primary hover:bg-primary hover:text-surface cursor-pointer' : 'bg-gray/20 text-gray cursor-not-allowed'}`}>
                    Subir {plantilla.length * diasSeleccionados.length} citas al servidor
                </button>
            </div>
        </div>
    )
}