import { ArrowRight } from 'lucide-react';

export default function Gallery() {
    // Array con las imágenes de los cortes. 
    // Sustituye las URLs por las rutas de tus imágenes (ej: '/images/corte-1.jpg')
    const galleryImages = [
        {
            url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1974&auto=format&fit=crop",
            alt: "Corte clásico texturizado"
        },
        {
            url: "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=1974&auto=format&fit=crop",
            alt: "Detalle de arreglo de barba"
        },
        {
            url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1974&auto=format&fit=crop",
            alt: "Corte degradado o fade"
        },
        {
            url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop",
            alt: "Ritual de toalla caliente y afeitado"
        },
        {
            url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1974&auto=format&fit=crop",
            alt: "Perfilado y tijera"
        },
        {
            url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1974&auto=format&fit=crop",
            alt: "Herramientas de barbería y acabado final"
        }
    ];

    return (
        // Usamos blanco de fondo para limpiar la vista después del dorado de la sección About
        <section className="bg-scandi-white py-24 md:py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col">

                {/* Cabecera de la Galería */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <span className="font-inter text-[10px] tracking-[0.3em] text-scandi-gray uppercase mb-4 block">
                            Galería
                        </span>
                        <h2 className="font-cormorant text-5xl md:text-6xl text-scandi-black leading-tight">
                            Nuestro <span className="text-scandi-accent">trabajo</span>
                        </h2>
                    </div>

                    <a
                        href="https://instagram.com/romebarber14"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-3 font-inter text-xs tracking-widest uppercase text-scandi-gray hover:text-scandi-black transition-colors pb-1 border-b border-transparent hover:border-scandi-black"
                    >
                        Ver más en Instagram <ArrowRight size={14} />
                    </a>
                </div>

                {/* Cuadrícula de Imágenes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {galleryImages.map((image, index) => (
                        // Contenedor de la imagen con 'group' para controlar el hover
                        <div
                            key={index}
                            className="group aspect-4/5 overflow-hidden rounded-2xl bg-scandi-light cursor-pointer"
                        >
                            <img
                                src={image.url}
                                alt={image.alt}
                                className="w-full h-full object-cover md:grayscale md:opacity-90 transition-all duration-700 ease-in-out group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                            />
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}