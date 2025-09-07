import { useEffect } from 'react';
import useAuthStore from '../context/authStore';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    initializeAuth,
    updateUser,
    clearError,
    isAdmin,
    isSeller,
    isBuyer,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAdmin: isAdmin(),
    isSeller: isSeller(),
    isBuyer: isBuyer(),
  };
};
