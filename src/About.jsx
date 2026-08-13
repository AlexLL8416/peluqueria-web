import { Phone } from 'lucide-react';
import APP_CONFIG from './config/tenant.js'

export default function About() {
    return (
        <section className="bg-accent py-24 md:py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 items-center">

                {/* Columna Izquierda: Foto del peluquero */}
                <div className="w-full md:w-1/2">
                    <div className="aspect-3/4 md:aspect-4/5 rounded-2rem overflow-hidden shadow-xl relative">
                        <img
                            // Aquí debes poner la ruta de tu foto real, por ejemplo: "/images/retrato.jpg"
                            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1974&auto=format&fit=crop"
                            alt="Retrato del fundador"
                            className="w-full h-full object-cover md:grayscale rounded-2xl opacity-90 hover:md:grayscale-0 hover:opacity-100 transition-all duration-700"
                        />
                    </div>
                </div>

                {/* Columna Derecha: Presentación y Contacto */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <span className="font-inter text-[10px] tracking-[0.3em] text-primary/70 uppercase mb-4 block">
                        Sobre Nosotros
                    </span>

                    <h2 className="font-cormorant text-5xl md:text-6xl text-primary leading-tight mb-8">
                        El arte detrás <br /> del detalle
                    </h2>

                    <p className="font-inter text-base text-primary/80 font-light mb-6 leading-relaxed max-w-lg">
                        {APP_CONFIG.copy.aboutIntro}
                    </p>

                    <p className="font-inter text-base text-primary/80 font-light mb-12 leading-relaxed max-w-lg">
                        Más que un simple servicio, mi objetivo es ofrecerte un momento de pausa, confianza y desconexión total en tu día a día.
                    </p>

                    {/* Bloque de Contacto y Redes */}
                    <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 border-t border-darker/20 pt-8 mt-auto">

                        {/* Teléfono */}
                        <a
                            href={APP_CONFIG.contact.phoneHref}
                            className="group flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:text-surface transition-colors duration-300">
                                <Phone strokeWidth={1.5} size={20} />
                            </div>
                            <div>
                                <span className="block font-inter text-[10px] tracking-widest text-primary/70 uppercase mb-1">
                                    Contacto
                                </span>
                                <span className="font-inter text-lg text-primary font-medium">
                                    {APP_CONFIG.contact.phone}
                                </span>
                            </div>
                        </a>

                        {/* Instagram */}
                        <a
                            href={APP_CONFIG.socials.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:text-accent transition-colors duration-300">
                                <img
                                    src="https://static.vecteezy.com/system/resources/thumbnails/065/386/519/small/instagram-letter-white-logo-icon-ig-app-transparent-background-premium-social-media-design-for-digital-download-free-png.png"
                                    alt="Logo de Instagram"
                                    className="w-5 h-5 object-contain invert group-hover:invert-0 transition-all duration-300"
                                />
                            </div>
                            <div>
                                <span className="block font-inter text-[10px] tracking-widest text-primary/70 uppercase mb-1">
                                    Síguenos
                                </span>
                                <span className="font-inter text-lg text-primary font-medium">
                                    {APP_CONFIG.socials.instagram.split('/').pop()}
                                </span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}