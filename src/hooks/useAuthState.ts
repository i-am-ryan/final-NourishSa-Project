import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAuthState = () => {
  const { user, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  return {
    isAuthenticated,
    user,
    loading,
    isSignedIn: isAuthenticated,
  };
}; 