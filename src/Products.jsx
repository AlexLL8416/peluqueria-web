import { useState } from 'react'
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

    return (
        <div className="w-full min-h-screen bg-background flex flex-col font-inter">

            {/* CABECERA */}
            <div className="w-full bg-surface border-b border-darker/10 p-6 md:p-8 shadow-sm text-center relative flex items-center justify-center">

                {/* Botón de volver al inicio */}
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
                    <h1 className="font-cormorant text-3xl md:text-4xl text-primary font-normal">
                        Nuestros <span className="text-accent">Productos</span>
                    </h1>
                </div>
            </div>

            {/* CONTENEDOR DE PRODUCTOS (GRID) */}
            <div className="w-full max-w-6xl mx-auto flex-1 p-6 md:p-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">

                    {listaProductos.map((producto) => (
                        <div
                            key={producto.id}
                            onClick={() => setProductoSeleccionado(producto)}
                            className="group cursor-pointer flex flex-col"
                        >
                            {/* Tarjeta de imagen con efecto escala de grises */}
                            <div className="w-full aspect-[4/5] bg-surface rounded-2xl overflow-hidden mb-4 shadow-sm relative">
                                <img
                                    src={producto.imagen}
                                    alt={producto.nombre}
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
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL DE DESCRIPCIÓN (Se muestra solo si hay un producto seleccionado) */}
            {productoSeleccionado && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-darker/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => setProductoSeleccionado(null)} // Cierra al hacer clic fuera
                >
                    {/* Contenedor principal del modal */}
                    <div
                        className="w-full max-w-lg bg-surface rounded-3xl shadow-xl overflow-hidden flex flex-col transform transition-all"
                        onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro
                    >
                        {/* Botón cerrar flotante */}
                        <button
                            onClick={() => setProductoSeleccionado(null)}
                            className="absolute top-4 right-4 z-10 bg-surface/80 backdrop-blur-md text-primary w-8 h-8 rounded-full flex items-center justify-center hover:bg-darker hover:text-surface transition-colors border border-darker/10"
                        >
                            ✕
                        </button>

                        <div className="w-full h-64 md:h-80 bg-surface relative">
                            <img
                                src={productoSeleccionado.imagen}
                                alt={productoSeleccionado.nombre}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-8 text-center">
                            <h2 className="font-cormorant text-3xl text-primary mb-2">
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
                                onClick={() => setProductoSeleccionado(null)}
                                className="mt-8 w-full border border-darker/20 text-primary font-inter text-xs tracking-widest uppercase py-4 rounded-2xl hover:border-darker hover:bg-background transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}