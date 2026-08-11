import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/firebaseService';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6 text-slate-900 font-sans">
        <div className="p-8 bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] text-center space-y-3 max-w-sm w-full">
          <div className="font-brand font-black text-xl uppercase tracking-wider text-[#121212]">
            Verifying Security...
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest animate-pulse">
            Authenticating Session Credentials
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};