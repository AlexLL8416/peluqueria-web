import { MapPin, Clock } from 'lucide-react';
import APP_CONFIG from './config/tenant.js'

export default function Studio() {
    return (
        <section className="bg-secondary py-15 md:py-15 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 md:gap-24 items-center">

                {/* Columna Izquierda: Información Principal y Horario */}
                <div className="lg:w-1/2 flex flex-col w-full">
                    <span className="font-inter text-[10px] tracking-[0.3em] text-gray uppercase mb-4 block">
                        Nuestro Espacio
                    </span>

                    <h2 className="font-cormorant text-5xl md:text-6xl text-primary leading-tight mb-12">
                        Donde cuidamos de ti
                    </h2>

                    {/* Bloque Horario (Se queda solo en la izquierda) */}
                    <div className="flex items-start gap-4">
                        <Clock className="text-accent mt-1 shrink-0" strokeWidth={1.5} size={24} />
                        <div className="w-full max-w-xs">
                            <h3 className="font-inter text-xs tracking-widest text-primary uppercase mb-4">Horario</h3>
                            <ul className="font-inter text-gray font-light space-y-3 w-full">
                                <li className="flex justify-between border-b border-darker pb-2">
                                    <span>Lunes - Viernes</span>
                                    <span className="text-primary font-medium">10:00 - 20:00</span>
                                </li>
                                <li className="flex justify-between border-b border-darker pb-2">
                                    <span>Sábados</span>
                                    <span className="text-primary font-medium">09:30 - 14:00</span>
                                </li>
                                <li className="flex justify-between text-gray/50 pb-2">
                                    <span>Domingos</span>
                                    <span>Cerrado</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Mapa y Dirección */}
                <div className="lg:w-1/2 w-full flex flex-col gap-8">

                    {/* Mapa */}
                    <div className="w-full h-[250px] md:h-[350px] rounded-2xl overflow-hidden shadow-sm relative bg-secondary">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3169.8787720919176!2d-5.99629168434464!3d37.38792044238515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd126c0de49b2549%3A0x6b09cf9f5d3761!2sSeville%2C%20Spain!5e0!3m2!1sen!2ses!4v1620000000000!5m2!1sen!2ses"
                            width="100%"
                            height="100%"
                            style={{
                                border: 0,
                                filter: 'contrast(95%) opacity(90%)'
                            }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Ubicación ${APP_CONFIG.site.name}`}
                        ></iframe>
                    </div>

                    {/* Bloque Dirección (Movido debajo del mapa) */}
                    <div className="flex items-start gap-4 md:px-2">
                        <MapPin className="text-accent mt-1 shrink-0" strokeWidth={1.5} size={24} />
                        <div>
                            <h3 className="font-inter text-xs tracking-widest text-primary uppercase mb-3">Dirección</h3>
                            <p className="font-inter text-gray font-light leading-relaxed">
                                {APP_CONFIG.contact.address}<br />
                                41092 Sevilla
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}