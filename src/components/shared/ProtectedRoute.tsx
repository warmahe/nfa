import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/firebaseService';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-20 font-black uppercase text-center">Verifying Security...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};