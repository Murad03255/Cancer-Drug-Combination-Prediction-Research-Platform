import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('synergionco_token');
  const user = localStorage.getItem('synergionco_user');
  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to access research tools.', {
        id: 'auth-required', // prevents duplicate toast spam
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
