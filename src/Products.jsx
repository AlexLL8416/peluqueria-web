import { useState } from 'react'

// Datos de ejemplo: Sustituye las URLs por las rutas reales de tus imágenes (ej: '/src/assets/cera.jpg')
const listaProductos = [
    {
        id: 1,
        nombre: 'Cera de Fijación Mate',
        precio: '18.00 €',
        imagen: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Cera de arcilla con acabado mate y fijación fuerte. Ideal para dar textura y volumen sin apelmazar el cabello. Se elimina fácilmente con agua.'
    },
    {
        id: 2,
        nombre: 'Aceite Esencial para Barba',
        precio: '22.50 €',
        imagen: 'https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Fórmula nutritiva enriquecida con aceite de argán y jojoba. Hidrata la piel debajo del vello, suaviza la barba y deja un ligero aroma a madera de cedro.'
    },
    {
        id: 3,
        nombre: 'Champú Fortificante',
        precio: '15.00 €',
        imagen: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Champú de uso diario libre de sulfatos y parabenos. Formulado con extractos naturales para fortalecer el folículo y limpiar el cuero cabelludo en profundidad.'
    },
    {
        id: 4,
        nombre: 'Polvos Texturizadores',
        precio: '16.00 €',
        imagen: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Polvo ultraligero que aporta un volumen extremo desde la raíz y un acabado 100% mate. Perfecto para cortes desordenados o cabellos finos.'
    },
    {
        id: 5,
        nombre: 'Gomina',
        precio: '10.00 €',
        imagen: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop',
        descripcion: 'Descripción de prueba'
    }
]

export default function Products() {
    // Estado para controlar qué producto está abierto en la ventana modal
    const [productoSeleccionado, setProductoSeleccionado] = useState(null)

    return (
        <div className="w-full min-h-screen bg-scandi-light flex flex-col font-inter">
            
            {/* CABECERA */}
            <div className="w-full bg-scandi-white border-b border-scandi-darker/10 p-6 md:p-8 shadow-sm text-center relative flex items-center justify-center">
                
                {/* Botón de volver al inicio */}
                <a 
                    href="/" 
                    className="absolute left-6 md:left-12 font-inter text-[10px] tracking-widest text-scandi-gray hover:text-scandi-black uppercase flex items-center gap-2 transition-colors z-10"
                >
                    &larr; <span className="hidden md:inline">Volver al inicio</span>
                </a>

                <div>
                    <span className="font-inter text-[10px] tracking-[0.3em] text-scandi-gray uppercase mb-2 block">
                        Romero Studio
                    </span>
                    <h1 className="font-cormorant text-3xl md:text-4xl text-scandi-black font-normal">
                        Nuestros <span className="text-scandi-accent">Productos</span>
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
                            <div className="w-full aspect-[4/5] bg-scandi-base rounded-2xl overflow-hidden mb-4 shadow-sm relative">
                                <img 
                                    src={producto.imagen} 
                                    alt={producto.nombre} 
                                    className="w-full h-full object-cover grayscale transition-all duration-700 ease-in-out md:group-hover:grayscale-0 md:group-hover:scale-105"
                                />
                                {/* Overlay sutil para indicar que es clicable en móvil */}
                                <div className="absolute inset-0 bg-scandi-black/0 group-hover:bg-scandi-black/5 transition-colors duration-300"></div>
                            </div>

                            {/* Información del producto */}
                            <div className="text-center flex flex-col gap-1">
                                <h3 className="font-cormorant text-xl text-scandi-black font-normal leading-tight group-hover:text-scandi-accent transition-colors">
                                    {producto.nombre}
                                </h3>
                                <p className="font-inter text-xs tracking-widest text-scandi-gray uppercase mt-1">
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
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-scandi-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => setProductoSeleccionado(null)} // Cierra al hacer clic fuera
                >
                    {/* Contenedor principal del modal */}
                    <div 
                        className="w-full max-w-lg bg-scandi-white rounded-3xl shadow-xl overflow-hidden flex flex-col transform transition-all"
                        onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro
                    >
                        {/* Botón cerrar flotante */}
                        <button 
                            onClick={() => setProductoSeleccionado(null)}
                            className="absolute top-4 right-4 z-10 bg-scandi-white/80 backdrop-blur-md text-scandi-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-scandi-black hover:text-scandi-white transition-colors border border-scandi-darker/10"
                        >
                            ✕
                        </button>

                        <div className="w-full h-64 md:h-80 bg-scandi-base relative">
                            <img 
                                src={productoSeleccionado.imagen} 
                                alt={productoSeleccionado.nombre} 
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-8 text-center">
                            <h2 className="font-cormorant text-3xl text-scandi-black mb-2">
                                {productoSeleccionado.nombre}
                            </h2>
                            <p className="font-inter text-sm tracking-widest text-scandi-accent uppercase font-medium mb-6">
                                {productoSeleccionado.precio}
                            </p>
                            
                            <div className="w-12 h-px bg-scandi-darker/20 mx-auto mb-6"></div>
                            
                            <p className="font-inter text-sm text-scandi-gray font-light leading-relaxed">
                                {productoSeleccionado.descripcion}
                            </p>

                            <button 
                                onClick={() => setProductoSeleccionado(null)}
                                className="mt-8 w-full border border-scandi-darker/20 text-scandi-black font-inter text-xs tracking-widest uppercase py-4 rounded-2xl hover:border-scandi-black hover:bg-scandi-light transition-all"
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