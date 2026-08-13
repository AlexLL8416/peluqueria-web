import { ArrowRight } from 'lucide-react';
import { APP_CONFIG } from './config/tenant';

export default function Gallery() {
    // Array con las imágenes de los cortes. 
    // Sustituye las URLs por las rutas de tus imágenes (ej: '/images/corte-1.jpg')
    const galleryImages = [
        {
            url: "https://images.unsplash.com/photo-1554519934-e32b1629d9ee?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            alt: "Corte y ondas"
        },
        {
            url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
            alt: "Peinado y color"
        },
        {
            url: "https://images.unsplash.com/photo-1617391654484-2894196c2cc9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=800&q=80",
            alt: "Tratamiento capilar"
        },
        {
            url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80",
            alt: "Tijeras en acción"
        },
        {
            url: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80",
            alt: "Aplicación de tinte"
        },
        {
            url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
            alt: "Peinado de evento"
        }
    ];

    return (
        // Usamos blanco de fondo para limpiar la vista después del dorado de la sección About
        <section className="bg-surface py-24 md:py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col">

                {/* Cabecera de la Galería */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <span className="font-inter text-[10px] tracking-[0.3em] text-gray uppercase mb-4 block">
                            Galería
                        </span>
                        <h2 className="font-cormorant text-5xl md:text-6xl text-primary leading-tight">
                            Nuestro <span className="text-accent">trabajo</span>
                        </h2>
                    </div>

                    <a
                        href={APP_CONFIG.socials.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-3 font-inter text-xs tracking-widest uppercase text-gray hover:text-primary transition-colors pb-1 border-b border-transparent hover:border-primary"
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
                            className="group aspect-4/5 overflow-hidden rounded-2xl bg-background cursor-pointer"
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