
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    import('../api/axiosClient').then(m =>
      m.default.get('/auth/me')
        .then(() => {
          setIsLoggedIn(true);
          setChecking(false);
        })
        .catch(() => {
          setIsLoggedIn(false);
          setChecking(false);
        })
    );
  }, []);

  if (checking) return null;
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
