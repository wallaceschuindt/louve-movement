'use client';

import { useState } from 'react';
import { useLouveStore } from '@/store/louve-store';
import { Crown, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export function LoginScreen() {
  const { login, settings } = useLouveStore();
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 overflow-hidden bg-amber-500">
            {settings.brandLogo ? (
              <img src={settings.brandLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Image src="/logo.jpeg" alt="Logo" width={80} height={80} className="object-cover w-full h-full" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{settings.brandName}</h1>
          <p className="text-slate-400 text-xs mt-1">{settings.brandSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail de Acesso</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                defaultValue="admin@louvemovement.com"
                required
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Senha</label>
              <button type="button" className="text-xs text-amber-400 hover:underline">
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                defaultValue="123456"
                required
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-white text-sm focus:outline-none focus:border-amber-500 transition"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition duration-200 text-sm cursor-pointer"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700" /></div>
          <span className="relative bg-slate-800 px-3 text-xs text-slate-400">ou conecte-se com</span>
        </div>

        <button
          type="button"
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-700/60 border border-slate-700 text-white text-sm font-medium py-2.5 rounded-xl transition cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 10.5 0 12s.6 2.8 1.6 4.8l3.7-2.1z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.9C3.5 19.8 7.4 23 12 23z" />
          </svg>
          Continuar com Google
        </button>
      </div>
    </div>
  );
}