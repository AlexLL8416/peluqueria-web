import APP_CONFIG from './config/tenant.js'

export default function Footer() {
    return (
        <footer className="bg-background pt-24 pb-8 px-8 md:px-24 border-t border-darker/10">
            <div className="max-w-7xl mx-auto flex flex-col justify-between font-inter">

                {/* Parte Superior: Menú principal */}
                <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

                    <div>
                        <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6">Studio</h3>
                        <ul className="space-y-4 text-primary text-lg md:text-base font-light">
                            <li><a href="#studio" className="hover:text-accent transition-colors">Dirección</a></li>
                            <li><a href="#studio" className="hover:text-accent transition-colors">Horario</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6">Servicios</h3>
                        <ul className="space-y-4 text-primary text-lg md:text-base font-light">
                            <li><a href="#services" className="hover:text-accent transition-colors">Cortes</a></li>
                            <li><a href="#services" className="hover:text-accent transition-colors">Afeitado</a></li>
                            <li><a href="/productos" className="hover:text-accent transition-colors">Productos</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6">Nosotros</h3>
                        <ul className="space-y-4 text-primary text-lg md:text-base font-light">
                            <li><a href="#about" className="hover:text-accent transition-colors">Historia</a></li>
                            <li><a href="#about" className="hover:text-accent transition-colors">Contacto</a></li>
                            <li><a href="#gallery" className="hover:text-accent transition-colors">Galería</a></li>
                            <li><a href="#reviews" className="hover:text-accent transition-colors">Reseñas</a></li>
                        </ul>
                    </div>

                    <div className="md:border-l md:border-darker/20 md:pl-12 pt-8 md:pt-0 border-t border-darker/20 md:border-t-0 mt-8 md:mt-0">
                        <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6">Reservar</h3>
                        <a
                            href="/reservar"
                            className="inline-block text-primary hover:text-accent transition-colors font-medium text-lg md:text-base border-b border-primary hover:border-accent pb-1"
                        >
                            Agenda tu cita
                        </a>

                        <h3 className="text-[10px] tracking-widest text-gray uppercase mb-6 mt-12">Cancelar</h3>
                        <a
                            href="/cancelar"
                            className="inline-block text-primary hover:text-accent transition-colors font-medium text-lg md:text-base border-b border-primary hover:border-accent pb-1"
                        >
                            Cancela tu cita
                        </a>
                    </div>
                </div>

                {/* Parte Inferior: Redes sociales y legales */}
                    <div className="mt-12 border-t border-darker/20 pt-8 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <ul className="flex flex-col md:flex-row gap-6 md:gap-12 text-xs tracking-widest text-gray uppercase">
                        <li>
                            <a
                                href={APP_CONFIG.socials.instagram}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-primary transition-colors"
                            >
                                Instagram
                            </a>
                        </li>
                        <li>
                            <a href="/contacto" className="hover:text-primary transition-colors">
                                Contacto
                            </a>
                        </li>
                        <li>
                            <a href="/politica-de-privacidad" className="hover:text-primary transition-colors">
                                Política de privacidad
                            </a>
                        </li>
                        <li>
                            <a href="/cancelar" className="hover:text-primary transition-colors">
                                Cancelar cita
                            </a>
                        </li>
                    </ul>

                    {/* Pequeño copyright (Opcional, pero da un toque muy profesional) */}
                    <span className="text-xs text-gray font-light">
                        {APP_CONFIG.copy.footerText.replace('{year}', new Date().getFullYear())}
                    </span>
                </div>
            </div>
        </footer>
    );
}