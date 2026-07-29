import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function Reviews() {
    const reviewsList = [
        {
            name: 'Alejandro L.',
            text: 'El mejor corte que me han hecho en años. El trato es excepcional y el local tiene un ambiente muy relajante. Totalmente recomendado.',
            rating: 5
        },
        {
            name: 'David M.',
            text: 'Profesionalidad en estado puro. Fui a arreglarme la barba y salí encantado con los productos y la atención al detalle.',
            rating: 5
        },
        {
            name: 'Carlos R.',
            text: 'Un espacio único. Se nota la pasión que le ponen a cada detalle, desde que entras hasta que sales con tu nuevo look.',
            rating: 4
        },
        {
            name: 'Javier G.',
            text: 'Muy buen servicio y puntualidad. El masaje capilar que te dan durante el lavado es otro nivel. Muy relajante.',
            rating: 5
        },
        {
            name: 'Miguel A.',
            text: 'Estilo impecable. Supieron entender exactamente lo que buscaba para mi cambio de imagen. 100% recomendable.',
            rating: 5
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Funciones de navegación (bucle infinito)
    const nextReview = () => {
        setCurrentIndex((prev) => (prev === reviewsList.length - 1 ? 0 : prev + 1));
    };

    const prevReview = () => {
        setCurrentIndex((prev) => (prev === 0 ? reviewsList.length - 1 : prev - 1));
    };

    // Autoplay: Cambia cada 10 segundos
    useEffect(() => {
        const timer = setInterval(() => {
            nextReview();
        }, 10000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const extendedReviews = [...reviewsList, reviewsList[0], reviewsList[1]];

    return (
        <section className="bg-scandi-base py-24 md:py-24 px-6 md:px-12 overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col items-center">

                {/* Cabecera */}
                <div className="text-center mb-16">
                    <span className="font-inter text-[10px] tracking-[0.3em] text-scandi-gray uppercase mb-4 block">
                        Reseñas
                    </span>
                    <h2 className="font-cormorant text-5xl md:text-6xl text-scandi-black leading-tight">
                        Lo que dicen <span className="text-scandi-accent">nuestros clientes</span>
                    </h2>
                </div>

                {/* Contenedor principal de la caja blanca */}
                <div className="relative w-full max-w-5xl bg-scandi-white rounded-3xl p-8 md:p-12 shadow-sm border border-scandi-darker/20">

                    <div className="overflow-hidden -mx-4 px-4 pb-4">

                        {/* 
              Inyectamos estilos nativos para garantizar que el cálculo
              funciona perfectamente tanto en móvil (100%) como en ordenador (33.33%)
            */}
                        <style>{`
              .reviews-track {
                transform: translateX(calc(var(--current-index) * -100%));
              }
              @media (min-width: 768px) {
                .reviews-track {
                  transform: translateX(calc(var(--current-index) * -1/3 * 100%));
                }
              }
            `}</style>

                        {/* Pista de deslizamiento (Track) */}
                        <div
                            className="flex transition-transform duration-500 ease-in-out reviews-track"
                            style={{ '--current-index': currentIndex }}
                        >
                            {extendedReviews.map((review, index) => (
                                <div
                                    key={index}
                                    className="w-full md:w-1/3 shrink-0 px-4 flex flex-col h-auto"
                                >
                                    <div className="flex flex-col h-full">
                                        {/* Estrellas */}
                                        <div className="flex gap-1 mb-6">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < review.rating ? "text-scandi-accent fill-scandi-accent" : "text-scandi-darker/30 fill-scandi-darker/30"}
                                                />
                                            ))}
                                        </div>

                                        {/* Texto de la reseña */}
                                        <p className="font-inter text-sm text-scandi-gray font-light leading-relaxed mb-8 grow">
                                            "{review.text}"
                                        </p>

                                        {/* Nombre del cliente */}
                                        <h4 className="font-cormorant text-xl text-scandi-black mt-auto border-t border-scandi-darker/30 pt-4">
                                            {review.name}
                                        </h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controles: Botones y Puntitos de paginación */}
                    <div className="flex items-center justify-between mt-8 md:mt-12 pt-4">

                        <button
                            onClick={prevReview}
                            className="w-10 h-10 rounded-full border border-scandi-darker/50 flex items-center justify-center text-scandi-black hover:bg-scandi-black hover:text-scandi-white transition-colors"
                            aria-label="Reseña anterior"
                        >
                            <ChevronLeft size={20} strokeWidth={1.5} />
                        </button>

                        {/* Puntitos de progreso */}
                        <div className="flex gap-2">
                            {reviewsList.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-2 rounded-full transition-all duration-500 ${currentIndex === index
                                        ? 'w-6 bg-scandi-accent'
                                        : 'w-2 bg-scandi-darker/30 hover:bg-scandi-darker/60'
                                        }`}
                                    aria-label={`Ir a la reseña ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextReview}
                            className="w-10 h-10 rounded-full border border-scandi-darker/50 flex items-center justify-center text-scandi-black hover:bg-scandi-black hover:text-scandi-white transition-colors"
                            aria-label="Reseña siguiente"
                        >
                            <ChevronRight size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}