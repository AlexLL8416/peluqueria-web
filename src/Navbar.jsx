import { useState, useEffect } from 'react'
import { Menu, X, ArrowUp } from 'lucide-react'
import APP_CONFIG from './config/tenant.js'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    return (
        <>
            {/* NAVBAR FLOTANTE */}
            <div className={`fixed top-0 left-0 w-full z-50 flex justify-center transition-all duration-700 transform-gpu ${scrolled || isOpen ? 'p-2' : 'p-4 md:p-6'}`}>
                <div className={`w-full max-w-6xl rounded-2xl md:rounded-full transition-all duration-700 flex items-center justify-between overflow-hidden ${isOpen
                    ? 'bg-transparent px-6 md:px-8 py-3 md:py-4 shadow-none'
                    : scrolled
                        ? 'bg-transparent px-5 py-2 md:py-3'
                        : 'bg-secondary shadow-sm px-6 md:px-8 py-3 md:py-4'
                    }`}>
                    
                    {/* Logo */}
                    <div className={`flex items-center gap-3 cursor-pointer z-50 transition-all duration-700 origin-left ${scrolled || isOpen ? 'scale-75' : 'scale-100'}`}>
                        <img src={APP_CONFIG.site.logo} alt={`${APP_CONFIG.site.name} Logo`} className={`p-2.5 rounded-full object-contain transition-all duration-700 ${scrolled  && !isOpen
                            ? 'w-14 h-14 md:w-16 md:h-16 bg-secondary border-2 border-accent'
                            : 'w-12 h-12 md:w-12 md:h-12 bg-transparent border-transparent'}`} />
                        <div className={`leading-none flex flex-col transition-all duration-700 ${scrolled || isOpen ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="font-cormorant text-xl tracking-widest text-primary uppercase">{APP_CONFIG.copy.heroTitle}</span>
                            <span className="font-inter text-[9px] tracking-[0.3em] text-accent uppercase">{APP_CONFIG.copy.heroSubtitle}</span>
                        </div>
                    </div>

                    {/* Enlaces Desktop */}
                    <nav className={`hidden md:flex gap-12 items-center font-inter text-xs tracking-widest text-primary uppercase z-50 transition-all duration-700 ${isOpen
                        ? 'opacity-0 pointer-events-none invisible'
                        : scrolled
                            ? 'opacity-0 pointer-events-none invisible'
                            : 'opacity-100'
                        }`}>
                        <a href="#studio" className="hover:text-accent transition-colors cursor-pointer">Studio</a>
                        <a href="#services" className="hover:text-accent transition-colors cursor-pointer">Servicios</a>
                        <a href="#about" className="hover:text-accent transition-colors cursor-pointer">Nosotros</a>
                    </nav>

                    {/* Sección Derecha: Botón Reservar + Menú Hamburguesa */}
                    <div className="flex items-center z-50">
                        {/* Contenedor animado del botón Reservar */}
                        <div className={`hidden md:flex items-center overflow-hidden transition-all duration-700 ease-in-out ${scrolled || isOpen ? 'max-w-0 opacity-0' : 'max-w-50 opacity-100'}`}>
                            <a
                                href="/reservar"
                                className={`mr-3 md:mr-6 bg-accent text-surface px-5 py-2.5 rounded-full font-inter text-[10px] tracking-widest uppercase hover:bg-primary hover:shadow-md transition-all duration-700 whitespace-nowrap block ${scrolled || isOpen ? 'translate-x-full' : 'translate-x-0'} `}
                            >
                                Reservar
                            </a>
                        </div>

                        {/* Menú Hamburguesa */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-primary hover:text-accent transition-colors p-1"
                        >
                            {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} className={`w-10 h-10 md:w-12 md:h-12 p-2.5 rounded-full object-contain transition-all duration-700 ${scrolled && !isOpen
                                ? 'bg-secondary border-2 border-accent'
                                : 'bg-transparent border-transparent'}`} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MENÚ DESPLEGABLE (OVERLAY) - Añadido transform-gpu y will-change-transform */}
            <div
                className={`fixed inset-0 bg-background z-40 transition-transform duration-500 ease-in-out transform-gpu will-change-transform ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}
            >
                <div className="h-full w-full flex flex-col justify-between pt-32 px-8 md:px-24 pb-12 overflow-y-auto max-w-7xl mx-auto">

                    {/* Parte Superior: Menú principal */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 font-inter">
                        <div>
                            <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6">Studio</h3>
                            <nav className="flex flex-col space-y-4 text-primary text-lg md:text-base font-light">
                                <a href="#studio" onClick={() => setIsOpen(false)} className="hover:text-accent cursor-pointer transition-colors">Dirección</a>
                                <a href="#studio" onClick={() => setIsOpen(false)} className="hover:text-accent cursor-pointer transition-colors">Horario</a>
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6">Servicios</h3>
                            <nav className="flex flex-col space-y-4 text-primary text-lg md:text-base font-light">
                                <a href="#services" onClick={() => setIsOpen(false)} className="hover:text-accent cursor-pointer transition-colors">Cortes</a>
                                <a href="#services" onClick={() => setIsOpen(false)} className="hover:text-accent cursor-pointer transition-colors">Tratamientos</a>
                                <a href="/productos" onClick={() => setIsOpen(false)} className="hover:text-accent cursor-pointer transition-colors">Productos</a>
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6">Nosotros</h3>
                            <nav className="flex flex-col space-y-4 text-primary text-lg md:text-base font-light">
                                <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-accent cursor-pointer transition-colors">Historia</a>
                                <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-accent cursor-pointer transition-colors">Contacto</a>
                                <a href="#gallery" onClick={() => setIsOpen(false)} className="hover:text-accent cursor-pointer transition-colors">Galería</a>
                                <a href="#reviews" onClick={() => setIsOpen(false)} className="hover:text-accent cursor-pointer transition-colors">Reseñas</a>
                            </nav>
                        </div>

                        <div className="md:border-l md:border-darker md:pl-12 pt-8 md:pt-0 border-t border-darker md:border-t-0 mt-8 md:mt-0">
                            <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6">Reservar</h3>
                            <button className="text-primary hover:text-accent transition-colors font-medium text-lg md:text-base border-b border-primary pb-1" onClick={() => { window.location.href = '/reservar'; setIsOpen(false); }}>
                                Agenda tu cita
                            </button>
                            <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6 mt-12">Cancelar</h3>
                            <button className="text-primary hover:text-accent transition-colors font-medium text-lg md:text-base border-b border-primary pb-1" onClick={() => { window.location.href = '/cancelar'; setIsOpen(false); }}>
                                Cancela tu cita
                            </button>
                        </div>
                    </div>

                    {/* Parte Inferior: Redes sociales */}
                    <div className="mt-16 border-t border-darker pt-8 w-full">
                        <nav className="flex flex-col md:flex-row gap-6 md:gap-12 text-xs tracking-widest text-gray uppercase">
                            <a href={APP_CONFIG.socials.instagram} onClick={() => setIsOpen(false)} className="hover:text-primary cursor-pointer transition-colors">
                                Instagram
                            </a>
                            <a href={APP_CONFIG.contact.phoneHref} onClick={() => setIsOpen(false)} className="hover:text-primary cursor-pointer transition-colors">
                                Contacto
                            </a>
                            <a href="/politica-de-privacidad" onClick={() => setIsOpen(false)} className="hover:text-primary cursor-pointer transition-colors">
                                Política de privacidad
                            </a>
                            <a href="/cancelar" onClick={() => setIsOpen(false)} className="hover:text-primary cursor-pointer transition-colors">
                                Cancelar cita
                            </a>
                        </nav>
                    </div>

                </div>
            </div>

            <button
                onClick={scrollToTop}
                aria-label="Volver arriba"
                className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 p-3 md:p-4 bg-accent text-surface rounded-full shadow-lg hover:bg-primary hover:shadow-xl transition-all duration-500 ease-in-out flex items-center justify-center border-2 border-secondary ${scrolled && !isOpen
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10 pointer-events-none'
                    }`}
            >
                <ArrowUp size={20} strokeWidth={1.5} />
            </button>
        </>
    );
}