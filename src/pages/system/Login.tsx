import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/firebaseService';
import { Lock, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginAdmin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError("INVALID CREDENTIALS. ACCESS DENIED.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6 nfa-texture">
      <div className="w-full max-w-md bg-white border-[4px] border-[#121212] p-8 md:p-12 shadow-[12px_12px_0_0_#121212]">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-[#121212] text-[#F4BF4B] p-4 mb-6 rotate-45 border-2 border-[#121212]">
             <Lock size={32} className="-rotate-45" />
          </div>
          <h1 className="font-brand font-black text-4xl uppercase tracking-tighter">ADMIN LOGIN</h1>
          <p className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] text-gray-400 mt-2">RESTRICTED ACCESS AREA</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-black text-[10px] uppercase tracking-widest mb-2">IDENTIFIER</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border-2 border-[#121212] outline-none focus:bg-[#F4BF4B]/10 font-bold" 
              placeholder="EMAIL ADDRESS"
            />
          </div>

          <div>
            <label className="block font-black text-[10px] uppercase tracking-widest mb-2">SECURITY KEY</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-[#121212] outline-none focus:bg-[#F4BF4B]/10 font-bold" 
              placeholder="PASSWORD"
            />
          </div>

          {error && (
            <div className="bg-red-600 text-white p-3 text-[10px] font-black uppercase text-center tracking-widest">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-[#121212] text-[#F4BF4B] py-5 font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-[6px_6px_0_0_#9E1B1D] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            AUTHORIZE ACCESS <ArrowRight size={18}/>
          </button>
        </form>
      </div>
    </div>
  );
};