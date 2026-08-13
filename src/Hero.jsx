import APP_CONFIG from './config/tenant.js';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden pt-20 pb-12 md:pt-30 md:pb-12">

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center z-10">
  
        <div className="flex flex-col items-center md:items-start text-center md:text-left mt-10 md:mt-0">

          <span className="font-inter text-[10px] tracking-[0.3em] text-gray uppercase mb-6 block">
            Cuidando el detalle
          </span>

          <h1 className="font-cormorant text-6xl md:text-7xl lg:text-8xl text-primary leading-[1.1] mb-8">
            {APP_CONFIG.copy.heroTitle} <br /> <span className="bold text-accent">{APP_CONFIG.copy.heroSubtitle}</span>
          </h1>

          <p className="font-inter text-sm md:text-base text-gray max-w-md mb-10 font-light leading-relaxed">
            Descubre una experiencia de cuidado personal donde la precisión técnica se encuentra con la elegancia. Un espacio diseñado para ti.
          </p>

          <a
            href="/reservar"
            className="bg-primary text-surface px-8 py-4 rounded-full font-inter text-xs tracking-widest uppercase hover:bg-accent hover:shadow-lg transition-all duration-500 inline-block"
          >
            {APP_CONFIG.copy.heroTagline}
          </a>

        </div>

        <div className="relative w-full h-[55vh] md:h-[80vh] rounded-4xl overflow-hidden shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=1000&auto=format&fit=crop"
            alt="Interior de Ejemplo Peluquería"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
        </div>

      </div>

    </section>
  );
}