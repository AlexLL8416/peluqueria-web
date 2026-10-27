import { ArrowLeft } from 'lucide-react'

const ESTILOS_AVISO = {
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-amber-50 text-amber-900 border-amber-200',
    exito: 'bg-emerald-50 text-emerald-900 border-emerald-200'
}

// Banner de estado de las páginas públicas (reservar, cancelar).
export function Aviso({ mensaje }) {
    if (!mensaje.texto) return null
    return (
        <div
            role={mensaje.tipo === 'error' ? 'alert' : 'status'}
            className={`mb-8 px-5 py-4 rounded-2xl border font-inter text-sm leading-relaxed text-center ${ESTILOS_AVISO[mensaje.tipo] || ESTILOS_AVISO.exito}`}
        >
            {mensaje.texto}
        </div>
    )
}

export function VolverInicio({ className = '' }) {
    return (
        <a
            href="/"
            aria-label="Volver al inicio"
            className={`inline-flex items-center justify-center gap-2 min-w-11 min-h-11 font-inter text-[11px] tracking-widest text-gray hover:text-primary uppercase transition-colors ${className}`}
        >
            <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
            <span className="hidden md:inline">Volver</span>
        </a>
    )
}
