import { ArrowRight, Scissors, Brush, Sparkles } from 'lucide-react';

export default function Services() {
    // Aumentamos un poco el tamaño del icono (size={32}) al quitarle el fondo circular
    const servicesList = [
        {
            name: 'Corte de Pelo',
            price: '20€',
            icon: <Scissors className="text-scandi-accent" strokeWidth={1} size={32} />
        },
        {
            name: 'Arreglo de Barba',
            price: '15€',
            icon: <Brush className="text-scandi-accent" strokeWidth={1} size={32} />
        },
        {
            name: 'Servicio Completo',
            price: '30€',
            icon: <Sparkles className="text-scandi-accent" strokeWidth={1} size={32} />
        }
    ];

    const productsList = [
        {
            name: 'Cera Mate Texturizadora',
            price: '15€',
            description: 'Fijación media con acabado natural. Ideal para cabellos finos.'
        },
        {
            name: 'Aceite para Barba',
            price: '20€',
            description: 'Hidratación profunda con aceites naturales.'
        },
        {
            name: 'Champú Purificante',
            price: '16€',
            description: 'Para uso diario que limpia en profundidad.'
        }
    ];

    return (
        <section className="bg-scandi-light py-24 md:py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 relative">

                {/* Columna Izquierda: Título y texto (Sticky en desktop) */}
                <div className="lg:w-1/3 lg:pr-8">
                    <div className="sticky top-40">
                        <span className="font-inter text-[10px] tracking-[0.3em] text-scandi-gray uppercase mb-4 block">
                            Servicios y Productos
                        </span>

                        <h2 className="font-cormorant text-5xl md:text-6xl text-scandi-black leading-tight mb-6">
                            Cuidado <br className="hidden lg:block" />
                            <span className="italic text-scandi-accent">completo</span>
                        </h2>

                        <p className="font-inter text-sm text-scandi-gray font-light mb-10 leading-relaxed">
                            En Romero Studio no solo cuidamos tu imagen con técnicas clásicas, también seleccionamos los mejores productos para que mantengas tu estilo en casa.
                        </p>

                        <a
                            href="/productos"
                            className="inline-flex items-center gap-3 font-inter text-xs tracking-widest uppercase text-scandi-black hover:text-scandi-accent transition-colors pb-1 border-b border-scandi-black hover:border-scandi-accent"
                        >
                            Ver todos los productos <ArrowRight size={14} />
                        </a>
                    </div>
                </div>

                {/* Columna Derecha: Bloque de Servicios arriba y Productos abajo */}
                <div className="lg:w-2/3 flex flex-col gap-16 mt-8 lg:mt-0">

                    {/* BLOQUE SUPERIOR: Servicios (Ahora sin aspecto de tarjeta) */}
                    <div>
                        <h3 className="font-inter text-xs tracking-widest text-scandi-black uppercase mb-10 border-b border-scandi-darker pb-4">
                            Nuestros Servicios
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-15 md:gap-6 pt-3">
                            {servicesList.map((service, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center text-center h-full"
                                >
                                    <div className="mb-5">
                                        {service.icon}
                                    </div>
                                    <h4 className="font-cormorant text-2xl text-scandi-black mb-3">
                                        {service.name}
                                    </h4>
                                    <span className="font-inter text-lg text-scandi-gray font-medium mt-auto">
                                        {service.price}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BLOQUE INFERIOR: Productos (Mantenemos las tarjetas porque SÍ se pueden pulsar) */}
                    <div className="mt-8">
                        <h3 className="font-inter text-xs tracking-widest text-scandi-black uppercase mb-8 border-b border-scandi-darker pb-4">
                            Selección de Productos
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {productsList.map((product, index) => (
                                <div
                                    key={index}
                                    className="group bg-scandi-white border border-scandi-darker/30 hover:border-scandi-accent p-6 rounded-2xl flex flex-col h-full shadow-sm cursor-pointer transition-all duration-300"
                                >
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <h4 className="font-cormorant text-2xl text-scandi-black group-hover:text-scandi-accent transition-colors duration-300">
                                            {product.name}
                                        </h4>
                                        <span className="font-inter text-sm text-scandi-gray font-medium mt-1">
                                            {product.price}
                                        </span>
                                    </div>

                                    <p className="font-inter text-sm text-scandi-gray font-light mb-6">
                                        {product.description}
                                    </p>

                                    <div className="mt-auto flex justify-end">
                                        <ArrowRight
                                            className="text-scandi-accent opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                                            strokeWidth={1.5}
                                            size={20}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}