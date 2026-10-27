// Utilidades compartidas. La validación aquí es solo para dar feedback
// inmediato: las reglas de verdad se aplican en el servidor (reservar_cita).

const ZONA = 'Europe/Madrid'

// Mismo criterio que public.normalizar_telefono() en la base de datos.
export const normalizarTelefono = (telefono) => {
    let digitos = (telefono || '').replace(/\D/g, '')
    if (digitos.length === 11 && digitos.startsWith('34')) digitos = digitos.slice(2)
    return digitos
}

export const telefonoValido = (telefono) => /^\d{9}$/.test(normalizarTelefono(telefono))

export const nombreValido = (nombre) => {
    const limpio = (nombre || '').trim().replace(/\s+/g, ' ')
    return limpio.length >= 2 && limpio.length <= 60 && /^\p{L}+([ '.-]\p{L}+)*$/u.test(limpio)
}

export const horaMadrid = (fecha) =>
    new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: ZONA })

// Día en formato YYYY-MM-DD según la hora de Madrid.
export const diaMadrid = (fecha) => new Date(fecha).toLocaleDateString('sv-SE', { timeZone: ZONA })

// Milisegundos que Madrid va por delante de UTC en ese instante (1 h o 2 h).
const desfaseMadrid = (instante) => {
    const local = instante.toLocaleString('sv-SE', { timeZone: ZONA }).replace(' ', 'T')
    return new Date(`${local}Z`) - instante
}

// "2026-11-03" + "10:30" (hora de Madrid) -> ISO en UTC, sin depender de la zona del navegador.
export const madridAISO = (dia, hora = '00:00') => {
    const comoUTC = new Date(`${dia}T${hora}:00Z`)
    return new Date(comoUTC - desfaseMadrid(comoUTC)).toISOString()
}

// Límites [inicio, fin) de un día de Madrid, para filtrar por fecha_hora.
export const rangoDiaMadrid = (dia) => [madridAISO(dia), madridAISO(sumarDias(dia, 1))]

export const sumarDias = (dia, dias) => {
    const d = new Date(`${dia}T12:00:00Z`)
    d.setUTCDate(d.getUTCDate() + dias)
    return d.toISOString().slice(0, 10)
}

export const hoyMadrid = () => diaMadrid(new Date())

export const fechaCortaMadrid = (fecha) =>
    new Date(fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: ZONA }).toUpperCase()

const textoICS = (texto) => texto.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
const fechaICS = (fecha) => new Date(fecha).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

// Descarga un .ics para que el cliente añada la cita a su calendario.
export const descargarICS = ({ inicio, minutos, titulo, descripcion = '', lugar = '' }) => {
    const fin = new Date(new Date(inicio).getTime() + minutos * 60000)
    const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Reservas//ES', 'BEGIN:VEVENT',
        `UID:${crypto.randomUUID()}`, `DTSTAMP:${fechaICS(new Date())}`,
        `DTSTART:${fechaICS(inicio)}`, `DTEND:${fechaICS(fin)}`,
        `SUMMARY:${textoICS(titulo)}`, `DESCRIPTION:${textoICS(descripcion)}`, `LOCATION:${textoICS(lugar)}`,
        'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
    const enlace = Object.assign(document.createElement('a'), { href: url, download: 'cita.ics' })
    enlace.click()
    URL.revokeObjectURL(url)
}
