import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary font-bold">
        Loading...
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'STORE_OWNER') {
      return <Navigate to="/store" replace />;
    } else {
      return <Navigate to="/app" replace />;
    }
  }

  return children;
};

export default PublicRoute;
