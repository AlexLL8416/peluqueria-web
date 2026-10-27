import { APP_CONFIG } from './config/tenant'

export default function Privacy() {
    const { privacy } = APP_CONFIG

    return (
        <div className="w-full min-h-screen bg-background flex flex-col font-inter">
            <div className="w-full bg-surface border-b border-darker/10 p-8 shadow-sm text-center relative flex items-center justify-center">
                <a href="/" className="absolute left-8 md:left-12 scale-175 font-inter text-[10px] tracking-widest text-gray hover:text-primary uppercase flex items-center gap-2 transition-colors">
                    &larr; <span className="hidden md:inline">Volver</span>
                </a>
                <div>
                    <span className="font-inter text-[10px] tracking-[0.3em] text-gray uppercase mb-2 block">
                        {APP_CONFIG.site.name}
                    </span>
                    <h1 className="font-cormorant text-4xl text-primary font-normal">
                        Política de <span className="text-accent">privacidad</span>
                    </h1>
                </div>
            </div>

            <div className="w-full max-w-2xl mx-auto flex-1 p-6 md:p-10 space-y-8">
                {privacy.sections.map(({ title, body }) => (
                    <section key={title}>
                        <h2 className="font-cormorant text-2xl text-primary mb-2">{title}</h2>
                        <p className="text-sm text-gray font-light leading-relaxed">{body}</p>
                    </section>
                ))}
                <p className="text-[10px] tracking-widest text-gray uppercase pt-6 border-t border-darker/10">
                    Última actualización: {privacy.updatedAt}
                </p>
            </div>
        </div>
    )
}
