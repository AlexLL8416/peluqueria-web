import { useState } from 'react'
import { supabase } from './supabase'

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
        <div className="w-full min-h-screen bg-scandi-light flex flex-col justify-center items-center p-6 font-inter relative">

            {/* Botón opcional para volver a la web principal si alguien entra por error */}
            <a
                href="/"
                className="absolute top-8 left-6 md:left-12 font-inter text-[10px] tracking-widest text-scandi-gray hover:text-scandi-black uppercase flex items-center gap-2 transition-colors"
            >
                &larr; <span className="hidden md:inline">Volver a la web</span>
            </a>

            <div className="w-full max-w-md bg-scandi-white p-8 md:p-10 rounded-3xl shadow-sm border border-scandi-darker/10">

                <div className="text-center mb-8">
                    <span className="font-inter text-[10px] tracking-[0.3em] text-scandi-gray uppercase mb-2 block">
                        Romero Studio
                    </span>
                    <h2 className="font-cormorant text-4xl text-scandi-black font-normal">
                        Acceso <span className="text-scandi-accent">Admin</span>
                    </h2>
                </div>

                {errorAuth && (
                    <div className="mb-8 p-4 text-center rounded-2xl font-light text-xs tracking-wider uppercase shadow-sm border bg-red-50 text-red-700 border-red-200">
                        {errorAuth}
                    </div>
                )}

                <form onSubmit={iniciarSesion} className="space-y-6">
                    <div>
                        <label className="block font-inter text-[10px] tracking-widest text-scandi-gray uppercase mb-2">
                            Correo
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@romerostudio.com"
                            className="w-full p-4 border border-scandi-darker/20 rounded-2xl bg-scandi-light/50 focus:bg-scandi-white focus:ring-1 focus:ring-scandi-accent focus:border-scandi-accent outline-none transition-all font-light text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-inter text-[10px] tracking-widest text-scandi-gray uppercase mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-4 border border-scandi-darker/20 rounded-2xl bg-scandi-light/50 focus:bg-scandi-white focus:ring-1 focus:ring-scandi-accent focus:border-scandi-accent outline-none transition-all font-light text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-scandi-black text-scandi-white font-inter text-xs tracking-widest uppercase py-4 px-6 rounded-2xl hover:bg-scandi-accent hover:text-scandi-black transition-colors shadow-md mt-4"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    )
}