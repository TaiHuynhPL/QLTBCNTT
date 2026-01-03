
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

const ProtectedRouteContent = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ProtectedRoute = ({ children }) => {
  return (
    <AuthProvider>
      <ProtectedRouteContent>{children}</ProtectedRouteContent>
    </AuthProvider>
  );
};

export default ProtectedRoute;
