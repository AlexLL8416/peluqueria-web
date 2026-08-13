import { useState } from 'react'
import { supabase } from './supabase'
import APP_CONFIG from './config/tenant.js'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorAuth, setErrorAuth] = useState('')

    const iniciarSesion = async (e) => {
        e.preventDefault()
        setErrorAuth('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setErrorAuth('Credenciales incorrectas.')
    }

    return (
        <div className="w-full min-h-screen bg-background flex flex-col justify-center items-center p-6 font-inter relative">

            {/* Botón opcional para volver a la web principal si alguien entra por error */}
            <a
                href="/"
                className="absolute top-8 left-6 md:left-12 font-inter text-[10px] tracking-widest text-gray hover:text-primary uppercase flex items-center gap-2 transition-colors"
            >
                &larr; <span className="hidden md:inline">Volver a la web</span>
            </a>

            <div className="w-full max-w-md bg-surface p-8 md:p-10 rounded-3xl shadow-sm border border-darker/10">

                <div className="text-center mb-8">
                    <span className="font-inter text-[10px] tracking-[0.3em] text-gray uppercase mb-2 block">
                        {APP_CONFIG.site.name}
                    </span>
                    <h2 className="font-cormorant text-4xl text-primary font-normal">
                        Acceso <span className="text-accent">Admin</span>
                    </h2>
                </div>

                {errorAuth && (
                    <div className="mb-8 p-4 text-center rounded-2xl font-light text-xs tracking-wider uppercase shadow-sm border bg-red-50 text-red-700 border-red-200">
                        {errorAuth}
                    </div>
                )}

                <form onSubmit={iniciarSesion} className="space-y-6">
                    <div>
                        <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">
                            Correo
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.studio"
                            className="w-full p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all font-light text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-inter text-[10px] tracking-widest text-gray uppercase mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-4 border border-darker/20 rounded-2xl bg-background/50 focus:bg-surface focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all font-light text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-surface font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl hover:bg-accent hover:text-primary transition-colors shadow-md mt-4"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    )
}