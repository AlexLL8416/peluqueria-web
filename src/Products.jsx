import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { VolverInicio } from './ui'
import { APP_CONFIG } from './config/tenant';

// Datos de ejemplo: Sustituye las URLs por las rutas reales de tus imágenes (ej: '/src/assets/cera.jpg')
const listaProductos = [
    {
        id: 1,
        nombre: 'Champú Voluminizador',
        precio: '18.00 €',
        imagen: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Aporta cuerpo y movimiento a cabellos finos, con extractos botánicos que respetan la fibra capilar.'
    },
    {
        id: 2,
        nombre: 'Acondicionador Nutritivo',
        precio: '20.00 €',
        imagen: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Desenreda y nutre intensamente, recuperando suavidad y brillo en cabellos secos o dañados.'
    },
    {
        id: 3,
        nombre: 'Mascarilla Reparadora',
        precio: '25.00 €',
        imagen: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Tratamiento intensivo para recuperar elasticidad, reducir el encrespamiento y aportar un brillo saludable.'
    },
    {
        id: 4,
        nombre: 'Sérum de Brillo',
        precio: '22.00 €',
        imagen: 'https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Fórmula ligera que controla el frizz y aporta un acabado brillante sin engrasar.'
    },
    {
        id: 5,
        nombre: 'Spray Texturizante',
        precio: '16.00 €',
        imagen: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Aporta textura y fijación flexible para peinados con movimiento y volumen natural.'
    }
]

export default function Products() {
    // Estado para controlar qué producto está abierto en la ventana modal
    const [productoSeleccionado, setProductoSeleccionado] = useState(null)
    const dialogo = useRef(null)

    // <dialog> nativo: atrapa el foco y cierra con Escape.
    useEffect(() => {
        if (productoSeleccionado) dialogo.current?.showModal()
    }, [productoSeleccionado])

    const cerrar = () => dialogo.current?.close()

    return (
        <div className="w-full min-h-screen bg-background flex flex-col font-inter">

            {/* CABECERA */}
            <div className="w-full bg-surface border-b border-darker/10 p-6 md:p-8 shadow-sm text-center relative flex items-center justify-center">

                <VolverInicio className="absolute left-3 md:left-10" />

                <div>
                    <span className="font-inter text-[10px] tracking-[0.3em] text-gray uppercase mb-2 block">
                        {APP_CONFIG.site.name}
                    </span>
                    <h1 className="font-cormorant text-3xl md:text-4xl text-primary font-normal">
                        Nuestros <span className="text-accent">Productos</span>
                    </h1>
                </div>
            </div>

            {/* CONTENEDOR DE PRODUCTOS (GRID) */}
            <div className="w-full max-w-6xl mx-auto flex-1 p-6 md:p-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">

                    {listaProductos.map((producto) => (
                        <button
                            type="button"
                            key={producto.id}
                            onClick={() => setProductoSeleccionado(producto)}
                            className="group flex flex-col text-center"
                        >
                            {/* Tarjeta de imagen con efecto escala de grises */}
                            <div className="w-full aspect-[4/5] bg-surface rounded-2xl overflow-hidden mb-4 shadow-sm relative">
                                <img
                                    src={producto.imagen}
                                    alt={producto.nombre}
                                    loading="lazy"
                                    className="w-full h-full object-cover grayscale transition-all duration-700 ease-in-out md:group-hover:grayscale-0 md:group-hover:scale-105"
                                />
                                {/* Overlay sutil para indicar que es clicable en móvil */}
                                <div className="absolute inset-0 bg-darker/0 group-hover:bg-darker/5 transition-colors duration-300"></div>
                            </div>

                            {/* Información del producto */}
                            <div className="text-center flex flex-col gap-1">
                                <h3 className="font-cormorant text-xl text-primary font-normal leading-tight group-hover:text-accent transition-colors">
                                    {producto.nombre}
                                </h3>
                                <p className="font-inter text-xs tracking-widest text-gray uppercase mt-1">
                                    {producto.precio}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* MODAL DE DESCRIPCIÓN (Se muestra solo si hay un producto seleccionado) */}
            <dialog
                ref={dialogo}
                aria-labelledby="producto-titulo"
                onClose={() => setProductoSeleccionado(null)}
                onClick={(e) => e.target === dialogo.current && cerrar()}
                className="m-auto w-full max-w-lg bg-transparent p-4 backdrop:bg-darker/40 backdrop:backdrop-blur-sm"
            >
                {productoSeleccionado && (
                    <div className="relative w-full bg-surface rounded-3xl shadow-xl overflow-hidden flex flex-col animate-fade-in">
                        <button
                            onClick={cerrar}
                            aria-label="Cerrar"
                            className="absolute top-4 right-4 z-10 bg-surface/90 text-primary w-11 h-11 rounded-full flex items-center justify-center hover:bg-primary hover:text-surface transition-colors border border-darker/20"
                        >
                            <X size={18} strokeWidth={1.5} aria-hidden="true" />
                        </button>

                        <div className="w-full h-64 md:h-80 bg-surface relative">
                            <img
                                src={productoSeleccionado.imagen}
                                alt={productoSeleccionado.nombre}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-8 text-center">
                            <h2 id="producto-titulo" className="font-cormorant text-3xl text-primary mb-2">
                                {productoSeleccionado.nombre}
                            </h2>
                            <p className="font-inter text-sm tracking-widest text-accent uppercase font-medium mb-6">
                                {productoSeleccionado.precio}
                            </p>

                            <div className="w-12 h-px bg-darker/20 mx-auto mb-6"></div>

                            <p className="font-inter text-sm text-gray font-light leading-relaxed">
                                {productoSeleccionado.descripcion}
                            </p>

                            <button
                                onClick={cerrar}
                                className="mt-8 w-full border border-darker/20 text-primary font-inter text-xs tracking-widest uppercase py-4 rounded-2xl hover:border-darker hover:bg-background transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </dialog>
        </div>
    )
}