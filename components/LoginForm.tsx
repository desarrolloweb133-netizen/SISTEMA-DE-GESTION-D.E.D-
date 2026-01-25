import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { login } from '../services/authService';
import { User } from '../types';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  onCancel: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, error: loginError } = await login(email, password);

      if (loginError || !user) {
        setError(loginError || 'Error al iniciar sesión');
        setLoading(false);
        return;
      }

      onLoginSuccess(user);
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 bg-[#f8fafc] overflow-hidden relative font-sans">
      {/* Background blobs removed to avoid scroll/overflow issues on smaller screens */}

      <div className="w-full max-w-[850px] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(65,64,66,0.06)] overflow-hidden border border-gray-100 z-10 animate-fade-in">

        {/* Left Side: Brand Panel */}
        <div className="hidden md:flex md:w-[42%] bg-[#00ADEF] p-10 flex-col justify-between text-white relative">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="mb-6 transform -rotate-6">
              <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-2xl p-3">
                <img src="/ded_logo.png" alt="DED Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-4xl font-black leading-tight mb-2 tracking-tighter">
              Gestión <br />
              <span className="text-white">DED</span>
            </h1>
            <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              Escuela Dominical
            </p>
            <p className="text-white/90 text-base font-medium leading-relaxed">
              Simplifica el registro y seguimiento de tu congregación con nuestra plataforma premium.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-[1.5rem] p-6 border border-white/20 shadow-xl">
              <p className="text-xs font-bold italic text-white/90 mb-3 leading-relaxed">
                "Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él."
              </p>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Proverbios 22:6</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 md:hidden justify-center">
              <div className="w-10 h-10 bg-white rounded-[1rem] flex items-center justify-center shadow-md p-1.5 border border-blue-50">
                <img src="/ded_logo.png" alt="DED Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-xl font-black tracking-tighter text-[#00ADEF]">D.E.D</h2>
            </div>
            <h2 className="text-3xl font-black text-[#414042] mb-1.5 tracking-tight">Bienvenido</h2>
            <p className="text-[#414042]/50 font-bold uppercase text-[9px] tracking-[0.2em] ml-1">Acceso al sistema</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/50 border-l-4 border-[#BE1E2D] rounded-xl text-[#BE1E2D] text-[13px] animate-fade-in flex items-center gap-3 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#BE1E2D] animate-pulse"></div>
              <p className="font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-[#414042]/40 uppercase tracking-widest ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-300 group-focus-within:text-[#00ADEF] transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-6 py-3.5 bg-gray-50/50 border border-gray-200 rounded-[1.2rem] text-[#414042] font-bold text-sm focus:ring-4 focus:ring-[#00ADEF]/10 focus:bg-white focus:border-[#00ADEF] transition-all outline-none shadow-sm"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[9px] font-black text-[#414042]/40 uppercase tracking-widest">
                  Contraseña
                </label>
                <button type="button" className="text-[9px] font-black text-[#00ADEF] hover:text-[#D9DF21] transition-colors uppercase tracking-widest">
                  ¿Recuperar?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-300 group-focus-within:text-[#00ADEF] transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-[1.2rem] text-[#414042] font-bold text-sm focus:ring-4 focus:ring-[#00ADEF]/10 focus:bg-white focus:border-[#00ADEF] transition-all outline-none shadow-sm"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-300 hover:text-[#00ADEF] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-[#00ADEF] hover:bg-[#0096cf] text-white py-5 rounded-[1.2rem] font-black text-[13px] shadow-xl shadow-blue-100/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 uppercase tracking-[0.2em]"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar al Sistema</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </form>

          <footer className="mt-10 text-center text-[8px] text-[#414042]/20 font-black uppercase tracking-[0.3em]">
            &copy; 2026 Escuela Dominical • Excelencia D.E.D
          </footer>
        </div>
      </div>
    </div>
  );
};