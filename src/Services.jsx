import { ArrowRight } from 'lucide-react';
import APP_CONFIG from './config/tenant.js'

export default function Services() {
    return (
        <section className="bg-background py-24 md:py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 relative">

                {/* Columna Izquierda: Título y texto (Sticky en desktop) */}
                    <div className="lg:w-1/3 lg:pr-8">
                    <div className="sticky top-40">

                        <h2 className="font-cormorant text-5xl md:text-6xl text-primary leading-tight mb-6">
                            Cuidado <br className="hidden lg:block" />
                            <span className="italic text-accent">completo</span>
                        </h2>

                        <p className="font-inter text-sm text-gray font-light mb-10 leading-relaxed">
                            En {APP_CONFIG.site.name} no solo cuidamos tu imagen con técnicas clásicas, también seleccionamos los mejores productos para que mantengas tu estilo en casa.
                        </p>

                            <a
                            href="/productos"
                            className="inline-flex items-center gap-3 font-inter text-xs tracking-widest uppercase text-primary hover:text-accent transition-colors pb-1 border-b border-primary hover:border-accent"
                        >
                            Ver todos los productos <ArrowRight size={14} />
                        </a>
                    </div>
                </div>

                {/* Columna Derecha: Bloque de Servicios arriba y Productos abajo */}
                <div className="lg:w-2/3 flex flex-col gap-16 mt-8 lg:mt-0">

                    {/* BLOQUE SUPERIOR: Servicios (Ahora sin aspecto de tarjeta) */}
                    <div>
                        <h3 className="font-inter text-xs tracking-widest text-primary uppercase mb-2 border-b border-darker pb-4">
                            Nuestros Servicios
                        </h3>

                        <ul className="divide-y divide-darker/40">
                            {APP_CONFIG.menu.map((service) => (
                                <li key={service.name}>
                                    <a
                                        href={`/reservar?servicio=${encodeURIComponent(service.reserva)}`}
                                        className="group flex items-baseline gap-4 py-5 md:py-6"
                                    >
                                        <span className="font-cormorant text-2xl md:text-3xl text-primary group-hover:text-accent transition-colors duration-300">
                                            {service.name}
                                        </span>
                                        <span aria-hidden="true" className="flex-1 min-w-6 border-b border-dotted border-darker" />
                                        <span className="font-inter text-base text-primary tabular-nums">{service.price}</span>
                                        <span className="inline-flex items-center gap-1.5 font-inter text-[10px] tracking-widest uppercase text-gray group-hover:text-primary transition-colors">
                                            <span className="hidden sm:inline">Reservar</span>
                                            <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
                                            <span className="sr-only sm:hidden">Reservar {service.name}</span>
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* BLOQUE INFERIOR: Productos (Mantenemos las tarjetas porque SÍ se pueden pulsar) */}
                    <div className="mt-8">
                        <h3 className="font-inter text-xs tracking-widest text-primary uppercase mb-8 border-b border-darker pb-4">
                            Selección de Productos
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {APP_CONFIG.featuredProducts.map((product) => (
                                <a
                                    key={product.name}
                                    href="/productos"
                                    className="group bg-surface border border-darker/30 hover:border-accent p-6 rounded-2xl flex flex-col h-full shadow-sm transition-colors duration-300"
                                >
                                    <div className="flex justify-between items-start mb-4 gap-3">
                                        <h4 className="min-w-0 font-cormorant text-2xl leading-tight text-primary group-hover:text-accent transition-colors duration-300">
                                            {product.name}
                                        </h4>
                                        <span className="shrink-0 font-inter text-sm text-gray font-medium tabular-nums mt-1">
                                            {product.price}
                                        </span>
                                    </div>

                                    <p className="font-inter text-sm text-gray font-light mb-6">
                                        {product.description}
                                    </p>

                                    <div className="mt-auto flex justify-end">
                                        <ArrowRight
                                            className="text-accent opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                                            strokeWidth={1.5}
                                            size={20}
                                        />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}