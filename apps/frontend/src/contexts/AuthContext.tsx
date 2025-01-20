import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('jwt_token');
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem('jwt_token');
      setToken(storedToken);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('jwt_token', newToken);
    } else {
      localStorage.removeItem('jwt_token');
    }
    setToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ token, setToken: updateToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 